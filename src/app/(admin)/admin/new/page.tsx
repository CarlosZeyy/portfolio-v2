"use client";

import { addProject } from "@/app/(admin)/admin/actions";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { FiUpload } from "react-icons/fi";

const addProjectPage = () => {
  const [fileName, setFileName] = useState<string>(
    "Nenhum arquivo selecionado",
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
    } else {
      setFileName("Nenhum arquivo selecionado");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 flex flex-col items-center justify-center pt-24">
      <h1 className="text-xl font-semibold mb-2">Adicionar Novo Projeto</h1>

      <Link
        href={`/admin/`}
        className="w-fit flex justify-center items-center gap-2 cursor-pointer rounded-lg bg-teal-600 py-3 px-5 my-2 text-xl font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
      >
        <BiArrowBack className="shadow-lg hover:text-shadow-md hover:text-shadow-teal-400" />{" "}
        Voltar para pagina de projetos
      </Link>

      <div className="min-w-3xl translate-x-10">
        <form
          className="bg-white/5 border border-neutral-800 backdrop-blur-md rounded-xl p-8 shadow-xl flex flex-col gap-6 w-full max-w-2xl mt-8"
          action={addProject}
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-300">
              Titulo do projeto:
            </label>
            <input
              type="text"
              name="title"
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-300">
              Descrição do projeto:
            </label>
            <textarea
              id=""
              name="description"
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
            ></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-300">
              Thumbnail do projeto:
            </label>

            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
            />

            <label
              htmlFor="file-upload"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-teal-800 to-teal-300 px-6 py-3 font-semibold text-white shadow-lg shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-teal-500/50 active:translate-y-0 cursor-pointer"
            >
              <FiUpload className="text-xl transition-transform duration-300 group-hover:scale-110" />
              <span>Escolher Arquivo</span>
            </label>

            <p
              className={`text-sm italic transition-colors duration-300 ${
                fileName !== "Nenhum arquivo selecionado"
                  ? "text-teal-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              {fileName}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-300">
              Stacks do projeto:
            </label>
            <input
              type="text"
              name="stacks"
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-300">
              Repositório do projeto:
            </label>
            <input
              type="text"
              name="repo_url"
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
          >
            Adicionar Novo Projeto
          </button>
        </form>
      </div>
    </div>
  );
};

export default addProjectPage;
