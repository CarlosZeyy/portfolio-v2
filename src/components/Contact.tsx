"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { IoIosMail } from "react-icons/io";
import { FaWhatsapp, FaLinkedin } from "react-icons/fa6";
import { useContactStore } from "@/store/useMenuStore";

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5 });
  const contactVisible = useContactStore((state) => state.setContactVisible);

  useEffect(() => {
    contactVisible(isInView);
  }, [isInView]);

  return (
    <motion.section
      id="contact"
      className="py-16 sm:py-24 min-h-screen flex flex-col justify-center relative overflow-hidden"
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      initial={{ opacity: 0, y: 50 }}
      ref={ref}
    >
      <motion.p
        className="font-mono text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        ~/contato
      </motion.p>

      <motion.div className="mt-12 flex justify-center gap-20 bg-white/5 border border-neutral-800 backdrop-blur-md rounded-3xl p-16 text-center">
        <motion.div className="flex flex-col justify-center items-center gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="text-4xl font-bold"
          >
            Vamos construir algo incrível juntos?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            Quer entrar em contato? Me mande um email ou mensagem no Whatsapp e
            LinkedIn
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
            <motion.a
              href="mailto:carlosmoisesdev@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 1.4 }}
              className="flex justify-center items-center gap-4 rounded-lg bg-white/5 border border-neutral-700 text-neutral-300 hover:border-neutral-500 px-5 py-3 text-xl font-semibold transition-[colors] duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
            >
              Email <IoIosMail />
            </motion.a>

            <motion.a
              href="http://wa.me/11991054718"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 1.4 }}
              className="flex justify-center items-center gap-4 rounded-lg bg-white/5 border border-neutral-700 text-neutral-300 hover:border-neutral-500 px-5 py-3 text-xl font-semibold transition-[colors] duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
            >
              Whatsapp <FaWhatsapp />
            </motion.a>

            <motion.a
              href="https://www.linkedin.com/in/carlosmoisesdev/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 1.4 }}
              className="flex justify-center items-center gap-4 rounded-lg bg-white/5 border border-neutral-700 text-neutral-300 hover:border-neutral-500 px-5 py-3 text-xl font-semibold transition-[colors] duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
            >
              LinkedIn <FaLinkedin />
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
      <motion.div className="absolute bottom-0 w-full pb-8 text-center text-sm text-neutral-200">
        <motion.p>© 2026 Desenvolvido por Carlos Moises</motion.p>
      </motion.div>
    </motion.section>
  );
}
