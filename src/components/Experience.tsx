"use client";

import { motion, type Variants } from "framer-motion";
import type { IconType } from "react-icons";
import { LuBriefcase, LuGraduationCap, LuHeartHandshake } from "react-icons/lu";
import { EASE_OUT_EXPO, revealOnce, staggerContainer } from "@/lib/motion";
import { GlassPanel } from "./GlassPanel";

type ExperienceKind = "education" | "volunteer" | "freelance";

interface ExperienceItem {
  period: string;
  title: string;
  organization: string;
  kind: ExperienceKind;
  /** Item ainda em andamento: o nó da timeline fica pulsando. */
  ongoing?: boolean;
}

const KINDS: Record<ExperienceKind, { label: string; icon: IconType }> = {
  education: { label: "Formação", icon: LuGraduationCap },
  volunteer: { label: "Voluntariado", icon: LuHeartHandshake },
  freelance: { label: "Freelance", icon: LuBriefcase },
};

const EXPERIENCE: ExperienceItem[] = [
  {
    period: "2025 — 2027",
    title: "Análise e Desenvolvimento de Sistemas",
    organization: "Estácio",
    kind: "education",
    ongoing: true,
  },
  {
    period: "2025",
    title: "Mentor Voluntário (Front-end)",
    organization: "Estácio",
    kind: "volunteer",
  },
  {
    period: "2025",
    title: "Enfermex (Sistema de gestão de pacientes)",
    organization: "Freelancer",
    kind: "freelance",
  },
  {
    period: "2025",
    title: "Sistema de Envio de Orçamentos Automatizado",
    organization: "Freelancer",
    kind: "freelance",
  },
];

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
};

// O trilho "se desenha" de cima para baixo enquanto os itens entram.
const railVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 1.4, ease: EASE_OUT_EXPO } },
};

function Timeline() {
  return (
    <motion.div variants={staggerContainer(0.14, 0.1)} {...revealOnce}>
      <h3 className="mb-8 font-mono text-lg text-neutral-900 dark:text-white">
        let experience = {"["}
      </h3>

      <ol className="relative ml-2">
        <motion.span
          aria-hidden
          variants={railVariants}
          className="absolute top-7 bottom-2 left-0 w-px origin-top bg-linear-to-b from-teal-400 via-violet-400/70 to-transparent"
        />

        {EXPERIENCE.map((item) => {
          const kind = KINDS[item.kind];

          return (
            <motion.li
              key={item.title}
              variants={itemVariants}
              className="group/item relative pb-6 pl-8 last:pb-0"
            >
              {/* Nó: centrado no trilho de 1px (por isso o -translate-x-1/2). */}
              <span className="absolute top-6 left-0 flex h-3 w-3 -translate-x-1/2 items-center justify-center">
                {item.ongoing && (
                  <span className="absolute h-full w-full animate-ping rounded-full bg-teal-400/60" />
                )}
                <span className="relative h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_0_4px_rgb(45_212_191/0.15),0_0_12px_rgb(45_212_191/0.7)] transition-transform duration-300 group-hover/item:scale-125" />
              </span>

              <div className="rounded-2xl border border-neutral-200/70 bg-white/50 p-5 transition-all duration-300 group-hover/item:translate-x-1 group-hover/item:border-teal-500/40 dark:border-white/5 dark:bg-white/3 dark:group-hover/item:bg-white/6">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <p className="font-mono text-sm text-teal-600 dark:text-teal-400">
                    {item.period}
                    {item.ongoing && (
                      <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-300">
                        em andamento
                      </span>
                    )}
                  </p>
                  <span className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 font-mono text-[11px] text-violet-600 dark:text-violet-300">
                    <kind.icon className="text-sm" />
                    {kind.label}
                  </span>
                </div>

                <h4 className="mt-2 font-medium text-neutral-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                  {item.organization}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>

      <p className="mt-6 font-mono text-lg text-neutral-900 dark:text-white">
        {"];"}
      </p>
    </motion.div>
  );
}

interface ExperienceProps {
  /**
   * true = só a timeline, sem <section>, título nem vidro. É o modo usado no
   * ContentOverlay do hub 3D: aquele painel já É o vidro e já tem o cabeçalho
   * "Experiência", então a seção completa ali dentro viraria vidro dentro de
   * vidro, com título duplicado e um min-h-screen estourando o painel.
   */
  embedded?: boolean;
}

export function Experience({ embedded = false }: ExperienceProps) {
  if (embedded) return <Timeline />;

  return (
    // id="experience": âncora do menu 2D e o mesmo id do planeta no hub 3D.
    <section
      id="experience"
      className="flex min-h-screen scroll-mt-8 flex-col justify-center py-16 sm:py-24"
    >
      <p className="font-mono text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        ~/experiencia
      </p>

      <GlassPanel className="mt-8 max-w-3xl" contentClassName="p-6 sm:p-10">
        <Timeline />
      </GlassPanel>
    </section>
  );
}
