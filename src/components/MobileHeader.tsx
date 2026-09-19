"use client";

import { useMenuStore, useModeStore } from "@/store/useMenuStore";
import { GoArrowSwitch } from "react-icons/go";
import { LuAlignJustify } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle";

export function MobileHeader() {
  const openMenu = useMenuStore((state) => state.openMenu);
  const is3DMode = useModeStore((state) => state.is3DMode);
  const toggle3DMode = useModeStore((state) => state.toggle3DMode);
  const { t } = useTranslation();

  return (
    <header className="lg:hidden flex w-full items-center justify-between px-6 py-4 sticky top-0 z-50 bg-white/80 dark:bg-[#0B0E14]/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50">
      <div className="bg-white/10 border rounded-full p-2 font-bold">CM</div>

      <div className="flex items-center gap-3">
        <LanguageToggle />

        {/* A troca de modo do desktop mora na Sidebar, que não existe aqui. */}
        <button
          onClick={toggle3DMode}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 font-mono text-xs text-neutral-500 transition-colors hover:text-teal-500 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-teal-400"
          title={t(is3DMode ? "nav.switchTo2D" : "nav.switchTo3D")}
        >
          <GoArrowSwitch />
          {is3DMode ? "2D" : "3D"}
        </button>

        <button
          className="p-2 cursor-pointer"
          onClick={openMenu}
          aria-label={t("nav.openMenu")}
        >
          <LuAlignJustify />
        </button>
      </div>
    </header>
  );
}
