"use client";

import { motion } from "framer-motion";
import { round2, seededRandom } from "@/lib/seededRandom";

// Constante de módulo com semente fixa (ver seededRandom): sem useEffect, sem
// estado e sem diferença entre o HTML do servidor e o do cliente.
const random = seededRandom(42);
const STARS = Array.from({ length: 70 }, (_, id) => ({
  id,
  top: `${round2(random() * 100)}%`,
  left: `${round2(random() * 100)}%`,
  size: round2(random() * 2 + 1),
  delay: round2(random() * 3),
}));

export function StarBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {STARS.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full blur-[1px] shadow shadow-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        ></motion.div>
      ))}
    </div>
  );
}
