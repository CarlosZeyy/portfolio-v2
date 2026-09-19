"use client";

import { useMenuStore, useModeStore } from "@/store/useMenuStore";
import { LuAlignJustify } from "react-icons/lu";
import { GoArrowSwitch } from "react-icons/go";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle";

export function Sidebar() {
  const openMenu = useMenuStore((state) => state.openMenu);
  const { is3DMode, toggle3DMode } = useModeStore();
  const { t } = useTranslation();

  if (is3DMode) {
    return (
      // No celular o MobileHeader já traz o menu; aqui é o par dele no desktop.
      <div className="fixed top-8 left-8 z-50 hidden items-center gap-3 lg:flex">
        <button
          onClick={toggle3DMode}
          className="group flex cursor-pointer items-center gap-3 rounded-full border border-neutral-800 bg-white/5 px-5 py-2.5 text-sm text-neutral-400 shadow-lg backdrop-blur-md transition-all hover:border-teal-500/50 hover:text-teal-400"
          title={t("nav.switchTo2D")}
        >
          <GoArrowSwitch className="text-lg transition-transform duration-500 group-hover:rotate-180" />
          <span className="font-mono tracking-wider">{t("nav.mode2D")}</span>
        </button>

        <button
          onClick={openMenu}
          aria-label={t("nav.openMenu")}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-neutral-800 bg-white/5 text-neutral-400 shadow-lg backdrop-blur-md transition-all hover:border-teal-500/50 hover:text-teal-400"
        >
          <LuAlignJustify className="text-lg" />
        </button>

        <LanguageToggle className="rounded-full border border-neutral-800 bg-white/5 px-4 py-3 shadow-lg backdrop-blur-md" />
      </div>
    );
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-20 lg:h-screen sticky z-50 top-0 border-r bg-[#F7F8FA] dark:bg-[#0B0E14] border-neutral-200/50 dark:border-neutral-800/50">
      {}
      <div className="h-full flex flex-col justify-between items-center py-8">
        <div className="bg-white/10 border rounded-full p-2 font-bold">CM</div>

        <div className="-rotate-90 whitespace-nowrap tracking-widest">
          <div className="flex-1 flex items-center justify-center">
            {t("nav.tagline")}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <LanguageToggle className="flex-col gap-1 **:aria-[hidden]:hidden" />

          <button
            onClick={toggle3DMode}
            className="flex flex-col items-center gap-2 text-neutral-400 hover:text-teal-400 transition-colors group cursor-pointer"
            title={t(is3DMode ? "nav.switchTo2D" : "nav.switchTo3D")}
          >
            <p className="font-mono text-xs">{is3DMode ? "2D" : "3D"}</p>
            <GoArrowSwitch className="text-xl group-hover:rotate-180 transition-transform duration-500" />
          </button>

          <div
            onClick={openMenu}
            className="cursor-pointer hover:text-teal-400 hover:drop-shadow-[0_0_15px_rgba(45,212,191,0.8)] transition-colors"
          >
            <LuAlignJustify className="text-2xl" />
          </div>
        </div>
      </div>
    </aside>
  );
}
