import { Float, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  planetRegistry,
  useOrbitStore,
  type PlanetId,
} from "@/store/useOrbitStore";
import Planet, {
  PLANET_MAX_EXTENT,
  PLANET_RADIUS,
  type PlanetVariant,
} from "./Planet";

// Rigidez (lambda) dos amortecimentos. Quanto maior, mais rápido converge:
// em ~3/lambda segundos o valor já percorreu 95% do caminho até o alvo.
const ORBIT_DAMPING = 6; // freia/retoma a órbita em ~0.5s
const HOVER_SCALE_DAMPING = 10;
// Era 1.6 quando o planeta tinha poucos pixels e precisava "saltar" para dar
// feedback. Com o planeta grande, 1.35 já lê claramente — e mantém o planeta
// com anéis, mesmo ampliado, inteiro dentro da hitbox (ver abaixo).
const HOVER_SCALE = 1.35;

// Tudo em função do raio do planeta, para a usabilidade acompanhar a escala.
// O label fica logo abaixo da maior extensão de qualquer variante (os anéis).
const LABEL_OFFSET = PLANET_RADIUS * PLANET_MAX_EXTENT + 0.17;
// Hitbox = planeta + anéis JÁ ampliados pelo hover + label. Se ela fosse menor
// que o planeta ampliado, o hover piscaria na ponta do anel (sai da hitbox ->
// encolhe -> entra de novo). Não é um múltiplo cego da hitbox antiga (que era
// 6.7x o planeta justamente porque ele era minúsculo): nessa proporção as
// hitboxes de órbitas vizinhas se sobreporiam na tela.
// A folga de 0.45 é para o label: ele tem largura fixa em PIXELS, então nos
// planetas do lado de trás (pequenos na tela) ele fica mais largo que o
// planeta, e sem a folga as pontas do texto ficavam fora da hitbox.
const HIT_RADIUS = PLANET_RADIUS * PLANET_MAX_EXTENT * HOVER_SCALE + 0.45;
// Deslocada para baixo para englobar o label, que é onde o mouse costuma ir.
const HIT_OFFSET_Y = -LABEL_OFFSET * 0.4;

// Teto do delta: ao voltar de uma aba em segundo plano o delta vem enorme
// e os planetas dariam um salto na órbita.
const MAX_DELTA = 0.1;

const LABEL_WRAPPER_STYLE = { pointerEvents: "none" } as const;

interface NavStarProps {
  id: PlanetId;
  variant: PlanetVariant;
  radius: number;
  speed: number;
  angle: number;
  title: string;
}

