"use client";

import { useMenuStore } from "@/store/useMenuStore";
import { LuAlignJustify } from "react-icons/lu";

export function MobileHeader() {

    const openMenu = useMenuStore((state) => state.openMenu);
  
  

  return (
    <header className="lg:hidden flex w-full items-center justify-between px-6 py-4 sticky top-0 z-50 bg-white/80 dark:bg-[#0B0E14]/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50">
      <div className="bg-white/10 border rounded-full p-2 font-bold">CM</div>

      <button className="p-2 cursor-pointer" onClick={openMenu}>
        <LuAlignJustify />
      </button>
    </header>
  );
}
