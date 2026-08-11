import { Project } from "@/lib/projectSchema";
import { stackIcons } from "@/lib/stackIcons";
import { createServerSupabase } from "@/lib/supabase-server";
import { SpaceBackground } from "@/components/SpaceBackground";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BiArrowBack } from "react-icons/bi";
import { FaGithub, FaArrowUpRightFromSquare } from "react-icons/fa6";
import ProjectClient from "@/components/ProjectClient";

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
