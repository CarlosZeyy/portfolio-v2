"use client";

import { motion } from "framer-motion";
import { round2, seededRandom } from "@/lib/seededRandom";

// Constante de módulo com semente fixa (ver seededRandom): sem useEffect, sem
// estado e sem diferença entre o HTML do servidor e o do cliente.
const random = seededRandom(7);
const STARS = Array.from({ length: 70 }, (_, id) => ({
  id,
  top: `${round2(random() * 100 - 20)}%`,
  left: `${round2(random() * 100 - 20)}%`,
  duration: round2(random() * 2 + 1),
  delay: round2(random() * 3),
}));

export default function ShootingStars() {
  return (
    <div>
      {STARS.map((star) => (
        <motion.div
          className="absolute h-px w-32 bg-linear-to-r from-transparent via-white to-transparent"
          key={star.id}
          style={{
            top: star.top,
            left: star.left,
          }}
          initial={{ x: 0, y: 0, rotate: 45, opacity: 0 }}
          animate={{ x: 1500, y: 1500, rotate: 45, opacity: [0, 1, 0] }}
          transition={{
            repeat: Infinity,
            duration: star.duration,
            delay: star.delay,
            ease: "linear",
          }}
        ></motion.div>
      ))}
    </div>
  );
}
