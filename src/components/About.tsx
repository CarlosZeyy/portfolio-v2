"use client";

import { stackIcons } from "@/lib/stackIcons";
import { fadeUp, revealOnce, staggerContainer } from "@/lib/motion";
import { motion } from "framer-motion";
import { FaFileDownload } from "react-icons/fa";
import { GlassPanel } from "./GlassPanel";

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

const SOFT_SKILLS = [
  "Resolução de Problemas",
  "Comunicação",
  "Orientação a Resultados",
  "Liderança",
  "Trabalho em Equipe",
  "Proatividade",
];

const PILL =
  "flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/60 px-3 py-1 text-sm text-neutral-700 transition-colors hover:border-teal-500/40 hover:text-teal-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:text-teal-300";
const HEADING = "mb-6 font-mono text-lg text-neutral-900 dark:text-white";

export function About() {
  return (
    <section
      id="about"
      className="flex min-h-screen scroll-mt-8 flex-col justify-center py-16 sm:py-24"
    >
      <p className="font-mono text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        ~/sobre-mim
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
            Comecei a trabalhar cedo no ofício tradicional de instalação de
            vidros com a minha família. Foi ali, no trabalho manual, que aprendi
            o valor inegociável da precisão, do capricho com os detalhes e do
            compromisso com os prazos do cliente. Hoje, aplico essa mesma
            mentalidade na Engenharia de Software. O meu foco é arquitetar
            soluções que resolvam problemas reais, como o sistema automatizado
            de envio de orçamentos que desenvolvi para modernizar o atendimento.
            Acredito fortemente no código como ferramenta de colaboração, o que
            me motivou a atuar como Mentor Voluntário na faculdade Estácio,
            guiando alunos e pessoas de fora da instituição iniciantes sem
            experiência nos seus primeiros passos no desenvolvimento web.
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
            Baixar Currículo <FaFileDownload />
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
                {skill}
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
