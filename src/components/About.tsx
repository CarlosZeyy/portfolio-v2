"use client";

import { motion } from "framer-motion";

export function About() {
  return (
    <motion.section
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 50 }}
    >
      <motion.p
        className="font-mono text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        ~/sobre-mim
      </motion.p>

      <motion.div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div className="text-white">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
          >
            Trabalho como vidraceiro desde os 12 anos de idade com o meu pai e
            nesse tempo todo aprendi muito sobre entender o que o cliente quer,
            resolver o problema com precisão, capricho, entregando um resultado
            satisfatorio e no prazo combinado.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.4 }}
          >
            Enquanto faço a minha transição de carreira, aproveitei para
            desenvolver sistemas para facilitar o dia a dia meu e do meu pai, um
            deles foi um sistema de orçamentos digital que faz o envio
            automatico para o email e whatsapp do cliente.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.6 }}
          >
            No inicio do primeiro semestre em 2025 fiz parte de um mini-curso na
            faculdade onde tive a oportunidade de ensinar colegas de classe
            inciantes em programação sobre desenvolvimento web, desenvolvendo um
            projeto simples e prático para entender conceitos básicos como HTML
            semântico, CSS para desenvolver uma pagina bem estilizada e
            responsiva para mobiles e JavaScript para entender como funciona a
            inteligência de um site por de baixo dos panos e manipulação do DOM.
          </motion.p>
        </motion.div>

        <motion.div className="text-white">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
          >
            Atualmente estou cursando Análise e Desenvolvimento de Sistema na
            Estácio (2025-2027) e pretendo fazer uma pós graduação em Engenharia de Software
          </motion.p>

          <motion.a href="#" download={"../../public/vouAdicionarDepois"} className="">Baixar Curriculo</motion.a>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
