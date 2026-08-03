import { Project } from "@/lib/projectSchema";
import { stackIcons } from "@/lib/stackIcons";
import { createServerSupabase } from "@/lib/supabase-server";
import Link from "next/link";

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

  const project: Project = projectInfo;

  const stacks = project.stacks;

  return (
    <>
      <h1>{project.title}</h1>

      <span>{stacks.length > 0 && (
          <div
            className="mt-4 mb-4 flex flex-wrap gap-1.5"
          >
            {stacks.map((stack) => {
              const stackData = stackIcons[stack];
              const ComponentIcon = stackData?.icon;

              return (
                <span
                  key={stack}
                  className="flex items-center shrink-0 whitespace-nowrap gap-1.5 rounded-full border border-neutral-200 bg-neutral-100/60 px-2.5 py-1 font-mono text-[11px] font-medium text-neutral-600 transition-colors hover:bg-neutral-200/60 dark:border-neutral-800 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
                >
                  {ComponentIcon && (
                    <ComponentIcon className="text-sm opacity-70" />
                  )}
                  {stack}
                </span>
              );
            })}
          </div>
        )}</span>

      <p>{project.description}</p>

      <Link href={`/#projects`}>
        <button>Voltar</button>
      </Link>
    </>
  );
}
