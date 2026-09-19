"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

export interface MessageActionResult {
  ok: boolean;
  error?: string;
}

// Com RLS, um UPDATE/DELETE sem permissão NÃO devolve erro: afeta 0 linhas e
// responde sucesso. Por isso as duas actions pedem as linhas de volta
// (.select("id")) e tratam "nenhuma linha" como falha — é a diferença entre
// "marcado como lido" e um botão que mente.
const NOT_AFFECTED =
  "Nenhuma linha foi alterada. Confira as policies de UPDATE/DELETE da tabela messages (supabase/migration_and_security_patch.sql).";

export async function setMessageRead(
  id: string,
  isRead: boolean,
): Promise<MessageActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("messages")
    .update({ is_read: isRead })
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: NOT_AFFECTED };

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<MessageActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("messages")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: NOT_AFFECTED };

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true };
}
