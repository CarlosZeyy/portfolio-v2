import { createServerSupabase } from "@/lib/supabase-server";
import { Project } from "@/lib/projectSchema";
import { projectFromRow, type ProjectRow } from "@/lib/projectLocale";
import { Hero } from "@/components/Hero";
import { ProjectText } from "@/components/ProjectText";
import { SpaceBackground } from "@/components/SpaceBackground";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { ProjectList } from "@/components/ProjectGallery";
import Contact from "@/components/Contact";
import { View2D } from "@/components/View2D";
import SplashScreen from "@/components/SplashScreen";
import { ContentOverlay } from "@/components/ContentOverlay";

export default async function Home() {
  const supabase = await createServerSupabase();
  const { data: rawProjects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const projects: Project[] = ((rawProjects ?? []) as ProjectRow[]).map(
    projectFromRow,
  );

  const hasProjects = projects.length > 0;

  // Um único elemento para os dois mundos: a seção #projects do modo 2D e o
  // painel de vidro do hub 3D. Como page.tsx é Server Component, o fetch do
  // Supabase acontece aqui e os Client Components recebem tudo pronto, como
  // ReactNode. Só um dos dois está montado por vez (View2D x ContentOverlay).
  const projectsContent = hasProjects ? (
    <ProjectList projects={projects} />
  ) : (
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
  );

  return (
    <div className="relative min-h-screen overflow-hidden font-sans transition-colors duration-300">
      {/* <StarBackground /> */}
      <SpaceBackground />
      <SplashScreen />
      {/* `embedded`: só a timeline. O painel do hub já é o vidro e já tem o
          título; a seção completa ali seria vidro dentro de vidro. */}
      <ContentOverlay
        sections={{
          experience: <Experience embedded />,
          contact: <Contact embedded />,
          projects: projectsContent,
        }}
      />

      <View2D>
        {/* Hero */}
        <Hero />

        {/* About */}
        <About />

        {/* Experiência */}
        <Experience />

        {/* Projetos */}
        <section id="projects" className="scroll-mt-8 pb-24">
          <ProjectText />

          <div className="mt-8">{projectsContent}</div>
        </section>

        {/* Contact */}
        <Contact />
      </View2D>
    </div>
  );
}
