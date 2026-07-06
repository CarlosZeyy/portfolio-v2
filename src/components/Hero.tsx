"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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

  return (
    <motion.section className="py-16 sm:py-24">
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
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        Olá, sou o Carlos.
      </motion.h1>

      <motion.p
        className="mt-4 max-w-xl text-base font-light text-neutral-500 dark:text-neutral-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.7 }}
      >
        Desenvolvedor full stack — do banco de dados à interface. Trabalho com
        React, Next.js e Node.js no dia a dia, além de Java com Spring Boot e um
        pouco de infraestrutura quando o projeto pede.
      </motion.p>

      <motion.div
        className="mt-8 flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.9 }}
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
    </motion.section>
  );
}
