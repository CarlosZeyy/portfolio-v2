import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { requireAdmin } from "@/lib/auth";
import { projectFromRow, type ProjectRow } from "@/lib/projectLocale";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function AdminPage() {
  const user = await requireAdmin();
  const supabase = await createServerSupabase();

  // As três consultas não dependem uma da outra: vão em paralelo.
  // head: true -> só a contagem, sem trafegar as mensagens.
  const [projects, totalMessages, unreadMessages] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false),
  ]);

  const rows = (projects.data ?? []) as ProjectRow[];

  return (
    <AdminDashboard
      userName={
        user.user_metadata?.full_name || user.user_metadata?.name || "Admin"
      }
      projects={rows.map((row) => ({
        project: projectFromRow(row),
        createdAt: row.created_at,
      }))}
      totalMessages={totalMessages.count ?? 0}
      // Antes da migração a coluna is_read não existe e a contagem vem null:
      // nesse caso todas contam como não lidas, que é o estado real.
      unreadMessages={unreadMessages.count ?? totalMessages.count ?? 0}
    />
  );
}
