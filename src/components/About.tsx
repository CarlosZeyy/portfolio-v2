"use client";

import { stackIcons } from "@/lib/stackIcons";
import { fadeUp, revealOnce, staggerContainer } from "@/lib/motion";
import { motion } from "framer-motion";
import { FaFileDownload } from "react-icons/fa";
import { GlassPanel } from "./GlassPanel";
import { useTranslation } from "react-i18next";

// Agrupadas por camada: 25 pílulas soltas viram ruído, cinco grupos curtos
// viram um mapa. Os rótulos são identificadores "de código" (como `hard:` e
// `soft:`), por isso não passam pelo i18n.
const HARD_SKILLS = [
  {
    group: "frontend",
    stacks: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Zustand",
    ],
  },
  {
    group: "creative",
    stacks: ["Three.js", "React Three Fiber", "GSAP", "Framer Motion"],
  },
  {
    group: "backend",
    stacks: ["Node.js", "Express.js", "Java", "Spring Boot"],
  },
  { group: "data", stacks: ["PostgreSQL", "Supabase", "MySQL", "MongoDB"] },
  {
    group: "tooling",
    stacks: ["Docker", "Git", "GitHub Actions", "Jest", "Jira"],
  },
  {
    group: "ai code",
    stacks: ["Claude", "Gemini", "Codex"],
  },
].map(({ group, stacks }) => ({
  group,
  stacks: stacks.map((name) => ({ name, icon: stackIcons[name].icon })),
}));

// Chaves do dicionário (about.softSkills.*): o texto vem do idioma ativo.
const SOFT_SKILLS = [
  "problemSolving",
  "communication",
  "resilience",
  "customerEmpathy",
  "attentionToDetail",
  "continuousLearning",
  "mentoring",
  "teamwork",
  "proactivity",
] as const;

// Os três tempos da história, na ordem em que são contados. As mesmas chaves
// existem em about.bio.* (texto completo, 2D) e about.orbit.* (resumo, hub 3D).
const CHAPTERS = ["origin", "turn", "now"] as const;

const PILL =
  "flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/60 px-3 py-1 text-sm text-neutral-700 transition-colors hover:border-teal-500/40 hover:text-teal-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:text-teal-300";
const HEADING = "mb-6 font-mono text-lg text-neutral-900 dark:text-white";
const HEADLINE =
  "w-fit bg-linear-to-r from-teal-500 to-violet-500 bg-clip-text font-semibold text-transparent dark:from-teal-300 dark:to-violet-400";
const CV_BUTTON =
  "flex w-full items-center justify-center gap-3 rounded-lg bg-teal-600 px-5 py-3 text-base font-semibold text-white transition-[background-color,box-shadow] duration-200 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 sm:w-fit";

function CvButton({ className = "" }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <motion.a
      variants={fadeUp}
      href="/cv/CV_Carlos_Moises_Desenvolvedor_FullStack.pdf"
      download="Curriculo_Carlos_Moises_Desenvolvedor_Fullstack.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className={`${CV_BUTTON} ${className}`}
    >
      {t("about.downloadCv")} <FaFileDownload />
    </motion.a>
  );
}