export default function NavStar({
  id,
  variant,
  radius,
  speed,
  angle,
  title,
}: NavStarProps) {
  const orbitRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Group>(null);

  // TEMPO ACUMULADO: substitui o clock.elapsedTime. O relógio global nunca
  // para, então ao retomar de uma pausa o ângulo (elapsedTime * speed) estaria
  // adiantado em todo o tempo pausado e o planeta teleportaria. Aqui o tempo
  // é integrado por nós — orbitTime += delta * speedFactor — e só avança na
  // proporção em que a órbita está de fato rodando.
  const orbitTime = useRef(0);
  // Multiplicador de velocidade amortecido: 1 = órbita normal, 0 = parada.
  const speedFactor = useRef(1);

  // Seletor booleano: re-renderiza só quando ESTE planeta ganha/perde hover.
  // (zoomProgress muda a cada tick do wheel e é lido só dentro do useFrame.)
  const isHovered = useOrbitStore((state) => state.hoveredPlanetId === id);
  const setHoveredPlanet = useOrbitStore((state) => state.setHoveredPlanet);
  const clearHoveredPlanet = useOrbitStore((state) => state.clearHoveredPlanet);

  useEffect(() => {
    // Registra o grupo que FLUTUA (dentro do Float), não o da órbita: é nele
    // que a câmera mira, então o planeta fica centrado no quadro do zoom
    // mesmo subindo e descendo.
    const planet = planetRef.current;
    if (!planet) return;

    planetRegistry.set(id, planet);
    return () => {
      planetRegistry.delete(id);
      clearHoveredPlanet(id);
    };
  }, [id, clearHoveredPlanet]);

  useEffect(() => {
    if (!isHovered) return;

    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [isHovered]);

  useFrame((_, rawDelta) => {
    const orbit = orbitRef.current;
    const planet = planetRef.current;
    if (!orbit || !planet) return;

    const delta = Math.min(rawDelta, MAX_DELTA);
    // getState() lê o store sem assinar o componente: zero re-render por frame.
    const { hoveredPlanetId, zoomProgress } = useOrbitStore.getState();

    // Velocidade alvo: 0 com qualquer planeta em hover (todos param juntos,
    // pois todos leem o mesmo store). Sem hover ela vale (1 - zoom): no hub
    // é 1 (órbita normal) e, com a câmera colada num planeta, é 0 — assim o
    // planeta não foge do enquadramento se o mouse escapar durante o zoom.
    const targetFactor = hoveredPlanetId !== null ? 0 : 1 - zoomProgress;

    // damp(a, b, lambda, dt) = lerp(a, b, 1 - e^(-lambda * dt)).
    // É o "lerp por frame", mas com o fator corrigido pelo delta, então a
    // frenagem dura o mesmo tempo a 60Hz ou 144Hz. É isso que faz a órbita
    // desacelerar até parar (e reacelerar) em vez de congelar de uma vez.
    speedFactor.current = THREE.MathUtils.damp(
      speedFactor.current,
      targetFactor,
      ORBIT_DAMPING,
      delta,
    );

    orbitTime.current += delta * speedFactor.current;

    const theta = orbitTime.current * speed + angle;
    orbit.position.set(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);

    planet.scale.setScalar(
      THREE.MathUtils.damp(
        planet.scale.x,
        isHovered ? HOVER_SCALE : 1,
        HOVER_SCALE_DAMPING,
        delta,
      ),
    );
  });

  return (
    // A órbita move este grupo; o Float fica DENTRO dele. Com o Float por fora
    // (como era antes), a rotação dele girava o planeta em torno do centro da
    // cena e a posição do mesh não correspondia à posição real no mundo.
    <group ref={orbitRef}>
      {/* Área de hover: esfera invisível e fora do Float. O alvo do raycaster
          fica parado enquanto o planeta flutua, então o hover não pisca; e a
          folga cobre o que o planeta ainda desliza enquanto a órbita freia. */}
      <mesh
        position={[0, HIT_OFFSET_Y, 0]}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHoveredPlanet(id);
        }}
        onPointerOut={() => clearHoveredPlanet(id)}
        // Clique (ou toque) voa direto para a seção. No desktop é um atalho
        // para o hover + scroll; em tela de toque é o ÚNICO jeito, já que lá
        // não existe hover nem roda de mouse.
        onClick={(event) => {
          event.stopPropagation();
          useOrbitStore.getState().enterSection(id);
        }}
      >
        <sphereGeometry args={[HIT_RADIUS, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* Este grupo recebe a escala do hover; o visual mora no <Planet>. */}
        <group ref={planetRef}>
          <Planet variant={variant} hovered={isHovered} />
          {/* O label é DOM por cima do canvas. Se ele capturar o mouse, o R3F
              recebe o pointermove com offsetX/Y relativos ao LABEL (não ao
              canvas), o raio sai torto e o hover se perde bem em cima do
              texto. Tem que ser via `style`: a prop `pointerEvents` do Html
              só é aplicada no modo `transform`. */}
          <Html
            center
            position={[0, -LABEL_OFFSET, 0]}
            style={LABEL_WRAPPER_STYLE}
          >
            <div
              className={`pointer-events-none select-none whitespace-nowrap font-mono text-xl drop-shadow-[0_1px_6px_rgb(0_0_0/0.9)] transition-colors duration-300 ${
                isHovered ? "text-teal-400" : "text-white"
              }`}
            >
              {title}
            </div>
          </Html>
        </group>
      </Float>
    </group>
  );
}
