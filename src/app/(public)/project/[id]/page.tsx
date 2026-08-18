import { Project } from "@/lib/projectSchema";
import { createServerSupabase } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ProjectClient from "@/components/ProjectClient";

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
