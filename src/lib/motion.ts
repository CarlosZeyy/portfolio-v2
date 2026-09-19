import type { Transition, Variants } from "framer-motion";

/** Curva "expo out": arranca rápido e pousa devagar. É a assinatura do site. */
export const EASE_OUT_EXPO: Transition["ease"] = [0.22, 1, 0.36, 1];

/**
 * Pai que orquestra os filhos: cada filho com `variants={fadeUp}` entra em
 * cascata. Substitui os `delay: 1.2, 1.4, 1.6...` escritos à mão — o ritmo
 * passa a morar num lugar só e nenhum bloco espera 2s para aparecer.
 */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
};

/** Props prontas para "anima uma vez, quando ~20% do bloco entrar na tela". */
export const revealOnce = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.2 },
} as const;
