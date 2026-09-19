import type { Metadata } from "next";
import { InboxView, type InboxFilter } from "@/components/admin/InboxView";
import type { InboxMessage } from "@/components/admin/MessageCard";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Inbox | Painel Admin",
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireAdmin();
  const { filter } = await searchParams;

  const supabase = await createServerSupabase();
  // select("*") de propósito: funciona antes E depois da migração. Pedir
  // `is_read` pelo nome derrubaria a página enquanto a coluna não existe.
  // Não lidas primeiro; dentro de cada grupo, as mais recentes no topo.
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  const messages = ((data ?? []) as InboxMessage[]).sort(
    (a, b) => Number(a.is_read === true) - Number(b.is_read === true),
  );

  const activeFilter: InboxFilter = filter === "unread" ? "unread" : "all";

  return (
    <InboxView
      messages={messages}
      filter={activeFilter}
      loadError={error ? `${error.code}: ${error.message}` : undefined}
    />
  );
}
