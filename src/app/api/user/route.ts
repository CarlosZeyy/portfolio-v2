import { createServerSupabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);

  const code = searchParams.get("code");

  const supabase = await createServerSupabase();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);

    return NextResponse.redirect(`${origin}/admin`);
  }

  console.error("Acesso negado.");
  return NextResponse.redirect(`${origin}/login?error=AcessoNegado`);
}
