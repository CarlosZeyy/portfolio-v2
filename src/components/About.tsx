"use client";

import { stackIcons } from "@/lib/stackIcons";
import { motion } from "framer-motion";
import { FaFileDownload } from "react-icons/fa";

export function About() {
  const hardSkills = [
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
  ];

  const softSkills = [
    "Resolução de Problemas",
    "Comunicação",
    "Orientação a Resultados",
    "Liderança",
    "Trabalho em Equipe",
    "Proatividade",
  ];

  const hardSkill = hardSkills.map((name) => ({
    name: name,
    icon: stackIcons[name].icon,
  }));

  const softSkill = softSkills.map((name) => ({
    name: name,
  }));

  return (
    <motion.section
      id="about"
      className="py-16 sm:py-24 min-h-screen flex flex-col justify-center"
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      initial={{ opacity: 0, y: 50 }}
    >
      <motion.p
        className="font-mono text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        ~/sobre mim
      </motion.p>

      <motion.div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-20">
        <motion.div className="flex flex-col gap-6">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="mb-6 font-mono text-lg text-white"
          >
            const me = "
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 1.2 }}
            className="text-neutral-400 font-medium"
          >
            Comecei a trabalhar cedo no ofício tradicional de instalação de
            vidros com a minha família. Foi ali, no trabalho manual, que aprendi
            o valor inegociável da precisão, do capricho com os detalhes e do
            compromisso com os prazos do cliente. Hoje, aplico essa mesma
            mentalidade na Engenharia de Software. O meu foco é arquitetar
            soluções que resolvam problemas reais, como o sistema automatizado
            de orçamentos que desenvolvi para modernizar o atendimento. Acredito
            fortemente no código como ferramenta de colaboração, o que me
            motivou a atuar como Mentor Voluntário na faculdade, guiando
            iniciantes sem experiência nos seus primeiros passos no
            desenvolvimento web.
          </motion.p>

          <motion.a
            href="/cv/Carlos_Moises_Mariano_Lopes_Ferreira_Desenvolvedor_Fullstack.pdf"
            download={"Curriculo_Carlos_Moises_Desenvolvedor_Fullstack.pdf"}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 1.4 }}
            className="flex justify-center items-center gap-4 rounded-lg bg-teal-600 px-5 py-3 text-xl font-semibold text-white transition-[colors] duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
          >
            Baixar Currículo <FaFileDownload />
          </motion.a>
        </motion.div>

        <motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mb-6 font-mono text-lg text-white"
          >
            let experience = {"["}
          </motion.h3>

          {/* A linha vertical principal */}
          <motion.div className="ml-3">
            {/* Evento 1: Faculdade */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="relative pl-8 pb-10 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-neutral-700/50 hover:before:bg-teal-500"
            >
              <span className="absolute left-[-4.5px] top-0 h-2.5 w-2.5 rounded-full bg-teal-500" />
              <p className="text-sm font-mono text-teal-500">2025 - 2027</p>
              <h4 className="text-white font-medium mt-1">
                Análise e Desenvolvimento de Sistemas
              </h4>
              <p className="text-sm text-neutral-400">Estácio</p>
            </motion.div>

            {/* Evento 2: Mentoria */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 1.25 }}
              className="relative pl-8 pb-10 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-neutral-700/50 hover:before:bg-teal-500"
            >
              <span className="absolute left-[-4.5px] top-0 h-2.5 w-2.5 rounded-full bg-teal-500" />
              <p className="text-sm font-mono text-teal-500">2025</p>
              <h4 className="text-white font-medium mt-1">
                Mentor Voluntário (Front-end)
              </h4>
              <p className="text-sm text-neutral-400">Estácio</p>
            </motion.div>

            {/* Evento 3: Freelancers 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 1.5 }}
              className="relative pl-8 pb-10 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-neutral-700/50 hover:before:bg-teal-500"
            >
              <span className="absolute left-[-4.5px] top-0 h-2.5 w-2.5 rounded-full bg-teal-500" />
              <p className="text-sm font-mono text-teal-500">2025</p>
              <h4 className="text-white font-medium mt-1">
                Enfermex (Sistema de gestão de pacientes)
              </h4>
              <p className="text-sm text-neutral-400">Freelancer</p>
            </motion.div>

            {/* Evento 4: Freelancers 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 1.75 }}
              className="relative pl-8 pb-10 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-neutral-700/50 hover:before:bg-teal-500"
            >
              <span className="absolute left-[-4.5px] top-0 h-2.5 w-2.5 rounded-full bg-teal-500" />
              <p className="text-sm font-mono text-teal-500">2025</p>
              <h4 className="text-white font-medium mt-1">
                Sistema de Envio de Orçamentos Automatizado
              </h4>
              <p className="text-sm text-neutral-400">Freelancer</p>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div>
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="mb-6 font-mono text-lg text-white"
            >
              const skills = {"{"}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 1.25 }}
              className="text-sm text-neutral-400 mb-3"
            >
              Hard Skills:
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 1.5 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {/* As pílulas de hard skills */}
              {hardSkill.map((stack, index) => (
                <motion.div
                  key={index}
                  className="rounded-full flex gap-2 bg-white/5 border border-neutral-800 px-3 py-1 text-sm text-neutral-300"
                >
                  <stack.icon className="text-xl" />
                  {stack.name}
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 1.75 }}
              className="text-sm text-neutral-400 mb-3"
            >
              Soft Skills:
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 2 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {/* As pílulas de soft skills */}
              {softSkill.map((skill, index) => (
                <motion.div
                  key={index}
                  className="rounded-full flex gap-2 bg-white/5 border border-neutral-800 px-3 py-1 text-sm text-neutral-300"
                >
                  {skill.name}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
