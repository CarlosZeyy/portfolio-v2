import { createServerSupabase } from "@/lib/supabase-server";
import { updateProject } from "../../actions";
import { FiUpload } from "react-icons/fi";
import Link from "next/link";
import { BiArrowBack } from "react-icons/bi";

export default async function editProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerSupabase();

  const { id } = await params;

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  const formatStacks: string = project?.stacks
    ? project.stacks?.join(", ")
    : "";

  return (
    <>
      <div className="min-h-screen bg-neutral-950 text-white text p-8 flex flex-col items-center pt-24">
        <h1 className="text-xl font-semibold mb-2">
          Editando projeto de ID: {id}{" "}
        </h1>

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
            action={updateProject}
          >
            <input type="hidden" name="id" value={id} />

            <div className="text-sm font-medium text-neutral-300">
              <label className="text-sm font-medium text-neutral-300">
                Titulo do projeto:
              </label>
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
                type="text"
                name="title"
                defaultValue={project.title}
              />
            </div>

            <div className="text-sm font-medium text-neutral-300">
              <label className="text-sm font-medium text-neutral-300">
                Descrição do projeto:
              </label>
              <textarea
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
                name="description"
                defaultValue={project.description}
              ></textarea>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-300">
                Thumbnail do projeto:
              </label>

              <input
                type="file"
                id="file-upload"
                name="thumbnail_url"
                className="hidden"
              />

              <input
                type="hidden"
                name="existing_thumbnail"
                value={project.thumbnail_url}
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
                  !project.thumbnail_url
                    ? "text-gray-500"
                    : "text-teal-600 font-medium"
                }`}
              >
                {project.thumbnail_url}
              </p>
            </div>

            <div className="text-sm font-medium text-neutral-300">
              <label className="text-sm font-medium text-neutral-300">
                Stacks do projeto:
              </label>
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
                type="text"
                name="stacks"
                defaultValue={formatStacks}
              />
            </div>

            <div className="text-sm font-medium text-neutral-300">
              <label className="text-sm font-medium text-neutral-300">
                Repositório do projeto:
              </label>
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
                type="text"
                name="repo_url"
                defaultValue={project.repo_url}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-300">
                URL do Deploy (Opcional):
              </label>
              <input
                type="text"
                name="deploy_url"
                defaultValue={project.deploy_url}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-300">
                URL do Vídeo (Opcional):
              </label>
              <input
                type="text"
                name="video_url"
                defaultValue={project.video_url}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                defaultChecked={project.is_featured}
                className="w-5 h-5 rounded border-neutral-700 bg-neutral-900 accent-teal-500 cursor-pointer transition-all"
              />
              <label
                htmlFor="is_featured"
                className="text-sm font-medium text-neutral-300 cursor-pointer select-none"
              >
                Destacar este projeto na página inicial
              </label>
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
            >
              Salvar edição
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
