"use client";

import { useGSAP } from "@gsap/react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  isPlanetId,
  planetRegistry,
  useOrbitStore,
  type PlanetId,
} from "@/store/useOrbitStore";
import { PLANET_CLOSE_DISTANCE } from "./Planet";

// Posição de repouso do hub em tela larga. Em tela estreita só a DISTÂNCIA
// muda (ver updateHome): a direção — o ângulo de onde se olha a galáxia — é
// sempre esta, então a composição é a mesma no desktop e no celular.
const BASE_HOME = new THREE.Vector3(0, 4, 8);
const HOME_DIRECTION = BASE_HOME.clone().normalize();
const BASE_HOME_DISTANCE = BASE_HOME.length();
// Folga de perspectiva: o pior caso não é o planeta exatamente de lado, e sim
// um pouco à frente (mais perto da câmera, logo maior na tela).
const FRAMING_MARGIN = 1.1;
// Faixa reservada em cada lateral, em PIXELS: metade do label mais largo da
// órbita externa + um respiro. Tem que ser em pixels porque o label é DOM de
// largura fixa — no retrato, com a câmera longe, esses ~50px equivalem a quase
// 2 unidades de mundo, mais que qualquer folga percentual razoável.
const LABEL_MARGIN_PX = 52;
// Ao girar o celular, o reenquadramento desliza em vez de pular.
const HOME_DAMPING = 3;
// De onde a intro parte: dentro do núcleo, olhando para fora.
const INTRO_START = new THREE.Vector3(0, 0, 2);
// Distância final entre a câmera e o planeta com zoom = 1. Vem do Planet.tsx
// (em raios do planeta) para o enquadramento não mudar quando a escala muda.
const CLOSE_DISTANCE = PLANET_CLOSE_DISTANCE;
// Enquadramento final: o planeta termina deslocado para a esquerda por esta
// fração da meia-largura da tela, abrindo o lado direito para o painel 2D.
const FRAME_SHIFT = 0.48;
// Em telas estreitas/retrato o painel ocupa a largura toda: planeta centrado.
const FRAME_SHIFT_MIN_ASPECT = 1.2;

const ZOOM_DAMPING = 5;
const FOCUS_DAMPING = 4;
const MAX_DELTA = 0.1;

// 1 "clique" de roda de mouse ~ 100px de deltaY -> 0.125 de zoom:
// cerca de 8 cliques para ir do hub até o planeta.
const WHEEL_SENSITIVITY = 1 / 800;
// Teto por evento, para um flick de trackpad não pular o zoom inteiro.
const MAX_WHEEL_PIXELS = 150;
const LINE_HEIGHT_PIXELS = 16;

// Vetores de rascunho reutilizados em todo frame: nada de `new Vector3()`
// dentro do useFrame (lixo para o GC a 60fps). O rig é único na cena.
const planetPosition = new THREE.Vector3();
const closePosition = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const viewRight = new THREE.Vector3();
const zoomedPosition = new THREE.Vector3();

/**
 * Wheel -> zoomProgress. O listener só ACUMULA o valor bruto no store;
 * quem move a câmera é o useFrame, de forma amortecida.
 */
function useWheelZoom() {
  const domElement = useThree((state) => state.gl.domElement);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const { hoveredPlanetId, zoomProgress, addZoom } =
        useOrbitStore.getState();

      // deltaY chega em pixels, linhas (Firefox com mouse) ou páginas.
      let pixels = event.deltaY;
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        pixels *= LINE_HEIGHT_PIXELS;
      } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        pixels *= window.innerHeight;
      }
      pixels = THREE.MathUtils.clamp(
        pixels,
        -MAX_WHEEL_PIXELS,
        MAX_WHEEL_PIXELS,
      );

      // Scroll para cima (deltaY < 0) = zoom in, por isso o sinal invertido.
      const amount = -pixels * WHEEL_SENSITIVITY;

      // Aproximar exige um planeta em hover; afastar é sempre permitido,
      // senão o usuário ficaria preso no zoom ao tirar o mouse do planeta.
      const canZoomIn = amount > 0 && hoveredPlanetId !== null;
      const canZoomOut = amount < 0 && zoomProgress > 0;
      if (!canZoomIn && !canZoomOut) return;

      event.preventDefault();
      addZoom(amount); // o clamp [0, 1] mora no store
    };

    // passive: false é obrigatório para o preventDefault funcionar no wheel.
    domElement.addEventListener("wheel", handleWheel, { passive: false });
    return () => domElement.removeEventListener("wheel", handleWheel);
  }, [domElement]);
}

