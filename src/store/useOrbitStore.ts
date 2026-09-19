import { create } from "zustand";
import type * as THREE from "three";

/**
 * Cada planeta do hub é a porta de uma seção de conteúdo: o id é o mesmo (e é
 * também a âncora #id da seção no modo 2D). A lista existe em runtime para
 * validar deep links; o tipo é derivado dela, então nunca saem de sincronia.
 */
export const PLANET_IDS = ["about", "experience", "projects", "contact"] as const;
export type PlanetId = (typeof PLANET_IDS)[number];

export const isPlanetId = (value: string): value is PlanetId =>
  (PLANET_IDS as readonly string[]).includes(value);

// Histerese da entrada na seção: entra acima de ENTER e só sai abaixo de EXIT.
// Com um limiar único, o trackpad (que manda deltas minúsculos) faria o painel
// piscar em volta do valor; e um tick acidental de roda já fecharia a leitura.
const SECTION_ENTER_ZOOM = 0.95;
const SECTION_EXIT_ZOOM = 0.8;

interface OrbitState {
  /** Planeta sob o cursor agora. Enquanto != null, a órbita fica pausada. */
  hoveredPlanetId: PlanetId | null;
  /**
   * Último planeta que recebeu hover. A câmera foca nele — e continua focando
   * depois que o mouse sai, para o scroll para baixo conseguir reverter o zoom.
   */
  focusedPlanetId: PlanetId | null;
  /** Zoom bruto acumulado pelo wheel, sempre entre 0 (hub) e 1 (colado no planeta). */
  zoomProgress: number;
  /**
   * true quando a câmera "pousou" no planeta e o conteúdo 2D deve aparecer.
   * É estado (e não um zoomProgress > 0.95 calculado no componente) para que a
   * UI assine um booleano que muda duas vezes por visita, em vez de um número
   * que muda a cada tick da roda do mouse.
   */
  isInsideSection: boolean;

  setHoveredPlanet: (id: PlanetId) => void;
  clearHoveredPlanet: (id: PlanetId) => void;
  addZoom: (amount: number) => void;
  /**
   * Abre uma seção direto, sem hover nem scroll (deep link, ex.: voltar de
   * /project/[id] para /#projects). Deixa o store no mesmo estado de quem
   * chegou lá rolando: foco no planeta, zoom 1, dentro da seção.
   */
  enterSection: (id: PlanetId) => void;
  /** Volta ao hub (botão fechar / Esc). A câmera recua sozinha, amortecida. */
  exitSection: () => void;
  reset: () => void;
}

export const useOrbitStore = create<OrbitState>((set) => ({
  hoveredPlanetId: null,
  focusedPlanetId: null,
  zoomProgress: 0,
  isInsideSection: false,

  setHoveredPlanet: (id) =>
    set((state) =>
      // Dentro de uma seção o foco fica travado: os outros planetas continuam
      // visíveis ao lado do painel, e esbarrar o mouse num deles não pode
      // arrancar a câmera (e o conteúdo) para outra seção.
      state.isInsideSection && state.focusedPlanetId !== id
        ? state
        : { hoveredPlanetId: id, focusedPlanetId: id },
    ),

  // Só limpa se o hover ainda for deste planeta: se o cursor passou direto de
  // A para B, o pointerout atrasado de A não pode apagar o hover de B.
  clearHoveredPlanet: (id) =>
    set((state) =>
      state.hoveredPlanetId === id ? { hoveredPlanetId: null } : state,
    ),

  addZoom: (amount) =>
    set((state) => {
      const zoomProgress = Math.min(1, Math.max(0, state.zoomProgress + amount));
      const isInsideSection = state.isInsideSection
        ? zoomProgress > SECTION_EXIT_ZOOM
        : zoomProgress > SECTION_ENTER_ZOOM;

      return { zoomProgress, isInsideSection };
    }),

  enterSection: (id) =>
    set({
      hoveredPlanetId: null,
      focusedPlanetId: id,
      zoomProgress: 1,
      isInsideSection: true,
    }),

  exitSection: () => set({ zoomProgress: 0, isInsideSection: false }),

  reset: () =>
    set({
      hoveredPlanetId: null,
      focusedPlanetId: null,
      zoomProgress: 0,
      isInsideSection: false,
    }),
}));

/** Seção aberta no momento, ou null. Seletor pronto para a UI 2D assinar. */
export const selectActiveSection = (state: OrbitState): PlanetId | null =>
  state.isInsideSection ? state.focusedPlanetId : null;

/**
 * Registro id -> Object3D dos planetas. Fica fora do estado do Zustand de
 * propósito: é só uma ponte para a câmera ler a posição do planeta a cada
 * frame, não é estado de UI e nunca deve disparar re-render.
 */
export const planetRegistry = new Map<PlanetId, THREE.Object3D>();
