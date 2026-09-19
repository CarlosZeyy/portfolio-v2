import Link from "next/link";
import { LuInbox, LuTriangleAlert } from "react-icons/lu";
import { GlassPanel } from "@/components/GlassPanel";
import { AdminPageHeader } from "./AdminPageHeader";
import { MessageCard, type InboxMessage } from "./MessageCard";

export type InboxFilter = "all" | "unread";

interface InboxViewProps {
  messages: InboxMessage[];
  filter: InboxFilter;
  /** Erro da consulta, se houver: mostrado no lugar da lista. */
  loadError?: string;
}

const FILTERS: { id: InboxFilter; label: string; href: string }[] = [
  { id: "all", label: "Todas", href: "/admin/messages" },
  { id: "unread", label: "Não lidas", href: "/admin/messages?filter=unread" },
];

export function InboxView({ messages, filter, loadError }: InboxViewProps) {
  const unread = messages.filter((message) => message.is_read !== true);
  const visible = filter === "unread" ? unread : messages;
  // A coluna só aparece no resultado depois da migração.
  const needsMigration = messages.length > 0 && !("is_read" in messages[0]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 pt-20 pb-24 text-white">
      <AdminPageHeader path="~/admin/inbox" title="Inbox" back={{ href: "/admin", label: "Voltar ao painel" }}>
        <nav aria-label="Filtro" className="flex rounded-xl border border-white/10 bg-black/30 p-1">
          {FILTERS.map((item) => {
            const count = item.id === "unread" ? unread.length : messages.length;
            const active = filter === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-300 ${
                  active
                    ? "bg-linear-to-r from-teal-500/25 to-violet-500/25 text-white shadow-[inset_0_0_0_1px_rgb(45_212_191/0.4)]"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {item.label}
                <span className="font-mono text-xs text-neutral-500">{count}</span>
              </Link>
            );
          })}
        </nav>
      </AdminPageHeader>

      {needsMigration && (
        <p className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-300/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
          <LuTriangleAlert className="mt-0.5 shrink-0" />
          <span>
            A coluna <code className="font-mono">is_read</code> ainda não existe. Rode{" "}
            <code className="font-mono">supabase/lote5.sql</code> para liberar o lida/não lida e a exclusão.
          </span>
        </p>
      )}

      {loadError ? (
        // Erro explícito em vez de lista vazia: com RLS, "sem permissão" e "sem
        // mensagens" devolvem o mesmo [] — esconder o erro faria a Inbox
        // parecer vazia quando é a policy que está barrando a leitura.
        <GlassPanel className="mt-10" spotlight={false}>
          <p className="font-medium text-rose-300">Não foi possível carregar as mensagens.</p>
          <p className="mt-2 font-mono text-xs text-neutral-400">{loadError}</p>
        </GlassPanel>
      ) : visible.length === 0 ? (
        <GlassPanel className="mt-10" contentClassName="flex flex-col items-center gap-3 px-6 py-16 text-center" spotlight={false}>
          <LuInbox className="text-4xl text-neutral-500" />
          <p className="font-medium">
            {filter === "unread" && messages.length > 0 ? "Tudo lido por aqui." : "Nenhuma mensagem por aqui."}
          </p>
        </GlassPanel>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {visible.map((message) => (
            <li key={message.id}>
              <MessageCard message={message} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
