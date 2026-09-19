import { create } from "zustand";
import type * as THREE from "three";

interface OrbitState {
  /** Planeta sob o cursor agora. Enquanto != null, a órbita fica pausada. */
  hoveredPlanetId: string | null;
  /**
   * Último planeta que recebeu hover. A câmera foca nele — e continua focando
   * depois que o mouse sai, para o scroll para baixo conseguir reverter o zoom.
   */
  focusedPlanetId: string | null;
  /** Zoom bruto acumulado pelo wheel, sempre entre 0 (hub) e 1 (colado no planeta). */
  zoomProgress: number;

  setHoveredPlanet: (id: string) => void;
  clearHoveredPlanet: (id: string) => void;
  addZoom: (amount: number) => void;
  reset: () => void;
}

export const useOrbitStore = create<OrbitState>((set) => ({
  hoveredPlanetId: null,
  focusedPlanetId: null,
  zoomProgress: 0,

  setHoveredPlanet: (id) => set({ hoveredPlanetId: id, focusedPlanetId: id }),

  // Só limpa se o hover ainda for deste planeta: se o cursor passou direto de
  // A para B, o pointerout atrasado de A não pode apagar o hover de B.
  clearHoveredPlanet: (id) =>
    set((state) =>
      state.hoveredPlanetId === id ? { hoveredPlanetId: null } : state,
    ),

  addZoom: (amount) =>
    set((state) => ({
      zoomProgress: Math.min(1, Math.max(0, state.zoomProgress + amount)),
    })),

  reset: () =>
    set({ hoveredPlanetId: null, focusedPlanetId: null, zoomProgress: 0 }),
}));

/**
 * Registro id -> Object3D dos planetas. Fica fora do estado do Zustand de
 * propósito: é só uma ponte para a câmera ler a posição do planeta a cada
 * frame, não é estado de UI e nunca deve disparar re-render.
 */
export const planetRegistry = new Map<string, THREE.Object3D>();
