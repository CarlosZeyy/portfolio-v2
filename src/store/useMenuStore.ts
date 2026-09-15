import { create } from "zustand";

interface MenuState {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  isOpen: false,
  isContactVisible: false,

  openMenu() {
    set({ isOpen: true });
  },
  closeMenu() {
    set({ isOpen: false });
  },
}));

interface ContacteVisible {
  isContactVisible: boolean;
  setContactVisible: (isVisible: boolean) => void;
}

export const useContactStore = create<ContacteVisible>((set) => ({
  isContactVisible: false,

  setContactVisible(isVisible) {
    set({ isContactVisible: isVisible });
  },
}));

interface ModeState {
  is3DMode: boolean | null;
  toggle3DMode: () => void;
  set3DMode: (value: boolean) => void;
}

export const useModeStore = create<ModeState>((set) => ({
  is3DMode: null,
  toggle3DMode: () => set((state) => ({ is3DMode: !state.is3DMode })),
  set3DMode: (value) => set({ is3DMode: value }),
}));
