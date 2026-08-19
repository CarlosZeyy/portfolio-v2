import type { Metadata } from "next";
import { Project } from "@/lib/projectSchema";
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

  return {
    title: `${projectInfo.title} | Carlos Moises`,
    description: projectInfo.description,
    openGraph: {
      title: projectInfo.title,
      description: projectInfo.description,
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

  const project: Project = {
    id: projectInfo.id,
    title: projectInfo.title,
    description: projectInfo.description,
    thumbnail: projectInfo.thumbnail_url,
    stacks: projectInfo.stacks,
    repoUrl: projectInfo.repo_url,
    deployUrl: projectInfo.deploy_url,
    videoUrl: projectInfo.video_url,
    isFeatured: projectInfo.is_featured,
    problemDescription: projectInfo.problem_description,
    solutionDescription: projectInfo.solution_description,
    technicalChallenges: projectInfo.technical_challenges,
    galleryUrls: projectInfo.gallery_urls,
  };

  return <ProjectClient project={project} />;
}
