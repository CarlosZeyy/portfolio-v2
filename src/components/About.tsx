"use client";

import { stackIcons } from "@/lib/stackIcons";
import { fadeUp, revealOnce, staggerContainer } from "@/lib/motion";
import { motion } from "framer-motion";
import { FaFileDownload } from "react-icons/fa";
import { GlassPanel } from "./GlassPanel";
import { useTranslation } from "react-i18next";

const HARD_SKILLS = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Tailwind CSS",
  "Node.js",
  "Zustand",
  "Express.js",
  "Java",
  "Spring Boot",
  "Docker",
  "Git",
  "GitHub Actions",
  "Jest",
  "PostgreSQL",
  "Supabase",
  "MySQL",
  "MongoDB",
  "Jira",
].map((name) => ({ name, icon: stackIcons[name].icon }));

// Chaves do dicionário (about.softSkills.*): o texto vem do idioma ativo.
const SOFT_SKILLS = [
  "problemSolving",
  "communication",
  "results",
  "leadership",
  "teamwork",
  "proactivity",
] as const;

const PILL =
  "flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/60 px-3 py-1 text-sm text-neutral-700 transition-colors hover:border-teal-500/40 hover:text-teal-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:text-teal-300";
const HEADING = "mb-6 font-mono text-lg text-neutral-900 dark:text-white";

export function About() {
  const { t } = useTranslation();

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
          contentClassName="flex h-full flex-col gap-6 p-6 sm:p-10"
          variants={staggerContainer()}
          {...revealOnce}
        >
          <motion.h3 variants={fadeUp} className={`${HEADING} mb-0`}>
            const me = &quot;
          </motion.h3>

          <motion.p
            variants={fadeUp}
            className="leading-relaxed text-neutral-600 dark:text-neutral-300"
          >
            {t("about.bio")}
          </motion.p>

          <motion.p variants={fadeUp} className={`${HEADING} mb-0`}>
            &quot;;
          </motion.p>

          <motion.a
            variants={fadeUp}
            href="/cv/Carlos_Moises_Mariano_Lopes_Ferreira_Desenvolvedor_Fullstack.pdf"
            download="Curriculo_Carlos_Moises_Desenvolvedor_Fullstack.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex w-full items-center justify-center gap-3 rounded-lg bg-teal-600 px-5 py-3 text-base font-semibold text-white transition-[background-color,box-shadow] duration-200 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 sm:w-fit"
          >
            {t("about.downloadCv")} <FaFileDownload />
          </motion.a>
        </GlassPanel>

        <GlassPanel
          contentClassName="p-6 sm:p-10"
          variants={staggerContainer(0.08, 0.15)}
          {...revealOnce}
        >
          <motion.h3 variants={fadeUp} className={HEADING}>
            const skills = {"{"}
          </motion.h3>

          <motion.p
            variants={fadeUp}
            className="mb-3 font-mono text-xs uppercase tracking-wide text-teal-600 dark:text-teal-400"
          >
            hard:
          </motion.p>
          <motion.div variants={fadeUp} className="mb-8 flex flex-wrap gap-2">
            {HARD_SKILLS.map((stack) => (
              <span key={stack.name} className={PILL}>
                <stack.icon className="text-lg" />
                {stack.name}
              </span>
            ))}
          </motion.div>

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
        </GlassPanel>
      </div>
    </section>
  );
}
