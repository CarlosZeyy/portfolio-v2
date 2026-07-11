"use client";

import { BiArrowBack } from "react-icons/bi";

export function MenuOverlay() {
  return (
    <div className="fixed inset-0 z-60 bg-[#0B0E14]/95 backdrop-blur-2xl flex flex-col">
      <div className="w-full flex justify-start p-6">
        <button className="flex justify-start items-center text-2xl cursor-pointer hover:text-teal-400 hover:drop-shadow-[0_0_15px_rgba(45,212,191,0.8)] transition-colors">
          <BiArrowBack className="shadow-lg hover:text-shadow-md hover:text-shadow-teal-400" />{" "}
          Voltar
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <a
          href="#top"
          className="text-4xl font-semibold text-white hover:text-teal-400 hover:drop-shadow-[0_0_7px_rgba(45,212,191,0.8)] transition-colors"
        >
          Início
        </a>
        <a
          href="#about"
          className="text-4xl font-semibold text-white hover:text-teal-400 hover:drop-shadow-[0_0_7px_rgba(45,212,191,0.8)] transition-colors"
        >
          Sobre mim
        </a>
        <a
          href="#projects"
          className="text-4xl font-semibold text-white hover:text-teal-400 hover:drop-shadow-[0_0_7px_rgba(45,212,191,0.8)] transition-colors"
        >
          Projetos
        </a>
        <a
          href="#contact"
          className="text-4xl font-semibold text-white hover:text-teal-400 hover:drop-shadow-[0_0_7px_rgba(45,212,191,0.8)] transition-colors"
        >
          Contato
        </a>
      </div>
    </div>
  );
}
