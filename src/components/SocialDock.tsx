"use client";

import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa6";
import { motion } from "framer-motion";
import { useContactStore } from "@/store/useMenuStore";

export function SocialDock() {
  const isContactVisible = useContactStore((state) => state.isContactVisible);

  return (
    <>
      <motion.ul
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: isContactVisible ? 100 : 0, opacity: isContactVisible ? 0 : 1 }}
        transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
        className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-5 rounded-full border border-neutral-200/60 bg-white/70 px-6 py-3 text-2xl shadow-lg shadow-black/20 backdrop-blur-md lg:left-[95%] lg:border-transparent lg:bg-transparent lg:text-3xl lg:shadow-none lg:backdrop-blur-none dark:border-white/10 dark:bg-[#0B0E14]/70 dark:lg:border-transparent dark:lg:bg-transparent"
      >
        <a
          href="https://github.com/CarlosZeyy"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 hover:text-teal-400 transition-all"
        >
          <FaGithub />
        </a>

        <a
          href="https://www.linkedin.com/in/carlosmoisesdev/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 hover:text-teal-400 transition-all"
        >
          <FaLinkedin />
        </a>

        <a
          href="http://wa.me/5511991054718"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 hover:text-teal-400 transition-all"
        >
          <FaWhatsapp />
        </a>
      </motion.ul>
    </>
  );
}
