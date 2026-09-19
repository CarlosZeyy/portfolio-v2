"use client";

import { useState, useTransition } from "react";
import { LuMail, LuMailCheck, LuMailOpen, LuReply, LuTrash2, LuTriangleAlert } from "react-icons/lu";
import {
  deleteMessage,
  setMessageRead,
  type MessageActionResult,
} from "@/app/(admin)/admin/messages/actions";
import { formatDateTime } from "@/lib/formats";
import { buildReplyMailto } from "@/lib/mailto";
import { ADMIN_BUTTON } from "./AdminPageHeader";
import { ConfirmButton } from "./ConfirmButton";

export interface InboxMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  /** Ausente até a migração do Lote 5 rodar. */
  is_read?: boolean | null;
}

// Iniciais para o avatar: "Carlos Moises" -> "CM".
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export function MessageCard({ message }: { message: InboxMessage }) {
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<"read" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isRead = message.is_read === true;
  const sentAt = formatDateTime(message.created_at);

  const run = (kind: "read" | "delete", action: () => Promise<MessageActionResult>) => {
    setError(null);
    setPendingAction(kind);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Não foi possível concluir a ação.");
      setPendingAction(null);
    });
  };

  return (
    <article
      className={`group/glass relative overflow-hidden rounded-3xl shadow-xl shadow-black/40 backdrop-blur-md transition-colors duration-500 ${
        isRead ? "bg-[#0B0E14]/45" : "bg-[#0B0E14]/75"
      }`}
    >
      <div aria-hidden className={`glass-ring pointer-events-none absolute inset-0 rounded-[inherit] ${isRead ? "opacity-40" : ""}`} />
      {/* Não lida: uma barra de luz na lateral, como um LED de notificação. */}
      {!isRead && (
        <div aria-hidden className="absolute inset-y-6 left-0 w-0.5 rounded-full bg-linear-to-b from-teal-300 to-violet-400 shadow-[0_0_12px_#2dd4bf]" />
      )}

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-mono text-sm text-white ${
                isRead ? "bg-white/5" : "bg-linear-to-br from-teal-500/40 to-violet-500/40"
              }`}
            >
              {initials(message.name)}
            </span>
            <div className="min-w-0">
              <p className={`flex items-center gap-2 truncate ${isRead ? "font-medium text-neutral-300" : "font-semibold text-white"}`}>
                {message.name}
                {!isRead && (
                  <span className="rounded-full bg-teal-500/15 px-2 py-0.5 font-mono text-[10px] font-normal tracking-widest text-teal-300 uppercase">
                    nova
                  </span>
                )}
              </p>
              <p className="flex items-center gap-1.5 truncate text-sm text-neutral-400">
                <LuMail className="shrink-0" />
                {message.email}
              </p>
            </div>
          </div>

          <time dateTime={message.created_at} className="font-mono text-xs text-neutral-500">
            {sentAt}
          </time>
        </div>

        {/* whitespace-pre-wrap respeita as quebras de linha do visitante. O
            React escapa o conteúdo: texto de terceiros nunca vira HTML. */}
        <p className={`mt-5 leading-relaxed wrap-break-word whitespace-pre-wrap ${isRead ? "text-neutral-400" : "text-neutral-200"}`}>
          {message.message}
        </p>

        {error && (
          <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <LuTriangleAlert className="mt-0.5 shrink-0" /> {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
          <a
            href={buildReplyMailto({ ...message, sentAt })}
            // Responder É ler: marca junto, sem exigir um segundo clique.
            onClick={() => !isRead && run("read", () => setMessageRead(message.id, true))}
            className={ADMIN_BUTTON.primary}
          >
            <LuReply /> Responder
          </a>

          <button
            type="button"
            disabled={pending}
            onClick={() => run("read", () => setMessageRead(message.id, !isRead))}
            className={`${ADMIN_BUTTON.ghost} cursor-pointer disabled:cursor-wait disabled:opacity-60`}
          >
            {isRead ? <LuMailOpen /> : <LuMailCheck />}
            {isRead ? "Marcar como não lida" : "Marcar como lida"}
          </button>

          <ConfirmButton
            pending={pending && pendingAction === "delete"}
            icon={<LuTrash2 />}
            label="Excluir"
            confirmLabel="Excluir mesmo?"
            className="ml-auto"
            onConfirm={() => run("delete", () => deleteMessage(message.id))}
          />
        </div>
      </div>
    </article>
  );
}
