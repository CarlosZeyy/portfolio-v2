import { describe, expect, it } from "vitest";
import {
  TRANSLATABLE_FIELDS,
  localizeProject,
  projectFromRow,
  translationProgress,
  type ProjectRow,
} from "@/lib/projectLocale";
import type { Project } from "@/lib/projectSchema";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * A ponte entre a linha do banco (snake_case, com NULLs) e o objeto do app
 * (camelCase, com undefined), e a troca de idioma campo a campo.
 *
 * O caso que mais importa: um projeto traduzido PELA METADE deve mostrar o
 * inglês onde existe e o português no resto — nunca esconder tudo, nunca
 * mostrar campo em branco.
 */

const row: ProjectRow = {
  id: "p1",
  title: "Portfolio",
  description: "Descrição em português",
  thumbnail_url: "https://cdn.example.com/thumb.png",
  stacks: ["Next.js", "TypeScript"],
  repo_url: "https://github.com/CarlosZeyy/portfolio-v2",
  deploy_url: null,
  video_url: "https://cdn.example.com/video.mp4",
  video_mobile_url: null,
  is_featured: null,
  problem_description: "Problema",
  solution_description: null,
  technical_challenges: null,
  gallery_urls: null,
  created_at: "2026-01-15T14:30:00Z",
  title_en: "Portfolio (EN)",
  description_en: null,
};

describe("projectFromRow", () => {
  it("converte snake_case em camelCase", () => {
    const project = projectFromRow(row);

    expect(project.id).toBe("p1");
    expect(project.thumbnail).toBe(row.thumbnail_url);
    expect(project.repoUrl).toBe(row.repo_url);
    expect(project.videoUrl).toBe(row.video_url);
    expect(project.problemDescription).toBe("Problema");
    expect(project.titleEn).toBe("Portfolio (EN)");
  });

  it("NULL do banco vira undefined (texto/URL), [] (listas) ou false (flag)", () => {
    // O schema do app é todo em undefined; se um null vazasse, `if (translation)`
    // continuaria funcionando, mas o zod rejeitaria o objeto ao reenviar.
    const project = projectFromRow(row);

    expect(project.deployUrl).toBeUndefined();
    expect(project.videoMobileUrl).toBeUndefined();
    expect(project.solutionDescription).toBeUndefined();
    expect(project.descriptionEn).toBeUndefined();
    expect(project.galleryUrls).toEqual([]);
    expect(project.isFeatured).toBe(false);
  });

  it("stacks nula vira lista vazia (o card faz .map nela)", () => {
    expect(projectFromRow({ ...row, stacks: null }).stacks).toEqual([]);
  });

  it("tolera linhas sem as colunas de tradução (antes da migração)", () => {
    // As colunas *_en são opcionais no tipo justamente por isso.
    const legacyRow: ProjectRow = { ...row };
    delete legacyRow.title_en;
    delete legacyRow.description_en;
    const project = projectFromRow(legacyRow);

    expect(project.titleEn).toBeUndefined();
    expect(project.title).toBe("Portfolio");
  });
});

describe("localizeProject", () => {
  const project: Project = projectFromRow({
    ...row,
    title_en: "Portfolio (EN)",
    description_en: null, // sem tradução
    problem_description_en: "Problem (EN)",
  });

  it("em português devolve o MESMO objeto, sem cópia", () => {
    expect(localizeProject(project, "pt-BR")).toBe(project);
  });

  it("em inglês substitui só os campos que têm tradução", () => {
    const localized = localizeProject(project, "en-US");

    expect(localized.title).toBe("Portfolio (EN)");
    expect(localized.problemDescription).toBe("Problem (EN)");
    // Sem tradução: mantém o português em vez de ficar vazio.
    expect(localized.description).toBe("Descrição em português");
  });

  it("não muta o projeto original", () => {
    localizeProject(project, "en-US");
    expect(project.title).toBe("Portfolio");
  });

  it("qualquer variante de inglês conta (en, en-GB...)", () => {
    expect(localizeProject(project, "en").title).toBe("Portfolio (EN)");
    expect(localizeProject(project, "en-GB").title).toBe("Portfolio (EN)");
  });
});

describe("translationProgress", () => {
  it("conta quantos campos traduzíveis já têm inglês", () => {
    const project = projectFromRow({ ...row, title_en: "T", description_en: "D" });
    expect(translationProgress(project)).toEqual({ done: 2, total: TRANSLATABLE_FIELDS.length });
  });

  it("projeto sem tradução alguma tem progresso zero", () => {
    const project = projectFromRow({ ...row, title_en: null, description_en: null });
    expect(translationProgress(project).done).toBe(0);
  });

  it("a lista de campos traduzíveis tem 5 pares", () => {
    // Acrescentar um campo traduzível é acrescentar uma linha em
    // TRANSLATABLE_FIELDS; este teste lembra de atualizar quem depende dela.
    expect(TRANSLATABLE_FIELDS).toHaveLength(5);
  });
});
