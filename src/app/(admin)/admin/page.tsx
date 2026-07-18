import { formatDate } from "@/lib/formats";
import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { deleteProject } from "./actions";
import { FaTrash, FaEdit } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";

export default async function AdminPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    redirect("/login");
  }

  const projects = await supabase.from("projects").select("*");

  return (
    <div className="min-h-screen  text-white p-8 flex flex-col items-center justify-center pt-24">
      <h1 className="text-3xl">
        Olá,{" "}
        <span className="font-bold">
          {user
            ? user.user_metadata?.full_name || user.user_metadata?.name
            : "Admin"}
        </span>
      </h1>

      <br />

      <div className="text-xl">
        <h2>Lista de projetos</h2>
      </div>

      <br />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mt-8">
        {projects.data?.length === 0 ? (
          <p>Você não possui nenhum projeto cadastrado.</p>
        ) : (
          projects.data?.map((project) => (
            <div
              key={project.id}
              className="flex flex-col bg-white/5 border border-neutral-800 backdrop-blur-md rounded-xl overflow-hidden shadow-xl"
            >
              <img
                src={project.thumbnail_url}
                alt={project.title}
                className="w-full aspect-video object-cover bg-neutral-900"
              />

              <div className="p-6 flex flex-col gap-3 grow">
                <p className="text-lg font-bold text-white">
                  Titulo: {project.title || "Nenhum titulo encontrado"}
                </p>

                <p className="text-sm text-neutral-400 line-clamp-2">
                  Descrição:{" "}
                  {project.description || "Nenhuma descrição encontrada"}
                </p>

                <p className="text-sm text-neutral-400">
                  Repositório:{" "}
                  <a href={project.repo_url || "#"} target="_blank">
                    {project.repo_url || "Nenhum repositório encontrado"}
                  </a>
                </p>

                <p className="text-sm text-neutral-400">
                  Stacks:{" "}
                  {project.stacks?.join(" ") || "Nenhuma stack encontrada"}
                </p>

                <p className="text-sm text-neutral-400">
                  Upload feito em:{" "}
                  {formatDate(project.created_at) || Date.now()}
                </p>
              </div>

              <div className="mt-auto flex justify-around items-center border-t border-neutral-800">
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <button
                    type="submit"
                    className="flex gap-3 flex-1 p-4 text-center cursor-pointer hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    <FaTrash /> Excluir Projeto
                  </button>
                </form>

                <div>
                  <Link
                    href={`/admin/edit/${project.id}`}
                    className="flex gap-3 flex-1 p-4 text-center cursor-pointer hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    <FaEdit /> Editar Projeto
                  </Link>
                </div>
              </div>

              <br />
            </div>
          ))
        )}
      </div>

      <Link
        href={"/admin/new"}
        className={`mt-10 flex gap-3 justify-center items-center w-max py-4 px-4 cursor-pointer rounded-lg bg-teal-600 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"`}
      >
        Adicionar Novo Projeto <FaPlus />
      </Link>
    </div>
  );
}
