"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { ProjectFormState } from "@/lib/projectFormState";
import { projectSchema } from "@/lib/projectSchema";
import { createServerSupabase } from "@/lib/supabase-server";

const BUCKET = "portfolio-media";

// Campo do schema (camelCase) -> name do input no formulário. É o que permite
// devolver o erro de validação colado no campo certo.
const FORM_FIELD: Record<string, string> = {
  title: "title",
  description: "description",
  thumbnail: "thumbnail_url",
  stacks: "stacks",
  repoUrl: "repo_url",
  deployUrl: "deploy_url",
  videoUrl: "video_url",
};

const text = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();

const files = (formData: FormData, name: string) =>
  formData.getAll(name).filter((entry): entry is File => entry instanceof File && entry.size > 0);

/** Sobe um arquivo e devolve a URL pública; lança em caso de falha. */
async function upload(supabase: SupabaseClient, file: File) {
  // Nome do arquivo vem do usuário: tira tudo que não é seguro num caminho.
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false,
    });
  if (error) throw new Error(`Upload de "${file.name}" falhou: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function saveProject(
  formData: FormData,
  mode: "create" | "update",
): Promise<ProjectFormState> {
  // Server Action é um endpoint HTTP público: qualquer um pode chamá-la com um
  // POST, sem abrir o /admin. A checagem tem que estar AQUI, não só na página.
  await requireAdmin();
  const supabase = await createServerSupabase();

  const id = text(formData, "id");
  if (mode === "update" && !id) return { error: "Projeto sem ID." };

  try {
    const [newThumbnail] = files(formData, "thumbnail_url");
    const thumbnail = newThumbnail
      ? await upload(supabase, newThumbnail)
      : text(formData, "existing_thumbnail");

    const keptGallery: string[] = JSON.parse(
      text(formData, "remaining_gallery") || "[]",
    );
    const newGallery = await Promise.all(
      files(formData, "gallery_files").map((file) => upload(supabase, file)),
    );

    const parsed = projectSchema.safeParse({
      title: text(formData, "title"),
      description: text(formData, "description"),
      thumbnail,
      stacks: text(formData, "stacks")
        .split(",")
        .map((stack) => stack.trim())
        .filter(Boolean),
      repoUrl: text(formData, "repo_url"),
      deployUrl: text(formData, "deploy_url") || undefined,
      videoUrl: text(formData, "video_url") || undefined,
      isFeatured: formData.get("is_featured") === "on",
      problemDescription: text(formData, "problem_description"),
      solutionDescription: text(formData, "solution_description"),
      technicalChallenges: text(formData, "technical_challenges"),
      galleryUrls: [...keptGallery, ...newGallery],
      titleEn: text(formData, "title_en"),
      descriptionEn: text(formData, "description_en"),
      problemDescriptionEn: text(formData, "problem_description_en"),
      solutionDescriptionEn: text(formData, "solution_description_en"),
      technicalChallengesEn: text(formData, "technical_challenges_en"),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = FORM_FIELD[String(issue.path[0])];
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      return { error: "Revise os campos destacados.", fieldErrors };
    }

    const project = parsed.data;
    // `?? null`: no UPDATE, undefined é "não mexa na coluna". Para APAGAR uma
    // tradução (campo esvaziado no formulário) o valor tem que ser null.
    const row = {
      title: project.title,
      description: project.description,
      thumbnail_url: project.thumbnail,
      stacks: project.stacks,
      repo_url: project.repoUrl,
      deploy_url: project.deployUrl ?? null,
      video_url: project.videoUrl ?? null,
      is_featured: project.isFeatured ?? false,
      problem_description: project.problemDescription ?? null,
      solution_description: project.solutionDescription ?? null,
      technical_challenges: project.technicalChallenges ?? null,
      gallery_urls: project.galleryUrls ?? [],
      title_en: project.titleEn ?? null,
      description_en: project.descriptionEn ?? null,
      problem_description_en: project.problemDescriptionEn ?? null,
      solution_description_en: project.solutionDescriptionEn ?? null,
      technical_challenges_en: project.technicalChallengesEn ?? null,
    };

    // Só um projeto em destaque por vez.
    if (row.is_featured) {
      const others = supabase.from("projects").update({ is_featured: false });
      await (mode === "update" ? others.neq("id", id) : others.eq("is_featured", true));
    }

    const { error } =
      mode === "update"
        ? await supabase.from("projects").update(row).eq("id", id)
        : await supabase.from("projects").insert(row);

    if (error) {
      // PGRST204 = coluna inexistente: a migração do Lote 5 ainda não rodou.
      const hint =
        error.code === "PGRST204"
          ? " Rode supabase/migration_and_security_patch.sql para criar as colunas em inglês."
          : "";
      return { error: `O banco recusou a gravação: ${error.message}.${hint}` };
    }
  } catch (cause) {
    console.error("[admin] saveProject:", cause);
    return {
      error: cause instanceof Error ? cause.message : "Erro inesperado ao salvar.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  if (id) revalidatePath(`/project/${id}`);
  // redirect() lança por design — tem que ficar FORA do try/catch acima, senão
  // o catch engoliria o redirecionamento como se fosse erro.
  redirect("/admin");
}

export async function addProject(
  _previous: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  return saveProject(formData, "create");
}

export async function updateProject(
  _previous: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  return saveProject(formData, "update");
}

export async function deleteProject(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabase();

  const id = text(formData, "id");
  if (!id) return;

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) console.error("[admin] deleteProject:", error.message);

  revalidatePath("/admin");
  revalidatePath("/");
}
