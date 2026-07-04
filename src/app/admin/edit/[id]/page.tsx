import { createServerSupabase } from "@/lib/supabase-server";
import { updateProject } from "../../actions";

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
      <div className="flex">
        <h1>Editando projeto de ID: {id} </h1>

        <div className="flex">
          <form action={updateProject} className="flex flex-col">
            <input type="hidden" name="id" value={id} />

            <label>Titulo do projeto:</label>
            <input type="text" name="title" defaultValue={project.title} />

            <label>Descrição do projeto:</label>
            <input
              type="text"
              name="description"
              defaultValue={project.description}
            />

            <label>Thumbnail do projeto:</label>
            <input
              type="text"
              name="thumbnail_url"
              defaultValue={project.thumbnail_url}
            />

            <label>Stacks do projeto:</label>
            <input type="text" name="stacks" defaultValue={formatStacks} />

            <label>Repositório do projeto:</label>
            <input
              type="text"
              name="repo_url"
              defaultValue={project.repo_url}
            />
            <button type="submit" className="cursor-pointer">
              Salvar edição
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
