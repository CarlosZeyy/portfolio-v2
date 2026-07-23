"use client";

import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa6";
import { motion } from "framer-motion";

export function SocialDock() {
  return (
    <>
      <motion.ul
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 2, ease: "easeOut" }}
        className="bg-white/0 px-6 py-3 backdrop-blur-xs rounded-full fixed bottom-6 left-1/2 lg:left-[95%] -translate-x-1/2 z-50 flex gap-5 text-3xl"
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
          href="http://wa.me/11991054718"
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
