"use client";

import { stackIcons } from "@/lib/stackIcons";
import { motion } from "framer-motion";
import { FaFileDownload } from "react-icons/fa";

export function About() {
  const hardSkills = [
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
    "Postgre SQL",
    "MySQL",
    "MongoDB",
    "Supabase",
  ];

  const stacks = hardSkills.map((name) => ({
    name: name,
    icon: stackIcons[name].icon,
  }));
  return (
    <motion.section
      className="py-16 sm:py-24 min-h-screen flex flex-col justify-center"
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 50 }}
    >
      <motion.p
        className="font-mono text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        ~/sobre-mim
      </motion.p>

      <motion.div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-20">
        <motion.div className="flex flex-col gap-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
            className="text-neutral-400 font-medium"
          >
            Comecei a trabalhar cedo no ofício tradicional de instalação de
            vidros com a minha família. Foi ali, no trabalho manual, que aprendi
            o valor inegociável da precisão, do capricho com os detalhes e do
            compromisso com os prazos do cliente. Hoje, aplico essa mesma
            mentalidade na Engenharia de Software. O meu foco é arquitetar
            soluções que resolvam problemas reais — como o sistema automatizado
            de orçamentos que desenvolvi para modernizar o atendimento. Acredito
            fortemente no código como ferramenta de colaboração, o que me
            motivou a atuar como Mentor Voluntário, guiando iniciantes nos seus
            primeiros passos no desenvolvimento web.
          </motion.p>

          <motion.a
            href="#"
            download={"../../public/Curriculo vai ficar aqui"}
            className="flex justify-center items-center gap-4 rounded-lg bg-teal-600 px-5 py-3 text-xl font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
          >
            Baixar Curriculo <FaFileDownload />
          </motion.a>
        </motion.div>

        <motion.div>
          <h3 className="mb-6 font-mono text-lg text-white">let history = [</h3>

          {/* A linha vertical principal */}
          <div className="border-l border-neutral-700/50 ml-3 space-y-8">
            {/* Evento 1: Faculdade */}
            <div className="relative pl-8">
              <span className="absolute -left-1.25 top-1.5 h-2.5 w-2.5 rounded-full bg-teal-500" />
              <p className="text-sm font-mono text-teal-500">2025 - 2027</p>
              <h4 className="text-white font-medium mt-1">
                Análise e Desenvolvimento de Sistemas
              </h4>
              <p className="text-sm text-neutral-400">Estácio</p>
            </div>

            {/* Evento 2: Mentoria */}
            <div className="relative pl-8">
              <span className="absolute -left-1.25 top-1.5 h-2.5 w-2.5 rounded-full bg-teal-500" />
              <p className="text-sm font-mono text-teal-500">2025</p>
              <h4 className="text-white font-medium mt-1">
                Mentor Voluntário (Front-end)
              </h4>
              <p className="text-sm text-neutral-400">
                Centro Universitário Estácio
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div>
          <div>
            <h3 className="mb-6 font-mono text-lg text-white">
              const skills = {"{"}
            </h3>

            <p className="text-sm text-neutral-400 mb-3">Hard Skills:</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {/* As pílulas de habilidades */}
              {stacks.map((stack, index) => (
                <div
                  key={index}
                  className="rounded-full flex gap-2 bg-white/5 border border-neutral-800 px-3 py-1 text-sm text-neutral-300"
                >
                  <stack.icon className="text-xl" />
                  {stack.name}
                </div>
              ))}
            </div>

            <p className="text-sm text-neutral-400 mb-3">Soft Skills:</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/5 border border-neutral-800 px-3 py-1 text-sm text-neutral-300">
                Comunicação
              </span>
              <span className="rounded-full bg-white/5 border border-neutral-800 px-3 py-1 text-sm text-neutral-300">
                Resolução de Problemas
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
