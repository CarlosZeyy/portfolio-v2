"use client";

import { useModeStore } from "@/store/useMenuStore";
import { motion, AnimatePresence } from "framer-motion";

export function View2D({ children }: { children: React.ReactNode }) {
  const is3DMode = useModeStore((state) => state.is3DMode);

  return (
    <AnimatePresence>
      {!is3DMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="relative mx-auto max-w-6xl px-6"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
