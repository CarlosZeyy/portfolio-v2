import { addProject } from "@/app/(admin)/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/auth";

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 pt-20 text-white">
      <AdminPageHeader
        path="~/admin/novo"
        title="Novo projeto"
        description="Preencha em português; o inglês pode vir depois, campo a campo."
        back={{ href: "/admin", label: "Voltar ao painel" }}
      />
      <ProjectForm mode="create" action={addProject} />
    </div>
  );
}