/**
 * Deep link: /#projects (o "Voltar aos projetos" da página de detalhes) deve
 * reabrir a seção, não largar o usuário num hub resetado. O hash é consumido
 * UMA vez: limpo da URL para que alternar 2D <-> 3D depois não reabra a seção.
 */
function consumeSectionHash(): PlanetId | null {
  const hash = window.location.hash.slice(1);
  if (!isPlanetId(hash)) return null;

  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search,
  );
  return hash;
}

interface CameraRig3DProps {
  /** Raio da maior órbita: é o que precisa caber na largura da tela. */
  orbitRadius: number;
}

export default function CameraRig3D({ orbitRadius }: CameraRig3DProps) {
  // Progresso da intro, 0 -> 1. O GSAP anima SÓ este número; quem posiciona a
  // câmera é o useFrame, interpolando até o home ATUAL. Se a intro animasse
  // camera.position direto até um destino fixo (como antes), o destino ficaria
  // errado assim que o aspect mudasse — girar o celular no meio da intro, ou o
  // canvas ainda sem tamanho final no primeiro frame.
  const intro = useRef({ progress: 0 });
  // Distância de repouso atual (amortecida) e o ponto derivado dela.
  const homeDistance = useRef<number | null>(null);
  const home = useRef(new THREE.Vector3().copy(BASE_HOME));
  // zoomProgress suavizado: o valor bruto anda em degraus (um por tick da roda).
  const smoothZoom = useRef(0);
  // Ponto de foco suavizado, para trocar de planeta em pleno zoom sem corte.
  const focusPoint = useRef<THREE.Vector3 | null>(null);
  // undefined = hash ainda não lido. Fica num ref (e não numa variável do
  // efeito) porque o StrictMode monta -> desmonta -> monta: a 2ª passada já
  // encontra a URL limpa e precisa lembrar o que a 1ª leu.
  const deepLink = useRef<PlanetId | null | undefined>(undefined);

  useWheelZoom();

  useGSAP(() => {
    if (deepLink.current === undefined) deepLink.current = consumeSectionHash();

    if (deepLink.current) {
      // Chegou por deep link: sem intro. A câmera já nasce pousada no planeta
      // (smoothZoom = 1), senão o painel abriria com a câmera ainda voando.
      useOrbitStore.getState().enterSection(deepLink.current);
      smoothZoom.current = 1;
      intro.current.progress = 1;
      return;
    }

    gsap.fromTo(
      intro.current,
      { progress: 0 },
      { progress: 1, duration: 2.5, ease: "power2.out" },
    );
  }, []);

  // Ao sair do modo 3D, zera hover/zoom para o próximo mount começar limpo.
  useEffect(() => () => useOrbitStore.getState().reset(), []);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_DELTA);
    const { zoomProgress, focusedPlanetId } = useOrbitStore.getState();
    const aspect = state.size.width / state.size.height;
    const halfFovTan =
      state.camera instanceof THREE.PerspectiveCamera
        ? Math.tan(THREE.MathUtils.degToRad(state.camera.fov) / 2)
        : 1;

    // 0) HOME responsivo. O fov da câmera é VERTICAL; a meia-largura visível a
    //    uma distância d é d * tan(fov/2) * aspect. Descontada a faixa dos
    //    labels, sobra a fração `usable` da tela para a órbita (raio R):
    //      d >= R / (tan(fov/2) * aspect * usable)
    //    Em paisagem isso dá menos que a distância base e o max() mantém o
    //    enquadramento de sempre; em retrato (aspect < 1) a câmera recua o
    //    quanto for preciso — num celular 9:19 são ~22 unidades em vez de ~9.
    //    É contínuo no aspect: não existe "pulo" ao cruzar aspect = 1.
    const usable = Math.max(0.4, 1 - LABEL_MARGIN_PX / (state.size.width / 2));
    const targetDistance = Math.max(
      BASE_HOME_DISTANCE,
      (orbitRadius * FRAMING_MARGIN) / (halfFovTan * aspect * usable),
    );
    homeDistance.current =
      homeDistance.current === null
        ? targetDistance // 1º frame: nasce no lugar certo, sem deslizar
        : THREE.MathUtils.damp(
            homeDistance.current,
            targetDistance,
            HOME_DAMPING,
            delta,
          );
    const homePosition = home.current
      .copy(HOME_DIRECTION)
      .multiplyScalar(homeDistance.current);

    // 1) Suaviza o zoom. damp(a, b, lambda, dt) = lerp(a, b, 1 - e^(-lambda*dt)):
    //    a cada frame anda uma fração do que falta até o alvo, e a fração é
    //    corrigida pelo delta (mesma sensação em qualquer frame rate).
    //    É isso que transforma os degraus do wheel num movimento contínuo.
    smoothZoom.current = THREE.MathUtils.damp(
      smoothZoom.current,
      zoomProgress,
      ZOOM_DAMPING,
      delta,
    );

    // 2) Ease-out quadrático: t = 1 - (1 - z)^2. Num lerp linear de posição,
    //    a aproximação PARECE acelerar no final (cada unidade percorrida pesa
    //    mais quanto menor a distância ao planeta). O ease-out gasta o
    //    movimento no começo e pousa devagar.
    const t = 1 - (1 - smoothZoom.current) ** 2;

    // 3) Ponto de foco = posição do planeta no mundo, lida ao vivo. Com zoom
    //    ~0 o foco não aparece na tela, então pode pular direto; com zoom
    //    ativo ele é perseguido com damping.
    const planet = focusedPlanetId
      ? planetRegistry.get(focusedPlanetId)
      : undefined;
    if (planet) {
      planet.getWorldPosition(planetPosition);

      if (!focusPoint.current) {
        focusPoint.current = planetPosition.clone(); // uma única vez
      } else if (smoothZoom.current < 0.001) {
        focusPoint.current.copy(planetPosition);
      } else {
        focusPoint.current.lerp(
          planetPosition,
          1 - Math.exp(-FOCUS_DAMPING * delta),
        );
      }
    }

    const focus = focusPoint.current;
    // Sem foco (nenhum planeta recebeu hover ainda) a câmera fica no HOME
    // olhando o centro — mas AINDA é posicionada todo frame, senão um resize
    // não a reenquadraria.
    zoomedPosition.copy(homePosition);
    lookTarget.set(0, 0, 0);

    if (focus) {
      // 4) Posição "colada": sai do planeta em direção ao HOME e para a
      //    CLOSE_DISTANCE dele -> close = focus + normalize(HOME - focus) * d.
      //    A câmera só avança pela própria linha de visão: é zoom, não
      //    travelling.
      closePosition
        .copy(homePosition)
        .sub(focus)
        .normalize()
        .multiplyScalar(CLOSE_DISTANCE)
        .add(focus);

      // 5) lerp(a, b, t) = a + (b - a) * t  ->  t=0 devolve HOME, t=1 devolve
      //    close. Como a posição é função pura de t (não do frame anterior),
      //    o scroll para baixo refaz exatamente o mesmo caminho de volta.
      zoomedPosition.set(
        THREE.MathUtils.lerp(homePosition.x, closePosition.x, t),
        THREE.MathUtils.lerp(homePosition.y, closePosition.y, t),
        THREE.MathUtils.lerp(homePosition.z, closePosition.z, t),
      );

      // 6) O alvo do olhar faz o mesmo lerp: do centro da galáxia ao planeta.
      lookTarget.set(
        THREE.MathUtils.lerp(0, focus.x, t),
        THREE.MathUtils.lerp(0, focus.y, t),
        THREE.MathUtils.lerp(0, focus.z, t),
      );

      // 7) Composição: mirar num ponto à DIREITA do planeta empurra o planeta
      //    para a esquerda do quadro. A meia-largura visível na distância d é
      //    d * tan(fov/2) * aspect; o desvio é uma fração dela. O t³ guarda o
      //    movimento para o fim do zoom, quando o painel está prestes a entrar.
      if (aspect > FRAME_SHIFT_MIN_ASPECT) {
        const halfWidth = zoomedPosition.distanceTo(focus) * halfFovTan * aspect;

        // right = direção do olhar x up do mundo
        viewRight
          .copy(focus)
          .sub(zoomedPosition)
          .cross(state.camera.up)
          .normalize();
        lookTarget.addScaledVector(viewRight, halfWidth * FRAME_SHIFT * t ** 3);
      }
    }

    // 8) Intro: do núcleo até onde a câmera deveria estar AGORA.
    state.camera.position.lerpVectors(
      INTRO_START,
      zoomedPosition,
      intro.current.progress,
    );
    state.camera.lookAt(lookTarget);
  });

  return null;
}
