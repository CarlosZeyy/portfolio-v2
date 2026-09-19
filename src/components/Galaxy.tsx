"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GALAXY_RADIUS = 15;
const ARMS = 3;
const SPIN = 0.5; // quanto o braço enrola por unidade de raio
const BASE_TILT = Math.PI * 0.25;
const ROTATION_SPEED = 0.05;

const PARALLAX_STRENGTH = 0.15;
const PARALLAX_DAMPING = 2.5;
const INTENSITY_DAMPING = 2;
const MAX_DELTA = 0.1;

// Rampa de cor por raio normalizado (0 = núcleo, 1 = borda).
const COLOR_STOPS: [number, string][] = [
  [0.0, "#fffaf0"], // núcleo incandescente
  [0.1, "#ffd591"], // halo amarelado
  [0.3, "#14b8a6"], // teal
  [0.62, "#8b5cf6"], // roxo profundo
  [1.0, "#3b0764"], // violeta
];

/**
 * A nébula é UM draw call com quatro populações de sprites. O que faz parecer
 * fumaça não é a textura de cada sprite, e sim milhares de gaussianas macias
 * somadas (blending aditivo) em escalas bem diferentes:
 *  - bulge:  o bulbo quente do núcleo
 *  - dust:   poucas, enormes e quase transparentes -> o volume/névoa
 *  - clouds: médias -> os "tufos" que desenham os braços
 *  - grains: muitas e minúsculas -> o brilho fino, para não virar borrão
 * Os tamanhos grandes custam fill-rate, então a contagem cai conforme o
 * tamanho sobe: ~10x de overdraw no total, viável em GPU integrada.
 */
interface ParticleLayer {
  count: number;
  /** Diâmetro do sprite em unidades de mundo [min, max]. */
  size: [number, number];
  alpha: [number, number];
  /** Fração do raio da galáxia que a população ocupa. */
  extent: number;
  /** > 1 concentra a população no núcleo. */
  radiusPower: number;
  /** Dispersão em torno da linha do braço. */
  scatter: number;
  /** Espessura vertical do disco. */
  thickness: number;
  /** Amplitude da deriva, em unidades de mundo. */
  drift: number;
  /** 0 = brilho fixo, 1 = cintila até apagar. */
  twinkle: number;
}

const LAYERS: ParticleLayer[] = [
  // bulge: o bulbo incandescente. Camada própria porque o brilho do núcleo
  // tem que vir de poucos sprites largos (degradê suave), não do empilhamento
  // de milhares de grãos (que satura num disco branco chapado).
  { count: 90, extent: 0.11, size: [0.9, 2.6], alpha: [0.05, 0.13], radiusPower: 1.6, scatter: 0.5, thickness: 0.5, drift: 0.08, twinkle: 0 },
  { count: 300, extent: 1, size: [2.0, 4.4], alpha: [0.016, 0.04], radiusPower: 0.9, scatter: 1.2, thickness: 0.5, drift: 0.45, twinkle: 0 },
  { count: 6000, extent: 1, size: [0.4, 1.2], alpha: [0.014, 0.045], radiusPower: 1.05, scatter: 0.8, thickness: 0.4, drift: 0.16, twinkle: 0 },
  { count: 19000, extent: 1, size: [0.035, 0.1], alpha: [0.35, 0.9], radiusPower: 1.2, scatter: 1.0, thickness: 0.5, drift: 0.04, twinkle: 0.45 },
];

// Pano de fundo: casca esférica em volta de tudo. O disco é fino e inclinado,
// então existem ângulos de câmera (zoom num planeta do lado de trás) que
// atravessam o disco e dão no vazio. A casca garante profundidade em
// qualquer direção: estrelas distantes + manchas enormes de névoa colorida.
const BACKDROP = {
  radius: [22, 48] as [number, number],
  stars: { count: 2600, size: [0.12, 0.34] as [number, number], alpha: [0.25, 0.85] as [number, number] },
  haze: { count: 70, size: [11, 20] as [number, number], alpha: [0.012, 0.03] as [number, number] },
  colors: ["#8b5cf6", "#3b0764", "#14b8a6", "#c4b5fd", "#fff4dc"],
};

const PARTICLE_COUNT =
  LAYERS.reduce((total, layer) => total + layer.count, 0) +
  BACKDROP.stars.count +
  BACKDROP.haze.count;

