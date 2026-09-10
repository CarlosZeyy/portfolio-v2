"use client";

import { useMenuStore, useModeStore } from "@/store/useMenuStore";
import { LuAlignJustify } from "react-icons/lu";
import { GoArrowSwitch } from "react-icons/go";

export function Sidebar() {
  const openMenu = useMenuStore((state) => state.openMenu);
  const { is3DMode, toggle3DMode } = useModeStore();

  return (
    <div className="h-full flex flex-col justify-between items-center py-8">
      <div className="bg-white/10 border rounded-full p-2 font-bold">CM</div>

      <div className="-rotate-90 whitespace-nowrap tracking-widest">
        <div className="flex-1 flex items-center justify-center">
          CARLOS MOISES - DESENVOLVEDOR FULL STACK
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <button
          onClick={toggle3DMode}
          className="flex flex-col items-center gap-2 text-neutral-400 hover:text-teal-400 transition-colors group cursor-pointer"
          title={
            is3DMode
              ? "Ir para versão 2D simplificada"
              : "Ir para versão 3D imersiva"
          }
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
  );
}
