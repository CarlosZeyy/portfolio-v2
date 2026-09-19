import type { Project } from "./projectSchema";

/**
 * Campos de texto que existem nos dois idiomas: [português, inglês].
 * É a única lista do projeto que sabe disso — formulário, actions e site leem
 * daqui, então acrescentar um campo traduzível é acrescentar uma linha.
 */
export const TRANSLATABLE_FIELDS = [
  ["title", "titleEn"],
  ["description", "descriptionEn"],
  ["problemDescription", "problemDescriptionEn"],
  ["solutionDescription", "solutionDescriptionEn"],
  ["technicalChallenges", "technicalChallengesEn"],
] as const satisfies readonly (readonly [keyof Project, keyof Project])[];

/** Linha da tabela `projects` como o Supabase devolve (snake_case). */
export interface ProjectRow {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  stacks: string[] | null;
  repo_url: string;
  deploy_url: string | null;
  video_url: string | null;
  video_mobile_url?: string | null;
  is_featured: boolean | null;
  problem_description: string | null;
  solution_description: string | null;
  technical_challenges: string | null;
  gallery_urls: string[] | null;
  created_at: string;
  // Ausentes até a migração do Lote 5 rodar — por isso opcionais.
  title_en?: string | null;
  description_en?: string | null;
  problem_description_en?: string | null;
  solution_description_en?: string | null;
  technical_challenges_en?: string | null;
}

/** Linha do banco -> objeto do app. Antes isso era copiado em cada page.tsx. */
export function projectFromRow(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail_url,
    stacks: row.stacks ?? [],
    repoUrl: row.repo_url,
    deployUrl: row.deploy_url ?? undefined,
    videoUrl: row.video_url ?? undefined,
    videoMobileUrl: row.video_mobile_url ?? undefined,
    isFeatured: row.is_featured ?? false,
    problemDescription: row.problem_description ?? undefined,
    solutionDescription: row.solution_description ?? undefined,
    technicalChallenges: row.technical_challenges ?? undefined,
    galleryUrls: row.gallery_urls ?? [],
    titleEn: row.title_en ?? undefined,
    descriptionEn: row.description_en ?? undefined,
    problemDescriptionEn: row.problem_description_en ?? undefined,
    solutionDescriptionEn: row.solution_description_en ?? undefined,
    technicalChallengesEn: row.technical_challenges_en ?? undefined,
  };
}

/**
 * Devolve o projeto com os textos no idioma pedido. Campo por campo: um
 * projeto com só o título traduzido mostra o título em inglês e o resto em
 * português — melhor do que esconder tudo até a tradução estar completa.
 */
export function localizeProject(project: Project, locale: string): Project {
  if (!locale.startsWith("en")) return project;

  const localized = { ...project };
  for (const [base, english] of TRANSLATABLE_FIELDS) {
    const translation = project[english];
    if (translation) localized[base] = translation;
  }
  return localized;
}

/** Quantos dos campos traduzíveis já têm versão em inglês. */
export function translationProgress(project: Project) {
  const done = TRANSLATABLE_FIELDS.filter(([, english]) => project[english]).length;
  return { done, total: TRANSLATABLE_FIELDS.length };
}
