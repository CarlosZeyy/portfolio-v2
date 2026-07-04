"use server";

import { createServerSupabase } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addProject(formData: FormData) {
  const supabase = await createServerSupabase();

  const title = formData.get("title") as string;
  const desc = formData.get("description") as string;
  const thumb = formData.get("thumbnail_url") as string;
  const stacks = formData.get("stacks") as string;
  const repoUrl = formData.get("repo_url") as string;

  const stacksList: string[] = stacks
    ? stacks
        .split(",")
        .map((stack) => stack.trim())
        .filter(Boolean)
    : [];

  await supabase.from("projects").insert({
    title: title,
    description: desc,
    thumbnail_url: thumb,
    stacks: stacksList,
    repo_url: repoUrl,
  });

  revalidatePath("/admin");

  return redirect("/admin");
}
