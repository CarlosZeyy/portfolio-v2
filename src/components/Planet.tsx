import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type PlanetVariant = "moon" | "gyro" | "rings" | "lattice";

/**
 * Raio do corpo do planeta em unidades de mundo (a geometria é unitária).
 * É a ÚNICA medida absoluta do sistema: halo, anéis, hitbox, label e a
 * distância final da câmera são múltiplos dela. Mudar a escala do hub é mudar
 * este número.
 */
export const PLANET_RADIUS = 0.28;

/** Maior extensão de qualquer variante (os anéis), em raios. */
export const PLANET_MAX_EXTENT = 2.35;

/**
 * Distância câmera -> planeta no zoom máximo. Em raios, para o planeta ocupar
 * a mesma fração da tela em qualquer escala.
 */
export const PLANET_CLOSE_DISTANCE = PLANET_RADIUS * 11.25;

// Casca de atmosfera: raio relativo ao corpo.
const ATMOSPHERE_SCALE = 1.35;
// Farol: halo largo que torna o planeta localizável na escala do hub (onde o
// corpo tem poucos pixels) e se apaga no close para não lavar os detalhes.
const BEACON_SCALE = 3.4;
// O farol está pleno a esta distância da câmera (hub) e some nesta (close-up).
const BEACON_FADE_RANGE = [PLANET_CLOSE_DISTANCE * 1.15, PLANET_CLOSE_DISTANCE * 2.2];

// Numa casca de raio `scale`, -N.V na face de trás vale sqrt(1 - 1/scale²)
// exatamente sobre o limbo do planeta. Dividir por isso normaliza o halo.
const rimAtLimb = (scale: number) => Math.sqrt(1 - 1 / scale ** 2);
const HOVER_DAMPING = 6;
const MAX_DELTA = 0.1;

const RING_INNER = 1.45;
const RING_OUTER = PLANET_MAX_EXTENT;

interface PlanetStyle {
  /** Cor das faixas escuras / lado noturno. */
  deep: string;
  /** Cor das faixas claras. */
  band: string;
  /** Cor do brilho de borda e da atmosfera. */
  glow: string;
  bandFrequency: number;
  spin: number;
  /** 0 = gigante gasoso (faixas), 1 = globo holográfico (grade lat/long). */
  grid: number;
}

// Cada planeta ecoa uma cor da nébula: teal, violeta, o âmbar do núcleo e o
// rosa que fica entre os dois últimos no círculo cromático.
const STYLES: Record<PlanetVariant, PlanetStyle> = {
  moon: { deep: "#042f2e", band: "#2dd4bf", glow: "#5eead4", bandFrequency: 9, spin: 0.25, grid: 0 },
  gyro: { deep: "#1f0a1a", band: "#f472b6", glow: "#fbcfe8", bandFrequency: 0, spin: 0.12, grid: 1 },
  rings: { deep: "#1e1b4b", band: "#a78bfa", glow: "#c4b5fd", bandFrequency: 6, spin: 0.18, grid: 0 },
  lattice: { deep: "#1c1003", band: "#f59e0b", glow: "#fde68a", bandFrequency: 14, spin: 0.35, grid: 0 },
};

// Geometrias unitárias compartilhadas pelos três planetas (corpo, atmosfera e
// lua usam a mesma esfera, em escalas diferentes). Criadas uma única vez no
// módulo; por isso os meshes usam dispose={null}, senão o R3F as descartaria
// quando o primeiro planeta desmontasse.
const SPHERE_GEOMETRY = new THREE.SphereGeometry(1, 48, 48);
const RING_GEOMETRY = new THREE.RingGeometry(RING_INNER, RING_OUTER, 128, 1);
// Círculo unitário para <lineLoop>. Traços finos são LINHAS, não torus: linha
// tem sempre 1px em qualquer distância, enquanto um tubo fino fica sub-pixel
// de longe e serrilha/pisca (o MSAA do composer está desligado).
const CIRCLE_GEOMETRY = new THREE.BufferGeometry().setFromPoints(
  Array.from({ length: 128 }, (_, i) => {
    const angle = (i / 128) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
  }),
);
const LATTICE_GEOMETRY = new THREE.IcosahedronGeometry(1.65, 1);
const OUTER_LATTICE_GEOMETRY = new THREE.IcosahedronGeometry(2.15, 0);

