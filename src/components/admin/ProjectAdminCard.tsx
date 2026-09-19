import Link from "next/link";
import { LuExternalLink, LuLanguages, LuPencil, LuStar } from "react-icons/lu";
import { StackChip } from "@/components/StackChip";
import { formatDate } from "@/lib/formats";
import { translationProgress } from "@/lib/projectLocale";
import type { Project } from "@/lib/projectSchema";
import { ADMIN_BUTTON } from "./AdminPageHeader";
import { AdminThumb } from "./AdminThumb";
import { DeleteProjectButton } from "./DeleteProjectButton";

const MAX_STACKS = 5;

interface ProjectAdminCardProps {
  project: Project;
  createdAt: string;
}

export function ProjectAdminCard({ project, createdAt }: ProjectAdminCardProps) {
  const stacks = project.stacks ?? [];
  const { done, total } = translationProgress(project);
  const translated = done === total;

  return (
    <article className="group/card relative flex h-full flex-col overflow-hidden rounded-[20px] bg-[#0B0E14]/70 shadow-xl shadow-black/40 backdrop-blur-md transition-shadow duration-500 hover:shadow-2xl hover:shadow-teal-900/30">
      <div
        aria-hidden
        className="glass-ring pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-60 transition-opacity duration-500 group-hover/card:opacity-100"
      />

      <div className="relative p-2 pb-0">
        <AdminThumb
          src={project.thumbnail}
          alt={project.title}
          className="aspect-video w-full rounded-[14px]"
        />

        {project.isFeatured && (
          <span className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-black/55 px-2.5 py-1 font-mono text-[10px] tracking-wider text-amber-200 uppercase backdrop-blur-sm">
            <LuStar className="text-xs" /> destaque
          </span>
        )}
      </div>

      <div className="flex grow flex-col p-6 pt-5">
        <h3 className="text-lg font-semibold tracking-tight text-white">
          {project.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-400">
          {project.description}
        </p>

        {stacks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {stacks.slice(0, MAX_STACKS).map((stack) => (
              <StackChip key={stack} stack={stack} />
            ))}
            {stacks.length > MAX_STACKS && (
              <span className="flex items-center rounded-full border border-dashed border-white/15 px-2.5 py-1 font-mono text-[11px] text-neutral-400">
                +{stacks.length - MAX_STACKS}
              </span>
            )}
          </div>
        )}

        <dl className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-neutral-500">
          <div className="flex gap-1.5">
            <dt>criado</dt>
            <dd className="text-neutral-300">{formatDate(new Date(createdAt))}</dd>
          </div>
          {/* Status da tradução: mostra de relance o que falta para o projeto
              aparecer completo para quem navega em inglês. */}
          <div
            className={`flex items-center gap-1.5 ${
              translated ? "text-teal-300" : done > 0 ? "text-amber-300" : "text-neutral-500"
            }`}
          >
            <LuLanguages className="text-sm" />
            <dt className="sr-only">tradução</dt>
            <dd>
              EN {done}/{total}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
          <Link href={`/admin/edit/${project.id}`} className={`${ADMIN_BUTTON.ghost} flex-1`}>
            <LuPencil /> Editar
          </Link>
          <DeleteProjectButton id={project.id as string} />
          <Link
            href={`/project/${project.id}`}
            target="_blank"
            aria-label="Ver no site"
            title="Ver no site"
            className={`${ADMIN_BUTTON.ghost} px-3`}
          >
            <LuExternalLink />
          </Link>
        </div>
      </div>
    </article>
  );
}
