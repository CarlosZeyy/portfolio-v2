"use client";

import { FaGithub } from "react-icons/fa6";
import { motion } from "framer-motion";

export function Header() {
  const GITHUB_URL = "https://github.com/CarlosZeyy";

  return (
    <motion.header
      className="flex items-center justify-between py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <motion.span
        className="font-mono text-sm text-neutral-500 dark:text-neutral-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        carlosmoises
        <motion.span
          className="text-teal-600 dark:text-teal-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          .dev
        </motion.span>
      </motion.span>
      <motion.a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <FaGithub />
        GitHub
      </motion.a>
    </motion.header>
  );
}
