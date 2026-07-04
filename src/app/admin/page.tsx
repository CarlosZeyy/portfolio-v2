import { formatDate, formatEmail } from "@/components/formats";
import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

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
    <div>
      <h1>Bem vindo {user.email ? formatEmail(user.email) : "Admin"}</h1>

      <div>
        <h2>Lista de projetos</h2>
      </div>

      {projects.data?.length === 0 ? (
        <p>Você não possui nenhum projeto cadastrado.</p>
      ) : (
        projects.data?.map((project) => (
          <div key={project.id}>
            <p>Titulo: {project.title || "Nenhum titulo encontrado"}</p>

            <p>
              Descrição: {project.description || "Nenhuma descrição encontrada"}
            </p>

            <p>
              Repositório:{" "}
              <a href={project.repo_url || "#"} target="_blank">
                {project.repo_url || "Nenhum repositório encontrado"}
              </a>
            </p>

            <p>
              Stacks: {project.stacks?.join(" ") || "Nenhuma stack encontrada"}
            </p>

            <p>
              Upload feito em: {formatDate(project.created_at) || Date.now()}
            </p>
          </div>
        ))
      )}

      <Link href={"/admin/new"} className="border-2">Adicionar um novo projeto</Link>
    </div>
  );
}
