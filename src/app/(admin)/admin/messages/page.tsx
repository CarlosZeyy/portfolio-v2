import type { Metadata } from "next";
import Link from "next/link";
import { LuArrowLeft, LuInbox, LuMail, LuReply } from "react-icons/lu";
import { GlassPanel } from "@/components/GlassPanel";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/formats";
import { createServerSupabase } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Inbox | Painel Admin",
};

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

// Iniciais para o avatar: "Carlos Moises" -> "CM".
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const replyHref = (message: Message) =>
  `mailto:${message.email}?subject=${encodeURIComponent(
    `Re: sua mensagem no meu portfólio`,
  )}&body=${encodeURIComponent(`Olá, ${message.name}!\n\n`)}`;

export default async function MessagesPage() {
  await requireAdmin();

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("messages")
    .select("id, name, email, message, created_at")
    .order("created_at", { ascending: false });

  const messages: Message[] = data ?? [];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 pt-24 pb-16 text-white">
      <Link
        href="/admin"
        className="group flex w-fit items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-teal-400"
      >
        <LuArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
        Voltar ao painel
      </Link>

      <header className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-wide text-teal-400 uppercase">
            ~/admin/inbox
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Inbox</h1>
        </div>
        <p className="font-mono text-sm text-neutral-400">
          <span className="text-white">{messages.length}</span>{" "}
          {messages.length === 1 ? "mensagem" : "mensagens"}
        </p>
      </header>

      {error ? (
        // Erro explícito em vez de lista vazia: com RLS, "sem permissão" e
        // "sem mensagens" devolvem o mesmo [] — esconder o erro faria a Inbox
        // parecer vazia quando na verdade a policy está barrando a leitura.
        <GlassPanel className="mt-10" spotlight={false}>
          <p className="font-medium text-rose-300">
            Não foi possível carregar as mensagens.
          </p>
          <p className="mt-2 font-mono text-xs text-neutral-400">
            {error.code}: {error.message}
          </p>
        </GlassPanel>
      ) : messages.length === 0 ? (
        <GlassPanel
          className="mt-10"
          contentClassName="flex flex-col items-center gap-3 px-6 py-16 text-center"
          spotlight={false}
        >
          <LuInbox className="text-4xl text-neutral-500" />
          <p className="font-medium">Nenhuma mensagem por aqui.</p>
          <p className="max-w-sm text-sm text-neutral-400">
            Se você sabe que existem mensagens no banco, confira a policy de
            SELECT da tabela <code className="font-mono">messages</code>: o RLS
            devolve lista vazia (e não erro) para quem não tem permissão.
          </p>
        </GlassPanel>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {messages.map((message) => (
            <li key={message.id}>
              <GlassPanel contentClassName="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500/30 to-violet-500/30 font-mono text-sm text-white">
                      {initials(message.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{message.name}</p>
                      <a
                        href={`mailto:${message.email}`}
                        className="flex items-center gap-1.5 truncate text-sm text-neutral-400 transition-colors hover:text-teal-300"
                      >
                        <LuMail className="shrink-0" />
                        {message.email}
                      </a>
                    </div>
                  </div>

                  <time
                    dateTime={message.created_at}
                    className="font-mono text-xs text-neutral-500"
                  >
                    {formatDateTime(message.created_at)}
                  </time>
                </div>

                {/* whitespace-pre-wrap: respeita as quebras de linha que o
                    visitante digitou. O React escapa o conteúdo — a mensagem é
                    texto de terceiros e nunca é interpretada como HTML. */}
                <p className="mt-5 leading-relaxed break-words whitespace-pre-wrap text-neutral-200">
                  {message.message}
                </p>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <a
                    href={replyHref(message)}
                    className="flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400/40 hover:bg-white/10"
                  >
                    <LuReply /> Responder
                  </a>
                </div>
              </GlassPanel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