// A "estrela" do sistema é o núcleo da galáxia, na origem do mundo. A direção
// da luz sai do próprio modelMatrix (centro do planeta -> origem), sem
// uniform: conforme o planeta orbita, o lado iluminado gira sozinho e ele
// passa de "cheio" (atrás do núcleo) a "crescente" (entre a câmera e o núcleo).
const lightingVertex = /* glsl */ `
  varying vec3 vObjectPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec3 vCenter;
  varying float vWorldRadius;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vObjectPosition = position;
    vWorldPosition = world.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vCenter = modelMatrix[3].xyz;
    vWorldRadius = length(modelMatrix[0].xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const bodyFragment = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uBand;
  uniform vec3 uGlow;
  uniform float uBandFrequency;
  uniform float uHover;
  uniform float uGrid;

  varying vec3 vObjectPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec3 vCenter;

  // Linha antialiased em coordenada periódica: distância até o inteiro mais
  // próximo, comparada com a largura de 1 pixel naquela coordenada (fwidth).
  // É o que mantém a grade nítida de perto e sem moiré de longe.
  float gridLine(float coordinate) {
    float distanceToLine = abs(fract(coordinate - 0.5) - 0.5);
    return 1.0 - smoothstep(0.0, fwidth(coordinate) * 1.6, distanceToLine);
  }

  void main() {
    vec3 p = normalize(vObjectPosition);
    vec3 normal = normalize(vWorldNormal);
    vec3 toLight = normalize(-vCenter);
    vec3 toCamera = normalize(cameraPosition - vWorldPosition);

    // Faixas de gigante gasoso: seno na latitude, com a própria latitude
    // entortada por senos na longitude -> turbulência sem textura nem noise.
    float warp = sin(p.x * 7.0 + p.z * 3.0) * 0.08 + sin(p.z * 11.0) * 0.04;
    float bands = smoothstep(-0.5, 0.5, sin((p.y + warp) * uBandFrequency));
    vec3 surface = mix(uDeep, uBand, bands * 0.85);

    // Terminador suave (smoothstep no lugar do max(dot, 0) seco) + uma luz
    // ambiente mínima para o lado noturno não virar um buraco preto.
    float daylight = smoothstep(-0.3, 0.85, dot(normal, toLight));
    vec3 color = surface * (0.12 + daylight * 0.62);

    // Variante holográfica: meridianos e paralelos. 12 e 8 são pares de
    // propósito: a emenda do atan (lon = ±pi) cai exatamente em cima de uma
    // linha, então a descontinuidade do fwidth ali fica escondida. Os
    // meridianos somem perto dos polos, onde convergem num borrão.
    if (uGrid > 0.5) {
      float longitude = atan(p.z, p.x) / 6.2831853 * 12.0;
      float latitude = asin(clamp(p.y, -1.0, 1.0)) / 3.1415927 * 8.0;
      float meridians = gridLine(longitude) * smoothstep(0.97, 0.75, abs(p.y));
      float lines = max(meridians, gridLine(latitude));
      color = uDeep * (0.5 + daylight) + uBand * lines * (0.55 + daylight * 0.5 + uHover * 0.5);
    }

    // Fresnel: 1 - N.V vale 0 no centro do disco e 1 na borda. É o "fio de
    // luz" de atmosfera, que também é o que o Bloom pega para fazer o halo.
    float fresnel = pow(1.0 - max(dot(normal, toCamera), 0.0), 2.6);
    color += uGlow * fresnel * (0.3 + daylight * 0.35 + uHover * 0.45);

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// Halo (atmosfera e farol): casca maior, só faces de trás, aditiva. O corpo
// (opaco) cobre o miolo via depth test, então sobra apenas o anel entre o
// limbo e a casca.
const haloFragment = /* glsl */ `
  uniform vec3 uGlow;
  uniform float uHover;
  uniform float uRimAtLimb;
  uniform float uPower;
  uniform float uStrength;
  // x = distância da câmera em que o halo começa a aparecer, y = pleno.
  uniform vec2 uFadeRange;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec3 vCenter;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 toCamera = normalize(cameraPosition - vWorldPosition);

    // Na face de trás, -N.V vai de 0 (borda da casca) a 1 (centro). Dividido
    // pelo valor no limbo, o halo vale 1 colado no planeta e 0 na borda
    // externa: degradê contínuo, sem contorno duro.
    float rim = clamp(-dot(normal, toCamera) / uRimAtLimb, 0.0, 1.0);
    float halo = pow(rim, uPower);

    float daylight = smoothstep(-0.5, 0.8, dot(normal, normalize(-vCenter)));
    float distanceFade = smoothstep(uFadeRange.x, uFadeRange.y, distance(cameraPosition, vCenter));
    float intensity = halo * uStrength * (0.4 + daylight * 0.6) * (1.0 + uHover * 0.6) * distanceFade;

    gl_FragColor = vec4(uGlow, intensity);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const ringFragment = /* glsl */ `
  uniform vec3 uInner;
  uniform vec3 uOuter;
  uniform float uHover;

  varying vec3 vObjectPosition;
  varying vec3 vWorldPosition;
  varying vec3 vCenter;
  varying float vWorldRadius;

  void main() {
    float t = (length(vObjectPosition.xy) - ${RING_INNER.toFixed(2)}) / ${(RING_OUTER - RING_INNER).toFixed(2)};

    // Sulcos: produto de dois senos de frequências diferentes dá faixas
    // irregulares; mais uma "divisão de Cassini" e bordas esfumadas.
    float grooves = 0.55 + 0.45 * sin(t * 46.0) * sin(t * 13.0 + 1.3);
    float gap = smoothstep(0.0, 0.035, abs(t - 0.6));
    float edges = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.8, t);

    // Sombra do planeta sobre o anel. O fragmento está na sombra se fica do
    // lado oposto à luz (along < 0) e a menos de um raio do eixo planeta-luz.
    vec3 toLight = normalize(-vCenter);
    vec3 fromCenter = vWorldPosition - vCenter;
    float along = dot(fromCenter, toLight);
    float axisDistance = length(fromCenter - toLight * along);
    float lit = max(step(0.0, along), smoothstep(0.9, 1.1, axisDistance / vWorldRadius));

    float alpha = grooves * gap * edges * (0.08 + lit * 0.4) * (1.0 + uHover * 0.4);
    gl_FragColor = vec4(mix(uInner, uOuter, t), alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

interface PlanetProps {
  variant: PlanetVariant;
  hovered: boolean;
}

export default function Planet({ variant, hovered }: PlanetProps) {
  const style = STYLES[variant];

  const bodyRef = useRef<THREE.Mesh>(null);
  const bodyMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const atmosphereMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const beaconMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const ringMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const latticeMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  // Peça que gira por conta própria em cada variante: pivô da lua ou a treliça.
  const spinnerRef = useRef<THREE.Group>(null);
  const counterSpinnerRef = useRef<THREE.Group>(null);
  const hover = useRef(0);

  const uniforms = useMemo(() => {
    const glow = new THREE.Color(style.glow);
    return {
      body: {
        uDeep: { value: new THREE.Color(style.deep) },
        uBand: { value: new THREE.Color(style.band) },
        uGlow: { value: glow },
        uBandFrequency: { value: style.bandFrequency },
        uGrid: { value: style.grid },
        uHover: { value: 0 },
      },
      atmosphere: {
        uGlow: { value: glow },
        uHover: { value: 0 },
        uRimAtLimb: { value: rimAtLimb(ATMOSPHERE_SCALE) },
        uPower: { value: 2.4 },
        uStrength: { value: 0.5 },
        uFadeRange: { value: new THREE.Vector2(-1, 0) }, // sempre visível
      },
      beacon: {
        uGlow: { value: glow },
        uHover: { value: 0 },
        uRimAtLimb: { value: rimAtLimb(BEACON_SCALE) },
        uPower: { value: 3.2 },
        uStrength: { value: 0.8 },
        uFadeRange: { value: new THREE.Vector2(...BEACON_FADE_RANGE) },
      },
      ring: {
        uInner: { value: new THREE.Color(style.band) },
        uOuter: { value: new THREE.Color("#2dd4bf") },
        uHover: { value: 0 },
      },
    };
  }, [style]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_DELTA);

    hover.current = THREE.MathUtils.damp(
      hover.current,
      hovered ? 1 : 0,
      HOVER_DAMPING,
      delta,
    );
    // Via ref do material (e não pelo objeto do useMemo): é o uniform que
    // está de fato na GPU, e não briga com as regras de imutabilidade do React.
    for (const material of [
      bodyMaterialRef.current,
      atmosphereMaterialRef.current,
      beaconMaterialRef.current,
      ringMaterialRef.current,
    ]) {
      if (material) material.uniforms.uHover.value = hover.current;
    }
    if (latticeMaterialRef.current) {
      latticeMaterialRef.current.opacity = 0.35 + hover.current * 0.45;
    }

    if (bodyRef.current) bodyRef.current.rotation.y += delta * style.spin;
    if (spinnerRef.current) spinnerRef.current.rotation.y += delta * 0.6;
    if (counterSpinnerRef.current) {
      counterSpinnerRef.current.rotation.y -= delta * 0.25;
      counterSpinnerRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <group scale={PLANET_RADIUS}>
      <mesh ref={bodyRef} geometry={SPHERE_GEOMETRY} dispose={null}>
        <shaderMaterial
          ref={bodyMaterialRef}
          vertexShader={lightingVertex}
          fragmentShader={bodyFragment}
          uniforms={uniforms.body}
        />
      </mesh>

      <mesh geometry={SPHERE_GEOMETRY} scale={ATMOSPHERE_SCALE} dispose={null}>
        <shaderMaterial
          ref={atmosphereMaterialRef}
          vertexShader={lightingVertex}
          fragmentShader={haloFragment}
          uniforms={uniforms.atmosphere}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>

      <mesh geometry={SPHERE_GEOMETRY} scale={BEACON_SCALE} dispose={null}>
        <shaderMaterial
          ref={beaconMaterialRef}
          vertexShader={lightingVertex}
          fragmentShader={haloFragment}
          uniforms={uniforms.beacon}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>

      {variant === "moon" && (
        <group rotation={[0.45, 0, 0.3]}>
          <lineLoop geometry={CIRCLE_GEOMETRY} scale={2.3} dispose={null}>
            <lineBasicMaterial
              color={style.glow}
              transparent
              opacity={0.35}
              depthWrite={false}
            />
          </lineLoop>
          <group ref={spinnerRef}>
            <mesh
              geometry={SPHERE_GEOMETRY}
              position={[2.3, 0, 0]}
              scale={0.17}
              dispose={null}
            >
              <meshBasicMaterial color="#ccfbf1" />
            </mesh>
          </group>
        </group>
      )}

      {/* Esfera armilar: três aros em planos diferentes. O de fora e o do meio
          giram em sentidos opostos (spinner / counterSpinner, os mesmos refs
          das outras variantes); o interno fica parado como referência. */}
      {variant === "gyro" && (
        <>
          <group ref={spinnerRef}>
            <lineLoop
              geometry={CIRCLE_GEOMETRY}
              scale={2.25}
              rotation={[1.1, 0, 0.35]}
              dispose={null}
            >
              <lineBasicMaterial color={style.glow} transparent opacity={0.7} depthWrite={false} />
            </lineLoop>
          </group>
          <group ref={counterSpinnerRef}>
            <lineLoop
              geometry={CIRCLE_GEOMETRY}
              scale={1.9}
              rotation={[0.5, 0, -0.9]}
              dispose={null}
            >
              <lineBasicMaterial color={style.band} transparent opacity={0.6} depthWrite={false} />
            </lineLoop>
          </group>
          <lineLoop
            geometry={CIRCLE_GEOMETRY}
            scale={1.55}
            rotation={[0.2, 0, 0.15]}
            dispose={null}
          >
            <lineBasicMaterial color={style.band} transparent opacity={0.35} depthWrite={false} />
          </lineLoop>
        </>
      )}

      {variant === "rings" && (
        <mesh
          geometry={RING_GEOMETRY}
          rotation={[-Math.PI / 2 + 0.42, 0, 0.22]}
          dispose={null}
        >
          <shaderMaterial
            ref={ringMaterialRef}
            vertexShader={lightingVertex}
            fragmentShader={ringFragment}
            uniforms={uniforms.ring}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}

      {variant === "lattice" && (
        <>
          <group ref={spinnerRef}>
            <mesh geometry={LATTICE_GEOMETRY} dispose={null}>
              <meshBasicMaterial
                ref={latticeMaterialRef}
                color={style.glow}
                wireframe
                transparent
                opacity={0.35}
                depthWrite={false}
              />
            </mesh>
          </group>
          <group ref={counterSpinnerRef}>
            <mesh geometry={OUTER_LATTICE_GEOMETRY} dispose={null}>
              <meshBasicMaterial
                color={style.band}
                wireframe
                transparent
                opacity={0.16}
                depthWrite={false}
              />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
}
