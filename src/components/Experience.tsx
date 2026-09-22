"use client";

import { motion, type Variants } from "framer-motion";
import type { IconType } from "react-icons";
import {
  LuBriefcaseBusiness,
  LuCodeXml,
  LuGraduationCap,
  LuHammer,
  LuHeartHandshake,
  LuLaptop,
} from "react-icons/lu";
import { EASE_OUT_EXPO, revealOnce, staggerContainer } from "@/lib/motion";
import { GlassPanel } from "./GlassPanel";
import { useTranslation } from "react-i18next";

type ExperienceKind =
  | "work"
  | "freelance"
  | "project"
  | "trade"
  | "education"
  | "volunteer";

interface ExperienceItem {
  /**
   * Ramo do dicionário: experience.items.<id>.{period,title,organization,
   * description}. O período mora lá (e não aqui) porque também é texto:
   * "atual" / "present", "Antes do código" / "Before code".
   */
  id:
    | "systelos"
    | "quotes"
    | "enfermex"
    | "glazier"
    | "postgrad"
    | "degree"
    | "mentor"
    | "production";
  kind: ExperienceKind;
  /** Item ainda em andamento: o nó da timeline fica pulsando. */
  ongoing?: boolean;
  /** Item que ainda não começou: o nó fica vazado (só o contorno). */
  planned?: boolean;
}

const KIND_ICONS: Record<ExperienceKind, IconType> = {
  work: LuBriefcaseBusiness,
  freelance: LuLaptop,
  project: LuCodeXml,
  trade: LuHammer,
  education: LuGraduationCap,
  volunteer: LuHeartHandshake,
};

// Dois blocos em vez de uma lista só: quem recruta procura "onde trabalhou" e
// "o que estudou" em lugares separados. Cada bloco vai do mais recente para o
// mais antigo. O vidraceiro fecha o profissional de propósito: é onde a
// história começa, e é contado como o que foi — trabalho manual.
const BLOCKS = [
  {
    // Nome da "variável" no título (let <name> = [) e chave da legenda em
    // experience.blocks.<id>.
    id: "professional",
    items: [
      { id: "systelos", kind: "work", ongoing: true },
      { id: "quotes", kind: "project" },
      { id: "enfermex", kind: "freelance" },
      { id: "glazier", kind: "trade" },
    ],
  },
  {
    id: "academic",
    items: [
      { id: "postgrad", kind: "education", planned: true },
      { id: "degree", kind: "education", ongoing: true },
      { id: "mentor", kind: "volunteer" },
      { id: "production", kind: "education" },
    ],
  },
] as const satisfies readonly {
  id: "professional" | "academic";
  items: readonly ExperienceItem[];
}[];

type Block = (typeof BLOCKS)[number];

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

function Timeline({ block }: { block: Block }) {
  const { t } = useTranslation();
  // `items` alargado para ExperienceItem: no `as const` cada item só declara as
  // flags que tem, e `item.planned` não existiria no tipo dos demais.
  const items: readonly ExperienceItem[] = block.items;

  return (
    <motion.div variants={staggerContainer(0.14, 0.1)} {...revealOnce}>
      <h3 className="font-mono text-lg text-neutral-900 dark:text-white">
        let {block.id} = {"["}
      </h3>
      {/* A legenda traduzida vem como comentário de código: o título continua
          sendo "código", e quem não lê inglês entende o bloco na hora. */}
      <p className="mt-1 mb-8 font-mono text-xs text-neutral-500 dark:text-neutral-400">
        {"// "}
        {t(`experience.blocks.${block.id}`)}
      </p>

      <ol className="relative ml-2">
        <motion.span
          aria-hidden
          variants={railVariants}
          className="absolute top-7 bottom-2 left-0 w-px origin-top bg-linear-to-b from-teal-400 via-violet-400/70 to-transparent"
        />

        {items.map((item) => {
          const KindIcon = KIND_ICONS[item.kind];

          return (
            <motion.li
              key={item.id}
              variants={itemVariants}
              className="group/item relative pb-6 pl-8 last:pb-0"
            >
              {/* Nó: centrado no trilho de 1px (por isso o -translate-x-1/2). */}
              <span className="absolute top-6 left-0 flex h-3 w-3 -translate-x-1/2 items-center justify-center">
                {item.ongoing && (
                  <span className="absolute h-full w-full animate-ping rounded-full bg-teal-400/60" />
                )}
                <span
                  className={`relative h-2.5 w-2.5 rounded-full transition-transform duration-300 group-hover/item:scale-125 ${
                    item.planned
                      ? "border border-teal-400 bg-[#f6f7f9] dark:bg-[#0B0E14]"
                      : "bg-teal-400 shadow-[0_0_0_4px_rgb(45_212_191/0.15),0_0_12px_rgb(45_212_191/0.7)]"
                  }`}
                />
              </span>

              <div className="rounded-2xl border border-neutral-200/70 bg-white/50 p-5 transition-all duration-300 group-hover/item:translate-x-1 group-hover/item:border-teal-500/40 dark:border-white/5 dark:bg-white/3 dark:group-hover/item:bg-white/6">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <p className="font-mono text-sm text-teal-600 dark:text-teal-400">
                    {t(`experience.items.${item.id}.period`)}
                    {(item.ongoing || item.planned) && (
                      <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-300">
                        {t(item.planned ? "experience.planned" : "experience.ongoing")}
                      </span>
                    )}
                  </p>
                  <span className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 font-mono text-[11px] text-violet-600 dark:text-violet-300">
                    <KindIcon className="text-sm" />
                    {t(`experience.kinds.${item.kind}`)}
                  </span>
                </div>

                <h4 className="mt-2 font-medium text-neutral-900 dark:text-white">
                  {t(`experience.items.${item.id}.title`)}
                </h4>
                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                  {t(`experience.items.${item.id}.organization`)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {t(`experience.items.${item.id}.description`)}
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
  const { t } = useTranslation();

  if (embedded) {
    return (
      // No painel do hub (estreito) os blocos empilham, separados por um fio.
      <div className="flex flex-col">
        {BLOCKS.map((block) => (
          <div
            key={block.id}
            className="not-first:mt-10 not-first:border-t not-first:border-white/10 not-first:pt-10"
          >
            <Timeline block={block} />
          </div>
        ))}
      </div>
    );
  }

  return (
    // id="experience": âncora do menu 2D e o mesmo id do planeta no hub 3D.
    <section
      id="experience"
      className="flex min-h-screen scroll-mt-8 flex-col justify-center py-16 sm:py-24"
    >
      <p className="font-mono text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {t("paths.experience")}
      </p>

      {/* items-start: cada vidro tem a altura da própria timeline, em vez de o
          bloco mais curto esticar com um vazio embaixo. */}
      <div className="mt-8 grid grid-cols-1 items-start gap-6 xl:grid-cols-2 xl:gap-8">
        {BLOCKS.map((block) => (
          <GlassPanel key={block.id} contentClassName="p-6 sm:p-10">
            <Timeline block={block} />
          </GlassPanel>
        ))}
      </div>
    </section>
  );
}
