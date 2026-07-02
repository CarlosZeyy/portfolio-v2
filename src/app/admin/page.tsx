import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Bem vindo {user.email}</h1>
    </div>
  );
}
