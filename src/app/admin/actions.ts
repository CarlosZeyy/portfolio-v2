"use server";

import { projectSchema } from "@/lib/projectSchema";
import { createServerSupabase } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addProject(formData: FormData) {
  const supabase = await createServerSupabase();

  const title = formData.get("title") as string;
  const desc = formData.get("description") as string;
  const imageFile = formData.get("thumbnail_url") as File;
  const stacks = formData.get("stacks") as string;
  const repoUrl = formData.get("repo_url") as string;

  const stacksList: string[] = stacks
    ? stacks
        .split(",")
        .map((stack) => stack.trim())
        .filter(Boolean)
    : [];

  if (!imageFile || imageFile.size === 0) {
    console.error("Erro: Nenhum arquivo foi recebido no backend");
  }

  const fileBuffer = await imageFile.arrayBuffer();

  const uniqueName = `${Date.now()}-${imageFile.name}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("portfolio-media")
    .upload(uniqueName, fileBuffer, {
      contentType: imageFile.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Erro ao fazer upload da imagem: ", uploadError.message);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("portfolio-media")
    .getPublicUrl(uniqueName);

  const finalImageUrl = publicUrlData.publicUrl;

  const schema = projectSchema.safeParse({
    title: title,
    description: desc,
    thumbnail: finalImageUrl,
    stacks: stacksList,
    repoUrl: repoUrl,
  });

  if (!schema.success) {
    console.error(schema.error);
    return;
  }

  await supabase.from("projects").insert({
    title: schema.data?.title,
    description: schema.data?.description,
    thumbnail_url: schema.data?.thumbnail,
    stacks: schema.data?.stacks,
    repo_url: schema.data?.repoUrl,
    deploy_url: schema.data?.deployUrl,
    video_url: schema.data?.videoUrl,
  });

  revalidatePath("/admin");

  return redirect("/admin");
}

export async function updateProject(formData: FormData) {
  const supabase = await createServerSupabase();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const desc = formData.get("description") as string;
  const imageFile = formData.get("thumbnail_url") as File;
  const stacks = formData.get("stacks") as string;
  const repoUrl = formData.get("repo_url") as string;

  const stacksList: string[] = stacks
    ? stacks
        .split(",")
        .map((stack) => stack.trim())
        .filter(Boolean)
    : [];

  if (!imageFile || imageFile.size === 0) {
    console.error("Erro: Nenhum arquivo foi recebido no backend");
  }

  const fileBuffer = await imageFile.arrayBuffer();

  const uniqueName = `${Date.now()}-${imageFile.name}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("portfolio-media")
    .upload(uniqueName, fileBuffer, {
      contentType: imageFile.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Erro ao fazer upload da imagem: ", uploadError.message);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("portfolio-media")
    .getPublicUrl(uniqueName);

  const finalImageUrl = publicUrlData.publicUrl;

  const schema = projectSchema.safeParse({
    title: title,
    description: desc,
    thumbnail: finalImageUrl,
    stacks: stacksList,
    repoUrl: repoUrl,
  });

  if (!schema.success) {
    console.error(schema.error);
    return;
  }

  await supabase
    .from("projects")
    .update({
      title: schema.data?.title,
      description: schema.data?.description,
      thumbnail_url: schema.data?.thumbnail,
      stacks: schema.data?.stacks,
      repo_url: schema.data?.repoUrl,
      deploy_url: schema.data?.deployUrl,
      video_url: schema.data?.videoUrl,
    })
    .eq("id", id);

  revalidatePath("/admin");

  return redirect("/admin");
}

export async function deleteProject(formData: FormData) {
  const supabase = await createServerSupabase();

  const id = formData.get("id") as string;

  if (!id) {
    console.error("Id not found");
    return;
  }

  await supabase.from("projects").delete().eq("id", id);

  revalidatePath("/admin");
}
