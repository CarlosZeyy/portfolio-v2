"use client";

import { useModeStore } from "@/store/useMenuStore";
import { StarBackground } from "./StarBackground";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SplashScreen() {
  const is3DMode = useModeStore((state) => state.is3DMode);
  const setIs3DMode = useModeStore((state) => state.set3DMode);
  const [is3DHover, setIs3DHover] = useState(false);
  const [isHover, setIsHover] = useState(false);

  return (
    <>
      {is3DMode != null ? null : (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 gap-10">
          <StarBackground />
          <h1 className="text-6xl font-semibold">Olá, Seja Bem-Vindo</h1>
          <p>Escolha uma das opções abaixo:</p>

          <div className="flex gap-35 text-3xl flex-nowrap whitespace-nowrap">
            <div
              onMouseEnter={() => setIs3DHover(true)}
              onMouseLeave={() => setIs3DHover(false)}
              className="relative flex flex-col items-center justify-center"
            >
              <button
                type="button"
                onClick={() => setIs3DMode(true)}
                className="cursor-pointer capitalize"
              >
                Modo Imersivo
              </button>
              {is3DHover && (
                <motion.p
                  className="text-center text-sm capitalize absolute top-full mt-4 text-neutral-400"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Portfolio interativo com elementos 3D
                </motion.p>
              )}
            </div>

            <div
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
              className="relative flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setIs3DMode(false)}
                className="cursor-pointer capitalize"
              >
                Modo pagina unica
              </button>
              {isHover && (
                <motion.p
                  className="text-center text-sm capitalize absolute top-full mt-4 text-neutral-400"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Portfolio Simples
                </motion.p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
