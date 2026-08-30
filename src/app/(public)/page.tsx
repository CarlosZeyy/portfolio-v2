import { createServerSupabase } from "@/lib/supabase-server";
import { Project } from "@/lib/projectSchema";
import { Hero } from "@/components/Hero";
import { ProjectText } from "@/components/ProjectText";
import { SpaceBackground } from "@/components/SpaceBackground";
import { About } from "@/components/About";
import { ProjectList } from "@/components/ProjectGallery";
import Contact from "@/components/Contact";

export default async function Home() {
  const supabase = await createServerSupabase();
  const { data: rawProjects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const projects: Project[] =
    rawProjects?.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      thumbnail: p.thumbnail_url,
      stacks: p.stacks,
      repoUrl: p.repo_url,
      deployUrl: p.deploy_url,
      videoUrl: p.video_url,
      isFeatured: p.is_featured,
    })) || [];

  const hasProjects = projects.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden font-sans transition-colors duration-300">
      {/* <StarBackground /> */}
      <SpaceBackground />

      {/* Blobs ambiente, ecoando a tela de login */}
      <div className="pointer-events-none absolute -left-24 -top-32 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/10" />
      <div className="pointer-events-none absolute right-0 top-96 h-80 w-80 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-500/10" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Hero */}
        <Hero />

        {/* About */}
        <About />

        {/* Projetos */}
        <section id="projects" className="scroll-mt-8 pb-24">
          <ProjectText />

          <div className="mt-8">
            {!hasProjects ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center dark:border-neutral-700">
                <p className="font-mono text-xs text-neutral-400 dark:text-neutral-600">
                  git log --oneline
                </p>
                <p className="mt-3 text-base font-medium text-neutral-700 dark:text-neutral-300">
                  Nenhum projeto publicado ainda.
                </p>
                <p className="mt-1 text-sm font-light text-neutral-500 dark:text-neutral-400">
                  Os primeiros commits estão a caminho! volte em breve.
                </p>
              </div>
            ) : (
              <ProjectList projects={projects} />
            )}
          </div>
        </section>

        {/* Contact */}
        <Contact />
      </div>
    </div>
  );
}
