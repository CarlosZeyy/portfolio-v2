import { notFound } from "next/navigation";
import { updateProject } from "@/app/(admin)/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/auth";
import { projectFromRow, type ProjectRow } from "@/lib/projectLocale";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // Antes, um id inexistente quebrava a página em `project.title` (null).
  if (!data) notFound();
  const project = projectFromRow(data as ProjectRow);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 pt-20 text-white">
      <AdminPageHeader
        path={`~/admin/editar/${id.slice(0, 8)}`}
        title={project.title}
        back={{ href: "/admin", label: "Voltar ao painel" }}
      />
      <ProjectForm mode="edit" action={updateProject} project={project} />
    </div>
  );
}
