"use client"

import { motion } from "framer-motion";

export function ProjectText() {
  return (
    <>
      <motion.div>
        <motion.p
          className="font-mono text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          ~/projetos
        </motion.p>
        <motion.h2
          className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          Projetos
        </motion.h2>
      </motion.div>
    </>
  );
}