// PRNG com seed (mulberry32): a nébula nasce idêntica em todo carregamento,
// então dá para fazer direção de arte em cima de uma forma que não muda.
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createNebulaGeometry() {
  const random = createRandom(7);
  const signedCubic = () =>
    Math.pow(random(), 3) * (random() < 0.5 ? -1 : 1);
  const range = ([min, max]: [number, number]) => min + random() * (max - min);

  const stops = COLOR_STOPS.map(
    ([at, hex]) => [at, new THREE.Color(hex)] as const,
  );
  const color = new THREE.Color();

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  // x = tamanho, y = alpha, z = fase (0..1), w = cintilação
  const params = new Float32Array(PARTICLE_COUNT * 4);
  const drifts = new Float32Array(PARTICLE_COUNT);

  let i = 0;
  for (const layer of LAYERS) {
    for (let n = 0; n < layer.count; n++, i++) {
      const radius =
        Math.pow(random(), layer.radiusPower) * GALAXY_RADIUS * layer.extent;
      const armAngle = ((n % ARMS) / ARMS) * Math.PI * 2 + radius * SPIN;

      // Distribuição cúbica: a maioria cola no braço, poucas escapam longe.
      // A dispersão cresce com o raio, abrindo os braços nas pontas.
      const spread = layer.scatter * (0.35 + radius * 0.3);
      const offsetX = signedCubic() * spread;
      const offsetZ = signedCubic() * spread;
      const offsetY = signedCubic() * layer.thickness * (0.6 + radius * 0.22);

      positions[i * 3] = Math.cos(armAngle) * radius + offsetX;
      positions[i * 3 + 1] = offsetY;
      positions[i * 3 + 2] = Math.sin(armAngle) * radius + offsetZ;

      // Cor pelo raio + ruído, e quem está FORA do braço puxa para o roxo:
      // braços teal com névoa violeta entre eles, em vez de anéis perfeitos.
      const offArm = Math.hypot(offsetX, offsetZ) / (spread + 1e-4);
      const t = THREE.MathUtils.clamp(
        radius / GALAXY_RADIUS + (random() - 0.5) * 0.16 + offArm * 0.22,
        0,
        1,
      );
      let s = 1;
      while (s < stops.length - 1 && t > stops[s][0]) s++;
      const [fromAt, from] = stops[s - 1];
      const [toAt, to] = stops[s];
      color.lerpColors(from, to, (t - fromAt) / (toAt - fromAt));

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Longe do núcleo a densidade cai; sprites maiores fecham os buracos
      // para a borda ler como névoa contínua e não como discos soltos.
      params[i * 4] = range(layer.size) * (1 + (radius / GALAXY_RADIUS) * 0.9);
      // Exposição por raio: o miolo acumula centenas de sprites no mesmo
      // pixel (satura em branco chapado) e a borda precisa morrer no preto
      // do espaço, não virar um véu roxo cobrindo a tela.
      const normalizedRadius = radius / GALAXY_RADIUS;
      const exposure =
        THREE.MathUtils.lerp(0.3, 1, THREE.MathUtils.smoothstep(radius, 0, 3)) *
        THREE.MathUtils.lerp(1, 0.3, normalizedRadius * normalizedRadius);
      params[i * 4 + 1] = range(layer.alpha) * exposure;
      params[i * 4 + 2] = random();
      params[i * 4 + 3] = layer.twinkle;
      drifts[i] = layer.drift * (0.5 + random());
    }
  }

  const backdropColors = BACKDROP.colors.map((hex) => new THREE.Color(hex));
  for (const [kind, twinkle] of [
    [BACKDROP.stars, 0.5],
    [BACKDROP.haze, 0],
  ] as const) {
    for (let n = 0; n < kind.count; n++, i++) {
      // Ponto uniforme na esfera: z uniforme em [-1, 1] + ângulo uniforme.
      const z = random() * 2 - 1;
      const angle = random() * Math.PI * 2;
      const ring = Math.sqrt(1 - z * z);
      const distance = range(BACKDROP.radius);

      positions[i * 3] = Math.cos(angle) * ring * distance;
      positions[i * 3 + 1] = z * distance;
      positions[i * 3 + 2] = Math.sin(angle) * ring * distance;

      color.copy(backdropColors[Math.floor(random() * backdropColors.length)]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      params[i * 4] = range(kind.size);
      params[i * 4 + 1] = range(kind.alpha);
      params[i * 4 + 2] = random();
      params[i * 4 + 3] = twinkle;
      drifts[i] = 0;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aParams", new THREE.BufferAttribute(params, 4));
  geometry.setAttribute("aDrift", new THREE.BufferAttribute(drifts, 1));
  return geometry;
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  // Pixels que 1 unidade de mundo ocupa a 1 unidade de distância.
  uniform float uPixelScale;
  uniform float uMaxPointSize;
  uniform float uIntensity;

  attribute vec3 aColor;
  attribute vec4 aParams;
  attribute float aDrift;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float size = aParams.x;
    float phase = aParams.z * 6.2831853;
    vec3 p = position;

    // Respiração diferencial: o miolo adianta e atrasa em relação à borda.
    // É um seno (limitado), não uma velocidade angular por raio — esta
    // enrolaria os braços sem parar até desmanchar a espiral.
    float core = 1.0 - smoothstep(0.0, ${GALAXY_RADIUS.toFixed(1)}, length(p.xz));
    float twist = sin(uTime * 0.07) * 0.14 * core;
    float c = cos(twist);
    float s = sin(twist);
    p.xz = mat2(c, s, -s, c) * p.xz;

    // Deriva: três senos com frequências que não casam entre si e fase
    // própria por partícula -> cada tufo vaga num caminho que nunca se
    // repete em sincronia com o vizinho. Roda na GPU: zero custo de CPU.
    p += aDrift * vec3(
      sin(uTime * 0.21 + phase),
      sin(uTime * 0.17 + phase * 1.7),
      cos(uTime * 0.19 + phase * 2.3)
    );

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    float dist = -mvPosition.z;

    // Atenuação perspectiva feita à mão (ShaderMaterial não tem sizeAttenuation).
    float pixels = size * uPixelScale / dist;
    gl_PointSize = clamp(pixels, 1.0, uMaxPointSize);

    // No zoom (e no modo 2D) a câmera entra no disco, e um sprite colado na
    // lente cobriria a tela inteira: estoura na cara do usuário e explode o
    // fill-rate. O fade é por COBERTURA (fração da altura da tela que o
    // sprite ocupa), com teto conforme o porte: a poeira pode ficar enorme
    // porque são poucas centenas; nuvens e grãos são milhares, então se
    // dissolvem bem antes. O custo por frame fica limitado em qualquer câmera.
    float coverage = pixels / (uMaxPointSize * 2.0);
    float maxCoverage = mix(0.07, 0.6, smoothstep(0.1, 2.2, size));
    float nearFade = 1.0 - smoothstep(maxCoverage * 0.5, maxCoverage, coverage);

    float twinkle = 1.0 - aParams.w * (0.5 + 0.5 * sin(uTime * 1.3 + phase * 7.0));

    vColor = aColor;
    vAlpha = aParams.y * nearFade * twinkle * uIntensity;
    gl_Position = projectionMatrix * mvPosition;

    // Sprite invisível ainda é rasterizado e ainda custa fill-rate (justo os
    // maiores da tela). Jogar o vértice para fora do clip space descarta o
    // ponto antes do fragment shader.
    if (vAlpha < 0.002) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float d2 = dot(uv, uv);
    if (d2 > 1.0) discard;

    // (1 - r²)³: um "sino" que chega a zero na borda com derivada zero, então
    // não existe contorno de sprite. É o radial-gradient de canvas, mas
    // procedural: sem textura, sem sqrt e sem exp por fragmento.
    float falloff = 1.0 - d2;
    falloff *= falloff * falloff;

    gl_FragColor = vec4(vColor, falloff * vAlpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

interface GalaxyProps {
  /** Brilho global: 1 = protagonista (hub 3D), ~0.3 = fundo atrás de texto. */
  intensity?: number;
}

export default function Galaxy({ intensity = 1 }: GalaxyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  // Ponteiro em NDC (-1..1) lido da window, não do state.pointer do R3F: no
  // modo 2D o canvas é pointer-events-none e, no 3D, o painel de conteúdo
  // fica por cima dele — nos dois casos o R3F para de receber o mouse.
  const pointer = useRef({ x: 0, y: 0 });

  const geometry = useMemo(() => createNebulaGeometry(), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelScale: { value: 1 },
      uMaxPointSize: { value: 320 },
      uIntensity: { value: 0 },
    }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame((state, rawDelta) => {
    const group = groupRef.current;
    const points = pointsRef.current;
    const material = materialRef.current;
    if (!group || !points || !material) return;

    const delta = Math.min(rawDelta, MAX_DELTA);

    material.uniforms.uTime.value += delta;
    // projectionMatrix[1][1] = 1 / tan(fov / 2); vezes meia altura do buffer
    // dá quantos pixels 1 unidade ocupa a 1 unidade de distância.
    const bufferHeight = state.size.height * state.viewport.dpr;
    material.uniforms.uPixelScale.value =
      state.camera.projectionMatrix.elements[5] * bufferHeight * 0.5;
    material.uniforms.uMaxPointSize.value = bufferHeight * 0.5;
    // Começa em 0 e é amortecido até o alvo: fade-in na entrada e transição
    // suave de brilho ao alternar entre os modos 2D e 3D.
    material.uniforms.uIntensity.value = THREE.MathUtils.damp(
      material.uniforms.uIntensity.value,
      intensity,
      INTENSITY_DAMPING,
      delta,
    );

    points.rotation.y += delta * ROTATION_SPEED;

    // Parallax: damp(a, b, lambda, dt) = lerp(a, b, 1 - e^(-lambda * dt)).
    // O lerp(a, b, delta * 2) antigo dependia do frame rate e, num frame
    // longo, o fator passava de 1 e a galáxia dava um tranco; o damp converge
    // igual em qualquer fps e nunca ultrapassa o alvo.
    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      BASE_TILT + pointer.current.y * PARALLAX_STRENGTH,
      PARALLAX_DAMPING,
      delta,
    );
    group.rotation.z = THREE.MathUtils.damp(
      group.rotation.z,
      -pointer.current.x * PARALLAX_STRENGTH,
      PARALLAX_DAMPING,
      delta,
    );
  });

  return (
    <group ref={groupRef} rotation={[BASE_TILT, 0, 0]}>
      {/* frustumCulled off: o shader desloca os vértices, então a bounding
          sphere calculada da geometria não é confiável. */}
      <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
