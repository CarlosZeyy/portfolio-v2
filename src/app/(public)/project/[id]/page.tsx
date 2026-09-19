import type { Metadata } from "next";
import {
  localizeProject,
  projectFromRow,
  type ProjectRow,
} from "@/lib/projectLocale";
import { getRequestLocale } from "@/i18n/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ProjectClient from "@/components/ProjectClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const supabase = await createServerSupabase();

  const { id } = await params;

  const { data: projectInfo } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

    if (!projectInfo) {
    return {
      title: "Projeto não encontrado | Carlos Moises",
      description: "Este projeto não existe ou foi removido.",
    };
  }

  // <title> e Open Graph no idioma do visitante (cookie ou Accept-Language).
  const project = localizeProject(
    projectFromRow(projectInfo as ProjectRow),
    await getRequestLocale(),
  );

  return {
    title: `${project.title} | Carlos Moises`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [projectInfo.thumbnail_url || "/fallback-thumb.jpeg"],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: projectInfo } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!projectInfo) {
    notFound();
  }

  const project = projectFromRow(projectInfo as ProjectRow);

  return <ProjectClient project={project} />;
}
