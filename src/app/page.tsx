import { FaGithub } from "react-icons/fa6";
import { createServerSupabase } from "@/lib/supabase-server";
import { ProjectCard } from "@/components/ProjectCard";
import { Project } from "@/lib/projectSchema";

const GITHUB_URL = "https://github.com/CarlosZeyy";

export default async function Home() {
  const supabase = await createServerSupabase();
  const { data: rawProjects } = await supabase.from("projects").select("*");

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
    })) || [];

  const hasProjects = projects.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F8FA] font-sans transition-colors duration-300 dark:bg-[#0B0E14]">
      {/* Blobs ambiente, ecoando a tela de login */}
      <div className="pointer-events-none absolute -left-24 -top-32 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/10" />
      <div className="pointer-events-none absolute right-0 top-96 h-80 w-80 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-500/10" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Identidade */}
        <header className="flex items-center justify-between py-8">
          <span className="font-mono text-sm text-neutral-500 dark:text-neutral-400">
            carlosmoises
            <span className="text-teal-600 dark:text-teal-400">.dev</span>
          </span>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-600"
          >
            <FaGithub />
            GitHub
          </a>
        </header>

        {/* Hero */}
        <section className="py-16 sm:py-24">
          <p className="font-mono text-sm text-teal-600 dark:text-teal-400">
            carlosmoises@dev ~ % whoami
            <span className="ml-1 animate-pulse">▍</span>
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
            Olá, sou o Carlos.
          </h1>
          <p className="mt-4 max-w-xl text-base font-light text-neutral-500 dark:text-neutral-400">
            Desenvolvedor full stack — do banco de dados à interface. Trabalho
            com React, Next.js e Node.js no dia a dia, além de Java com Spring
            Boot e um pouco de infraestrutura quando o projeto pede.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#projetos"
              className="rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
            >
              Ver projetos
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-600"
            >
              Ver código no GitHub
            </a>
          </div>
        </section>

        {/* Projetos */}
        <section id="projetos" className="scroll-mt-8 pb-24">
          <p className="font-mono text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            ~/projetos
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Projetos
          </h2>

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
                  Os primeiros commits estão a caminho — volte em breve.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
