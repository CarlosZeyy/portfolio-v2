"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function StarBackground() {
  const [stars, setStars] = useState<
    { id: number; top: string; left: string; size: number; delay: number }[]
  >([]);

  useEffect(() => {
    const starsGenerate = Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
    }));
    setStars(starsGenerate);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
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
