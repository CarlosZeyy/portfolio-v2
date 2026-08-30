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
