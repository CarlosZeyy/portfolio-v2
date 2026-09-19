"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { stackIcons } from "@/lib/stackIcons";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { FaGithub } from "react-icons/fa6";
import { GlassPanel } from "./GlassPanel";
import { useTranslation } from "react-i18next";

const GITHUB_URL = "https://github.com/CarlosZeyy";
const TERMINAL_TEXT = "carlosmoises@dev ~ % whoami";
// O conteúdo só entra depois que o "whoami" termina de ser digitado.
const TYPING_INTERVAL_MS = 50;
const CONTENT_DELAY = (TERMINAL_TEXT.length * TYPING_INTERVAL_MS) / 1000 - 0.3;

const HIGHLIGHTS = [
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
  "Jira",
];

const STACKS = HIGHLIGHTS.map((name) => ({
  name,
  icon: stackIcons[name].icon,
}));

export function Hero() {
  const [text, setText] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(TERMINAL_TEXT.slice(0, i));
      i++;
      if (i > TERMINAL_TEXT.length) clearInterval(timer);
    }, TYPING_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="top"
      className="flex min-h-screen flex-col justify-center py-16 sm:py-24"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <GlassPanel
          contentClassName="p-6 sm:p-10"
          variants={staggerContainer(0.12, CONTENT_DELAY)}
          initial="hidden"
          animate="visible"
        >
          {/* Barra de janela: reforça que o "whoami" abaixo é um terminal e dá
              ao painel um topo com desenho, em vez de uma borda seca. */}
          <div className="mb-6 flex items-center gap-2" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-teal-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-violet-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-400/40" />
            <span className="ml-2 h-px flex-1 bg-linear-to-r from-neutral-400/30 to-transparent" />
          </div>

          <p className="min-h-5 font-mono text-sm text-teal-600 dark:text-teal-400">
            {text}
            <motion.span
              className="ml-1"
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              ▍
            </motion.span>
          </p>

          <motion.h1
            variants={fadeUp}
            className="mt-4 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl dark:text-white"
          >
            {t("hero.greeting")}{" "}
            <motion.span
              className="bg-linear-to-r from-neutral-900 via-neutral-900 to-teal-500 bg-clip-text text-nowrap text-transparent dark:from-white dark:via-white dark:to-teal-400"
              style={{ backgroundSize: "200% 100%" }}
              animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            >
              Carlos Moises
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300"
          >
            {t("hero.description")}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
            >
              {t("hero.viewProjects")}
            </a>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 dark:hover:border-teal-400/40 dark:hover:bg-white/10"
            >
              <FaGithub /> {t("hero.viewGithub")}
            </a>
          </motion.div>
        </GlassPanel>

        <motion.div
          className="relative aspect-square"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: CONTENT_DELAY + 0.4 }}
        >
          {/* Halo atrás do avatar, nas cores da nébula. */}
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[2.5rem] bg-linear-to-br from-teal-500/25 via-transparent to-violet-500/25 blur-3xl"
          />
          <div className="relative h-full overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl shadow-black/40">
            <video
              src="/avatar/avatar-portfolio.mp4"
              autoPlay
              loop
              muted
              playsInline
              poster="/avatar/avatar-hero.jpeg"
              className="h-full w-full object-cover"
            ></video>
            <div
              aria-hidden
              className="glass-ring pointer-events-none absolute inset-0 rounded-[inherit]"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="relative mt-10 w-full overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-6 sm:mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: CONTENT_DELAY + 0.7 }}
      >
        <motion.div
          className="flex w-max items-center gap-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 50 }}
        >
          {[...STACKS, ...STACKS].map((stack, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-full border border-neutral-200/70 bg-white/70 px-5 py-2.5 text-sm font-medium text-neutral-600 backdrop-blur-sm transition-colors hover:text-teal-500 dark:border-white/10 dark:bg-[#0B0E14]/60 dark:text-neutral-300 dark:hover:border-teal-400/40 dark:hover:text-teal-300"
            >
              <stack.icon className="text-2xl" />
              {stack.name}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
