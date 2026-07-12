"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BiArrowBack } from "react-icons/bi";
import { useMenuStore } from "@/store/useMenuStore";

export function MenuOverlay() {
  const isMenuOpen = useMenuStore((state) => state.isOpen);
  const closeMenu = useMenuStore((state) => state.closeMenu);

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          className="fixed inset-0 z-60 bg-[#0B0E14]/95 backdrop-blur-2xl flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            className="w-full flex justify-start p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <button
              onClick={closeMenu}
              className="flex justify-start items-center text-2xl cursor-pointer hover:text-teal-400 hover:drop-shadow-[0_0_15px_rgba(45,212,191,0.8)] transition-colors"
            >
              <BiArrowBack className="shadow-lg hover:text-shadow-md hover:text-shadow-teal-400" />{" "}
              Voltar
            </button>
          </motion.div>

          <motion.div className="flex-1 flex flex-col items-center justify-center gap-8">
            <motion.a
              href="#top"
              className="text-4xl font-semibold text-white hover:text-teal-400 hover:drop-shadow-[0_0_7px_rgba(45,212,191,0.8)] transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              Início
            </motion.a>

            <motion.a
              href="#about"
              className="text-4xl font-semibold text-white hover:text-teal-400 hover:drop-shadow-[0_0_7px_rgba(45,212,191,0.8)] transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              Sobre mim
            </motion.a>

            <motion.a
              href="#projects"
              className="text-4xl font-semibold text-white hover:text-teal-400 hover:drop-shadow-[0_0_7px_rgba(45,212,191,0.8)] transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              Projetos
            </motion.a>

            <motion.a
              href="#contact"
              className="text-4xl font-semibold text-white hover:text-teal-400 hover:drop-shadow-[0_0_7px_rgba(45,212,191,0.8)] transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
            >
              Contato
            </motion.a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