/** O objeto `skills`: hard por camada, depois soft. Usado no 2D e no hub 3D. */
function Skills() {
  const { t } = useTranslation();

  return (
    <>
      <motion.h3 variants={fadeUp} className={HEADING}>
        const skills = {"{"}
      </motion.h3>

      <motion.p
        variants={fadeUp}
        className="mb-4 font-mono text-xs uppercase tracking-wide text-teal-600 dark:text-teal-400"
      >
        hard:
      </motion.p>
      <div className="mb-8 flex flex-col gap-4">
        {HARD_SKILLS.map(({ group, stacks }) => (
          <motion.div key={group} variants={fadeUp}>
            <p className="mb-2 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              {group}:
            </p>
            <div className="flex flex-wrap gap-2">
              {stacks.map((stack) => (
                <span key={stack.name} className={PILL}>
                  <stack.icon className="text-lg" />
                  {stack.name}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        variants={fadeUp}
        className="mb-3 font-mono text-xs uppercase tracking-wide text-violet-600 dark:text-violet-400"
      >
        soft:
      </motion.p>
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        {SOFT_SKILLS.map((skill) => (
          <span key={skill} className={PILL}>
            {t(`about.softSkills.${skill}`)}
          </span>
        ))}
      </motion.div>

      <motion.p variants={fadeUp} className={`${HEADING} mt-8 mb-0`}>
        {"};"}
      </motion.p>
    </>
  );
}

/**
 * Versão do painel do planeta "Sobre Mim" no hub 3D. O painel é estreito, rola
 * e já tem título: aqui a história vira três "paradas" curtas em vez de três
 * parágrafos, e as skills vêm logo abaixo.
 */
function AboutOrbit() {
  const { t } = useTranslation();

  return (
    // animate (e não whileInView): o painel acabou de abrir, tudo já está à
    // vista. O delay espera o vidro terminar de entrar.
    <motion.div
      variants={staggerContainer(0.1, 0.45)}
      initial="hidden"
      animate="visible"
    >
      <motion.p
        variants={fadeUp}
        className={`${HEADLINE} text-2xl sm:text-3xl`}
      >
        {t("about.headline")}
      </motion.p>

      <ol className="relative mt-8 ml-2 flex flex-col gap-6 border-l border-white/10">
        {CHAPTERS.map((chapter, index) => (
          <motion.li key={chapter} variants={fadeUp} className="relative pl-7">
            <span className="absolute top-1.5 left-0 h-2 w-2 -translate-x-[calc(50%+0.5px)] rounded-full bg-teal-400 shadow-[0_0_10px_rgb(45_212_191/0.8)]" />
            <p className="font-mono text-xs tracking-widest text-teal-400 uppercase">
              0{index + 1} · {t(`about.orbit.${chapter}.label`)}
            </p>
            <p className="mt-1.5 leading-relaxed text-neutral-200">
              {t(`about.orbit.${chapter}.text`)}
            </p>
          </motion.li>
        ))}
      </ol>

      <motion.p
        variants={fadeUp}
        className="mt-8 font-mono text-sm text-violet-300"
      >
        {"// "}
        {t("about.orbit.closing")}
      </motion.p>

      <CvButton className="mt-8" />

      <div className="mt-10 border-t border-white/10 pt-8">
        <Skills />
      </div>
    </motion.div>
  );
}

interface AboutProps {
  /**
   * true = conteúdo resumido para o ContentOverlay do hub 3D, sem <section>,
   * título nem vidro (o painel de lá já é o vidro). Mesmo contrato do
   * Experience e do Contact.
   */
  embedded?: boolean;
}

export function About({ embedded = false }: AboutProps) {
  const { t } = useTranslation();

  if (embedded) return <AboutOrbit />;

  return (
    <section
      id="about"
      className="flex min-h-screen scroll-mt-8 flex-col justify-center py-16 sm:py-24"
    >
      <p className="font-mono text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {t("paths.about")}
      </p>

      {/* A timeline saiu daqui para o Experience.tsx: sobram bio e skills, em
          duas colunas iguais — é a proporção em que os dois painéis ficam com
          alturas parecidas (eles esticam para a mesma altura na grade). */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <GlassPanel
          contentClassName="flex h-full flex-col gap-5 p-6 sm:p-10"
          variants={staggerContainer()}
          {...revealOnce}
        >
          <motion.h3 variants={fadeUp} className={`${HEADING} mb-0`}>
            const me = &quot;
          </motion.h3>

          <motion.p variants={fadeUp} className={`${HEADLINE} text-2xl`}>
            {t("about.headline")}
          </motion.p>

          {CHAPTERS.map((chapter) => (
            <motion.p
              key={chapter}
              variants={fadeUp}
              className="leading-relaxed text-neutral-600 dark:text-neutral-300"
            >
              {t(`about.bio.${chapter}`)}
            </motion.p>
          ))}

          <motion.p variants={fadeUp} className={`${HEADING} mb-0`}>
            &quot;;
          </motion.p>

          <CvButton className="mt-auto" />
        </GlassPanel>

        <GlassPanel
          contentClassName="p-6 sm:p-10"
          variants={staggerContainer(0.08, 0.15)}
          {...revealOnce}
        >
          <Skills />
        </GlassPanel>
      </div>
    </section>
  );
}
