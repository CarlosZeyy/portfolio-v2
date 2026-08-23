"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ShootingStars() {
  const [stars, setStars] = useState<
    { id: number; top: string; left: string; size: number; delay: number }[]
  >([]);

  useEffect(() => {
    const starsGenerate = Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100 - 20}%`,
      left: `${Math.random() * 100 - 20}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
    }));
    setStars(starsGenerate);
  }, []);
  return (
    <div>
      {stars.map((star) => (
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
            duration: 1,
            delay: star.delay,
            ease: "linear",
          }}
        ></motion.div>
      ))}
    </div>
  );
}
