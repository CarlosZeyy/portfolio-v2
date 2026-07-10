import { LuAlignJustify } from "react-icons/lu";
import { GoArrowSwitch } from "react-icons/go";

export function Sidebar() {
  return (
    <div className="h-full flex flex-col justify-between items-center py-8">
      <div className="bg-white/10 border rounded-full p-2 font-bold">CM</div>

      <div className="-rotate-90 whitespace-nowrap tracking-widest">
        <div className="flex-1 flex items-center justify-center">
          CARLOS MOISES - DESENVOLVEDOR FULL STACK
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div>
          <p>PT</p>
          <GoArrowSwitch />
        </div>

        <div>
          <LuAlignJustify className="text-2xl" />
        </div>
      </div>
    </div>
  );
}
