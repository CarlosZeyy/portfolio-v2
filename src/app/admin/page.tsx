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

  const formatEmail = (email: string) => {
    return email.substring(0, email.indexOf("@"));
  };

  return (
    <div>
      <h1>Bem vindo {user.email ? formatEmail(user.email) : "Admin"}</h1>
    </div>
  );
}
