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
  const deployUrl = formData.get("deploy_url") as string;
  const videoUrl = formData.get("video_url") as string;
  const isFeatured = formData.get("is_featured") === "on";
  const problemDescription = formData.get("problem_description") as string;
  const solutionDescription = formData.get("solution_description") as string;
  const technicalChallenges = formData.get("technical_challenges") as string;
  const galleryFiles = formData.getAll("gallery_files") as File[];

  const stacksList: string[] = stacks
    ? stacks
        .split(",")
        .map((stack) => stack.trim())
        .filter(Boolean)
    : [];

  if (!imageFile || imageFile.size === 0) {
    console.error("Erro: Nenhum arquivo foi recebido no backend");
    return;
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

  const validGalleryFiles = galleryFiles.filter((file) => file.size > 0);
  let uploadedGalleryFiles: string[] = [];

  for (const file of validGalleryFiles) {
    const uniqueName = `${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: loopError } = await supabase.storage
      .from("portfolio-media")
      .upload(uniqueName, fileBuffer, {
        contentType: file.type,
      });

    if (loopError) {
      console.error("Erro ao carregar imagens: ", loopError.message);
      continue;
    }

    const { data: loopUrlData } = supabase.storage
      .from("portfolio-media")
      .getPublicUrl(uniqueName);

    uploadedGalleryFiles.push(loopUrlData.publicUrl);
  }

  const schema = projectSchema.safeParse({
    title: title,
    description: desc,
    thumbnail: finalImageUrl,
    stacks: stacksList,
    repoUrl: repoUrl,
    deployUrl: deployUrl ? deployUrl : undefined,
    videoUrl: videoUrl ? videoUrl : undefined,
    isFeatured: isFeatured,
    problemDescription: problemDescription,
    solutionDescription: solutionDescription,
    technicalChallenges: technicalChallenges,
    galleryUrls: uploadedGalleryFiles,
  });

  if (!schema.success) {
    console.error(schema.error);
    return;
  }

  if (isFeatured) {
    await supabase
      .from("projects")
      .update({
        is_featured: false,
      })
      .eq("is_featured", true);
  }

  await supabase.from("projects").insert({
    title: schema.data?.title,
    description: schema.data?.description,
    thumbnail_url: schema.data?.thumbnail,
    stacks: schema.data?.stacks,
    repo_url: schema.data?.repoUrl,
    deploy_url: schema.data?.deployUrl,
    video_url: schema.data?.videoUrl,
    is_featured: schema.data?.isFeatured,
    problem_description: problemDescription,
    solution_description: solutionDescription,
    technical_challenges: technicalChallenges,
    gallery_urls: schema.data?.galleryUrls,
  });

  revalidatePath("/admin");

  return redirect("/admin");
}

export async function updateProject(formData: FormData) {
  const supabase = await createServerSupabase();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const desc = formData.get("description") as string;
  const imageFile = formData.get("thumbnail_url") as File | null;
  const existingThumb = formData.get("existing_thumbnail") as string;
  const stacks = formData.get("stacks") as string;
  const repoUrl = formData.get("repo_url") as string;
  const deployUrl = formData.get("deploy_url") as string;
  const videoUrl = formData.get("video_url") as string;
  const isFeatured = formData.get("is_featured") === "on";
  const remainingGalleryString = formData.get("remaining_gallery") as string;
  const remainingGallery = remainingGalleryString
    ? JSON.parse(remainingGalleryString)
    : [];
  const newGalleryFiles = formData.getAll("new_gallery_files") as File[];
  const problemDescription = formData.get("problem_description") as string;
  const solutionDescription = formData.get("solution_description") as string;
  const technicalChallenges = formData.get("technical_challenges") as string;

  const stacksList: string[] = stacks
    ? stacks
        .split(",")
        .map((stack) => stack.trim())
        .filter(Boolean)
    : [];

  let finalImageUrl = existingThumb;

  if (!imageFile || imageFile.size === 0) {
    console.error("Erro: Nenhum arquivo foi recebido no backend");
  }

  if (imageFile && imageFile.size > 0) {
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

    finalImageUrl = publicUrlData.publicUrl;
  }

  const validGalleryFiles = newGalleryFiles.filter((file) => file.size > 0);
  let uploadedGalleryFiles: string[] = [];

  for (const file of validGalleryFiles) {
    const uniqueName = `${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: loopError } = await supabase.storage
      .from("portfolio-media")
      .upload(uniqueName, fileBuffer, {
        contentType: file.type,
      });

    if (loopError) {
      console.error("Erro ao carregar imagens: ", loopError.message);
      continue;
    }

    const { data: loopUrlData } = supabase.storage
      .from("portfolio-media")
      .getPublicUrl(uniqueName);

    uploadedGalleryFiles.push(loopUrlData.publicUrl);
  }

  const schema = projectSchema.safeParse({
    title: title,
    description: desc,
    thumbnail: finalImageUrl,
    stacks: stacksList,
    repoUrl: repoUrl,
    deployUrl: deployUrl ? deployUrl : undefined,
    videoUrl: videoUrl ? videoUrl : undefined,
    isFeatured: isFeatured,
    galleryUrls: [...remainingGallery, ...uploadedGalleryFiles],
    problemDescription: problemDescription,
    solutionDescription: solutionDescription,
    technicalChallenges: technicalChallenges,
  });

  if (!schema.success) {
    console.error(schema.error);
    return;
  }

  if (isFeatured) {
    await supabase
      .from("projects")
      .update({
        is_featured: false,
      })
      .neq("id", id);
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
      is_featured: schema.data?.isFeatured,
      gallery_urls: schema.data?.galleryUrls,
      problem_description:schema.data?.problemDescription,
      solution_description:schema.data?.solutionDescription,
      technical_challenges:schema.data?.technicalChallenges,
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
