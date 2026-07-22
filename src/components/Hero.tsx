"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { stackIcons } from "@/lib/stackIcons";
import { FaGithub } from "react-icons/fa6";

export function Hero() {
  const GITHUB_URL = "https://github.com/CarlosZeyy";

  const fullText = "carlosmoises@dev ~ % whoami";
  const [text, setText] = useState("");

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const destaques = [
    "TypeScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Node.js",
    "Java",
    "Spring Boot",
    "Docker",
    "Git",
    "GitHub Actions",
    "Vercel",
    "Railway",
    "Jest",
    "PostgreSQL",
    "Supabase",
    "MySQL",
    "MongoDB",
  ];

  const stacks = destaques.map((name) => ({
    name: name,
    icon: stackIcons[name].icon,
  }));

  return (
    <motion.section
      id="top"
      className="py-16 sm:py-24 min-h-screen flex flex-col justify-center"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-sm text-teal-600 dark:text-teal-400 min-h-5">
            {text}
            <motion.span
              className="ml-1 animate-pulse"
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              ▍
            </motion.span>
          </p>

          <motion.h1
            className="mt-4 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            Olá, sou o{" "}
            <motion.span
              className="text-nowrap bg-linear-to-r from-white via-white to-teal-400 dark:via-white dark:to-teal-400 bg-clip-text text-transparent"
              style={{ backgroundSize: "200% 100%" }}
              animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            >
              Carlos Moises
            </motion.span>
          </motion.h1>

          <motion.p
            className="mt-4 max-w-xl text-base font-normal text-neutral-500 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            Desenvolvedor full stack — do banco de dados à interface. Trabalho
            com React, Next.js e Node.js no dia a dia, além de Java com Spring
            Boot e um pouco de infraestrutura quando o projeto pede.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            <motion.a
              href="#projetos"
              className="rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
            >
              Ver projetos
            </motion.a>

            <motion.a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2 justify-center items-center rounded-lg border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-600"
            >
              <FaGithub /> Ver código no GitHub
            </motion.a>
          </motion.div>
        </div>

        <motion.div
          className="aspect-square bg-white/5 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 1.7 }}
        >
          <video
            src="/avatar/avatar-portfolio.mp4"
            autoPlay
            loop
            muted
            playsInline
            poster="/avatar/avatar-hero.jpeg"
            className="w-full h-full object-cover rounded-2xl border border-neutral-800/50 shadow-2xl"
          ></video>
        </motion.div>
      </div>

      <motion.div
        className="w-full overflow-hidden relative mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 1.8 }}
      >
        <motion.div
          className="flex gap-12 items-center w-max py-30 text-4xl text-neutral-400 dark:text-neutral-600"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 50 }}
        >
          {[...stacks, ...stacks].map((stack, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 dark:bg-[#0B0E14]/50 backdrop-blur-sm text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-teal-400"
            >
              <stack.icon className="text-3xl" />
              {stack.name}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
