"use server";

import { z } from "zod";
import {
  contactSchema,
  type ContactErrorKey,
  type ContactField,
  type ContactFormState,
} from "@/lib/contactSchema";
import { createServerSupabase } from "@/lib/supabase-server";

// PostgREST (PGRST205) / Postgres (42P01): a tabela ainda não foi criada.
const MISSING_TABLE_CODES = new Set(["PGRST205", "42P01"]);


export async function sendEmail(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: campo invisível para humanos. Bot que preenche tudo cai aqui e
  // recebe um "sucesso" falso — sem validar, sem gravar, sem dar pista.
  if (formData.get("website")) {
    return { status: "success", message: "contact.status.success" };
  }

  const values: Record<ContactField, string> = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      status: "error",
      message: "contact.status.invalid",
      // O zod tipa mensagens como string; as nossas são sempre ContactErrorKey
      // (ver contactSchema.ts), então o cast só devolve o tipo que já é.
      fieldErrors: {
        name: fieldErrors.name?.[0] as ContactErrorKey | undefined,
        email: fieldErrors.email?.[0] as ContactErrorKey | undefined,
        message: fieldErrors.message?.[0] as ContactErrorKey | undefined,
      },
      values,
    };
  }

  const supabase = await createServerSupabase();
  // Sem .select(): a policy do anon é só de INSERT (ver supabase/messages.sql),
  // e pedir a linha de volta exigiria liberar leitura da tabela.
  const { error } = await supabase.from("messages").insert(parsed.data);

  if (!error) {
    return {
      status: "success",
      message: "contact.status.success",
      delivery: "database",
    };
  }

  // Tabela ainda não existe: em DESENVOLVIMENTO vira mock, para o formulário
  // ser usável antes de conectar o banco. Em produção é erro de verdade — um
  // "enviado!" para uma mensagem que não foi a lugar nenhum faria um visitante
  // real achar que falou com você.
  if (MISSING_TABLE_CODES.has(error.code) && process.env.NODE_ENV !== "production") {
    console.warn(
      '[contato] tabela "messages" não encontrada — modo mock. Rode supabase/messages.sql para persistir.',
      parsed.data,
    );
    return {
      status: "success",
      message: "contact.status.successMock",
      delivery: "mock",
    };
  }

  console.error("[contato] erro ao salvar mensagem:", error.code, error.message);
  return { status: "error", message: "contact.status.generic", values };
}
