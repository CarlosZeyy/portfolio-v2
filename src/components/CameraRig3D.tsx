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

// Posição de repouso do hub (destino da intro) = ponto t=0 do zoom.
const HOME_POSITION = new THREE.Vector3(0, 4, 8);
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

export default function CameraRig3D() {
  const { camera } = useThree();

  // Enquanto a intro do GSAP roda ela é a dona da câmera; depois, o useFrame.
  const introDone = useRef(false);
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
      introDone.current = true;
      camera.position.copy(HOME_POSITION);
      return;
    }

    introDone.current = false;
    camera.position.set(0, 0, 2);
    camera.lookAt(0, 0, 0);

    gsap.to(camera.position, {
      x: HOME_POSITION.x,
      y: HOME_POSITION.y,
      z: HOME_POSITION.z,
      duration: 2.5,
      ease: "power2.out",
      onUpdate: () => camera.lookAt(0, 0, 0),
      onComplete: () => {
        introDone.current = true;
      },
    });
  }, []);

  // Ao sair do modo 3D, zera hover/zoom para o próximo mount começar limpo.
  useEffect(() => () => useOrbitStore.getState().reset(), []);

  useFrame((state, rawDelta) => {
    if (!introDone.current) return;

    const delta = Math.min(rawDelta, MAX_DELTA);
    const { zoomProgress, focusedPlanetId } = useOrbitStore.getState();

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
    if (!focus) return; // nenhum planeta recebeu hover ainda: câmera no HOME

    // 4) Posição "colada": sai do planeta em direção ao HOME e para a
    //    CLOSE_DISTANCE dele -> close = focus + normalize(HOME - focus) * d.
    //    A câmera só avança pela própria linha de visão: é zoom, não travelling.
    closePosition
      .copy(HOME_POSITION)
      .sub(focus)
      .normalize()
      .multiplyScalar(CLOSE_DISTANCE)
      .add(focus);

    // 5) lerp(a, b, t) = a + (b - a) * t  ->  t=0 devolve HOME, t=1 devolve
    //    close. Como a posição é função pura de t (não do frame anterior), o
    //    scroll para baixo refaz exatamente o mesmo caminho de volta.
    state.camera.position.set(
      THREE.MathUtils.lerp(HOME_POSITION.x, closePosition.x, t),
      THREE.MathUtils.lerp(HOME_POSITION.y, closePosition.y, t),
      THREE.MathUtils.lerp(HOME_POSITION.z, closePosition.z, t),
    );

    // 6) O alvo do olhar faz o mesmo lerp: do centro da galáxia até o planeta.
    lookTarget.set(
      THREE.MathUtils.lerp(0, focus.x, t),
      THREE.MathUtils.lerp(0, focus.y, t),
      THREE.MathUtils.lerp(0, focus.z, t),
    );

    // 7) Composição: mirar num ponto à DIREITA do planeta empurra o planeta
    //    para a esquerda do quadro. A meia-largura visível na distância d é
    //    d * tan(fov/2) * aspect; o desvio é uma fração dela. O t³ guarda o
    //    movimento para o fim do zoom, quando o painel está prestes a entrar.
    const aspect = state.size.width / state.size.height;
    if (
      aspect > FRAME_SHIFT_MIN_ASPECT &&
      state.camera instanceof THREE.PerspectiveCamera
    ) {
      const distance = state.camera.position.distanceTo(focus);
      const halfWidth =
        distance *
        Math.tan(THREE.MathUtils.degToRad(state.camera.fov) / 2) *
        aspect;

      // right = direção do olhar x up do mundo
      viewRight
        .copy(focus)
        .sub(state.camera.position)
        .cross(state.camera.up)
        .normalize();
      lookTarget.addScaledVector(viewRight, halfWidth * FRAME_SHIFT * t ** 3);
    }

    state.camera.lookAt(lookTarget);
  });

  return null;
}
