import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { env } from "@/lib/envSchema";
import { createServerSupabase } from "@/lib/supabase-server";

const adminEmails = (env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

/**
 * Porteiro das páginas do painel. "Estar logado" NÃO basta: o /login aceita
 * qualquer conta Google ou GitHub, então qualquer pessoa consegue uma sessão
 * válida. Quem pode entrar é quem está em ADMIN_EMAILS.
 *
 * Isto é a 2ª camada. A 1ª é o RLS do Supabase (supabase/messages.sql): um
 * usuário logado pode chamar a API REST direto com o próprio token, sem passar
 * por nenhuma página do Next — só a policy do banco segura esse caminho.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) redirect("/login");

  if (adminEmails.length === 0) {
    // Sem a variável o comportamento é o de sempre (qualquer logado entra),
    // para não trancar você fora do próprio painel — mas avisa todo acesso.
    console.warn(
      "[auth] ADMIN_EMAILS não definida: qualquer conta autenticada acessa o /admin.",
    );
    return user;
  }

  if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
    redirect("/login?error=AcessoNegado");
  }

  return user;
}
