"use client";

import { useModeStore } from "@/store/useMenuStore";
import { StarBackground } from "./StarBackground";
import { motion, type Variants } from "framer-motion";
import type { IconType } from "react-icons";
import { LuLayers, LuOrbit } from "react-icons/lu";
import { EASE_OUT_EXPO, fadeUp, staggerContainer } from "@/lib/motion";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle";

interface ModeOption {
  is3D: boolean;
  /** Ramo do dicionário: splash.<key>.title / .description */
  key: "immersive" | "single";
  icon: IconType;
}

const OPTIONS: ModeOption[] = [
  { is3D: true, key: "immersive", icon: LuOrbit },
  { is3D: false, key: "single", icon: LuLayers },
];

// A descrição é controlada pelo estado do PAI: "rest" -> "hover". O botão só
// declara whileHover/whileFocus="hover" e o framer propaga para os filhos.
const descriptionVariants: Variants = {
  rest: { opacity: 0, y: 8 },
  hover: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT_EXPO } },
};

export default function SplashScreen() {
  const is3DMode = useModeStore((state) => state.is3DMode);
  const setIs3DMode = useModeStore((state) => state.set3DMode);
  const { t } = useTranslation();

  if (is3DMode !== null) return null;

  return (
    // overflow-y-auto + min-h-full no filho: em telas baixas (celular deitado)
    // o conteúdo rola em vez de ser cortado pelo inset-0.
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950">
      <StarBackground />

      {/* A splash é a primeira tela: o idioma tem que poder ser trocado aqui. */}
      <LanguageToggle className="absolute top-6 right-6 z-10 text-sm" />

      <motion.div
        variants={staggerContainer(0.12, 0.2)}
        initial="hidden"
        animate="visible"
        className="relative flex min-h-full flex-col items-center justify-center gap-8 px-6 py-16 text-center sm:gap-10"
      >
        <motion.p
          variants={fadeUp}
          className="font-mono text-xs uppercase tracking-[0.3em] text-teal-400"
        >
          Carlos Moises
        </motion.p>

        {/* text-balance divide o título em linhas de tamanho parecido, em vez
            de deixar uma palavra órfã na segunda linha do celular. */}
        <motion.h1
          variants={fadeUp}
          className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl"
        >
          {t("splash.title")}
        </motion.h1>

        <motion.p variants={fadeUp} className="text-neutral-400">
          {t("splash.subtitle")}
        </motion.p>

        {/* Empilhado no celular, lado a lado a partir de sm. */}
        <motion.div
          variants={fadeUp}
          className="flex w-full max-w-sm flex-col gap-4 sm:max-w-2xl sm:flex-row sm:gap-6"
        >
          {OPTIONS.map((option) => (
            <motion.button
              key={option.key}
              type="button"
              onClick={() => setIs3DMode(option.is3D)}
              initial="rest"
              animate="rest"
              whileHover="hover"
              whileFocus="hover"
              whileTap={{ scale: 0.98 }}
              className="group relative flex flex-1 cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-3xl bg-white/3 px-6 py-8 outline-none backdrop-blur-sm transition-colors duration-300 hover:bg-white/6 focus-visible:bg-white/6"
            >
              <span
                aria-hidden
                className="glass-ring pointer-events-none absolute inset-0 rounded-[inherit] opacity-60 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              />
              <option.icon className="text-3xl text-teal-400 transition-transform duration-500 group-hover:scale-110" />
              <span className="text-xl font-medium text-white sm:text-2xl">
                {t(`splash.${option.key}.title`)}
              </span>

              {/* A descrição fica NO FLUXO do card (não mais absolute/top-full):
                  o espaço dela está sempre reservado, então nunca cobre o card
                  de baixo. Em tela de toque não existe hover, então ali ela
                  fica sempre visível — o `!` vence o style inline do framer. */}
              <motion.span
                variants={descriptionVariants}
                className="text-sm text-neutral-400 [@media(hover:none)]:transform-none! [@media(hover:none)]:opacity-100!"
              >
                {t(`splash.${option.key}.description`)}
              </motion.span>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
