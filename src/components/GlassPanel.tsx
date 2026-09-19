"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type HTMLMotionProps,
} from "framer-motion";
import type { PointerEvent, ReactNode } from "react";

interface GlassPanelProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Classes do container interno (padding, layout). */
  contentClassName?: string;
  /** Brilho que segue o cursor. Desligue em painéis pequenos ou muito densos. */
  spotlight?: boolean;
}

/**
 * Painel de vidro do modo 2D. A nébula ao fundo é aditiva e brilhante, então
 * texto solto por cima dela perde contraste; o painel devolve um fundo escuro
 * e desfocado sem virar um "caixote":
 *  - borda em degradê teal -> violeta (utility glass-ring, no globals.css)
 *  - duas auroras tênues nos cantos, nas mesmas cores
 *  - um brilho que acompanha o cursor
 */
export function GlassPanel({
  children,
  className = "",
  contentClassName = "p-6 sm:p-8",
  spotlight = true,
  ...props
}: GlassPanelProps) {
  // MotionValues escrevem direto no style do elemento: o brilho segue o mouse
  // sem nenhum re-render do React por pointermove.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glow = useMotionTemplate`radial-gradient(420px circle at ${x}px ${y}px, rgb(45 212 191 / 0.11), transparent 65%)`;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - bounds.left);
    y.set(event.clientY - bounds.top);
  };

  return (
    <motion.div
      onPointerMove={spotlight ? handlePointerMove : undefined}
      className={`group/glass relative overflow-hidden rounded-3xl bg-white/70 shadow-2xl shadow-neutral-900/10 backdrop-blur-md dark:bg-[#0B0E14]/55 dark:shadow-black/40 ${className}`}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_0%_0%,rgb(20_184_166/0.13),transparent_70%),radial-gradient(55%_50%_at_100%_100%,rgb(139_92_246/0.13),transparent_70%)]"
      />
      {spotlight && (
        <motion.div
          aria-hidden
          style={{ background: glow }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/glass:opacity-100"
        />
      )}
      <div
        aria-hidden
        className="glass-ring pointer-events-none absolute inset-0 rounded-[inherit]"
      />

      <div className={`relative ${contentClassName}`}>{children}</div>
    </motion.div>
  );
}
