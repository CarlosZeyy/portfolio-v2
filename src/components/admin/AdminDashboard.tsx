import Link from "next/link";
import { LuArrowUpRight, LuInbox, LuPlus, LuRocket } from "react-icons/lu";
import { GlassPanel } from "@/components/GlassPanel";
import { translationProgress } from "@/lib/projectLocale";
import type { Project } from "@/lib/projectSchema";
import { ADMIN_BUTTON, AdminPageHeader } from "./AdminPageHeader";
import { ProjectAdminCard } from "./ProjectAdminCard";

export interface DashboardProject {
  project: Project;
  createdAt: string;
}

interface AdminDashboardProps {
  userName: string;
  projects: DashboardProject[];
  unreadMessages: number;
  totalMessages: number;
}

/**
 * Só apresentação: recebe tudo pronto. A busca no Supabase e a autenticação
 * ficam no page.tsx — assim a tela pode ser montada com dados fictícios sem
 * sessão nem banco.
 */
export function AdminDashboard({
  userName,
  projects,
  unreadMessages,
  totalMessages,
}: AdminDashboardProps) {
  const translated = projects.filter(({ project }) => {
    const { done, total } = translationProgress(project);
    return done === total;
  }).length;

  const stats = [
    { label: "projetos", value: projects.length },
    { label: "em inglês", value: `${translated}/${projects.length}` },
    { label: "mensagens", value: totalMessages },
    { label: "não lidas", value: unreadMessages, highlight: unreadMessages > 0 },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pt-20 pb-24 text-white">
      <AdminPageHeader
        path="~/admin"
        title={
          <>
            Olá,{" "}
            <span className="bg-linear-to-r from-teal-300 to-violet-400 bg-clip-text text-transparent">
              {userName}
            </span>
          </>
        }
        description="Central de comando do portfólio: projetos, traduções e mensagens."
      >
        <Link href="/" className={ADMIN_BUTTON.ghost}>
          Ver o site <LuArrowUpRight />
        </Link>
        <Link href="/admin/messages" className={ADMIN_BUTTON.ghost}>
          <LuInbox /> Inbox
          {unreadMessages > 0 && (
            <span className="rounded-full bg-teal-500 px-2 py-0.5 font-mono text-[11px] font-semibold text-black">
              {unreadMessages}
            </span>
          )}
        </Link>
        <Link href="/admin/new" className={ADMIN_BUTTON.primary}>
          <LuPlus /> Novo projeto
        </Link>
      </AdminPageHeader>

      <GlassPanel className="mt-10" contentClassName="grid grid-cols-2 divide-white/10 sm:grid-cols-4 sm:divide-x" spotlight={false}>
        {stats.map((stat) => (
          <div key={stat.label} className="px-6 py-5">
            <p className={`font-mono text-3xl font-light ${stat.highlight ? "text-teal-300" : "text-white"}`}>
              {stat.value}
            </p>
            <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-neutral-500 uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </GlassPanel>

      <h2 className="mt-14 mb-6 font-mono text-xs tracking-[0.2em] text-neutral-400 uppercase">
        Projetos
      </h2>

      {projects.length === 0 ? (
        <GlassPanel contentClassName="flex flex-col items-center gap-4 px-6 py-20 text-center" spotlight={false}>
          <LuRocket className="text-4xl text-teal-300" />
          <p className="text-lg font-medium">Nenhum projeto cadastrado ainda.</p>
          <Link href="/admin/new" className={ADMIN_BUTTON.primary}>
            <LuPlus /> Cadastrar o primeiro
          </Link>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map(({ project, createdAt }) => (
            <ProjectAdminCard key={project.id} project={project} createdAt={createdAt} />
          ))}
        </div>
      )}
    </div>
  );
}
