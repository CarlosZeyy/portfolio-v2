import { describe, expect, it } from "vitest";
import { z } from "zod";
import { projectSchema } from "@/lib/projectSchema";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * `projectSchema` valida o formulário de projeto do painel /admin antes do
 * INSERT/UPDATE no Supabase. O detalhe mais importante é o `optionalText`:
 * campo de texto opcional deixado em branco tem que virar `undefined` (e não
 * ""), senão o banco guarda strings vazias e o fallback "sem tradução ->
 * mostra o português" (projectLocale.ts) teria que tratar dois tipos de vazio.
 */

const minimal = {
  title: "Portfolio",
  description: "Meu portfolio pessoal",
  thumbnail: "https://cdn.example.com/thumb.png",
  stacks: ["Next.js"],
  repoUrl: "https://github.com/CarlosZeyy/portfolio-v2",
};

function fieldErrors(input: Record<string, unknown>) {
  const result = projectSchema.safeParse(input);
  expect(result.success).toBe(false);
  if (result.success) throw new Error("esperava falha de validação");
  return z.flattenError(result.error).fieldErrors;
}

describe("projectSchema", () => {
  it("aceita um projeto só com os campos obrigatórios", () => {
    const result = projectSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("transforma texto opcional em branco em undefined", () => {
    // Formulário HTML sempre envia "" para campo vazio. Aqui garantimos que
    // nenhum "" chega ao banco — nem "" nem "   " (só espaços).
    const parsed = projectSchema.parse({
      ...minimal,
      titleEn: "",
      descriptionEn: "   ",
      problemDescription: "\n\t",
    });

    expect(parsed.titleEn).toBeUndefined();
    expect(parsed.descriptionEn).toBeUndefined();
    expect(parsed.problemDescription).toBeUndefined();
  });

  it("faz trim do texto opcional preenchido", () => {
    const parsed = projectSchema.parse({ ...minimal, titleEn: "  Portfolio EN  " });
    expect(parsed.titleEn).toBe("Portfolio EN");
  });

  it("exige título e descrição (mesmo que só espaços)", () => {
    const errors = fieldErrors({ ...minimal, title: "   ", description: "" });
    expect(errors.title?.[0]).toBe("O título é obrigatório");
    expect(errors.description?.[0]).toBe("A descrição é obrigatória");
  });

  it("exige pelo menos uma stack", () => {
    const errors = fieldErrors({ ...minimal, stacks: [] });
    expect(errors.stacks?.[0]).toBe("Informe pelo menos uma stack");
  });

  it("exige thumbnail", () => {
    const errors = fieldErrors({ ...minimal, thumbnail: "" });
    expect(errors.thumbnail?.[0]).toBe("A thumbnail é obrigatória");
  });

  it("valida que as URLs são URLs de verdade", () => {
    const errors = fieldErrors({
      ...minimal,
      repoUrl: "github.com/sem-protocolo",
      deployUrl: "nao-e-url",
      videoUrl: "também não",
      // Atenção: "ftp:x" ou "mailto:x" SÃO URLs válidas pela spec WHATWG (que
      // é o que o zod usa). Inválido de verdade é o que não tem esquema.
      videoMobileUrl: "cdn.example.com/mobile.mp4",
    });

    expect(errors.repoUrl?.[0]).toBe("Informe uma URL válida para o repositório");
    expect(errors.deployUrl?.[0]).toBe("URL do deploy inválida");
    expect(errors.videoUrl?.[0]).toBe("URL do vídeo inválida");
    expect(errors.videoMobileUrl?.[0]).toBe("URL do vídeo mobile inválida");
  });

  it("URLs opcionais podem ser omitidas", () => {
    const parsed = projectSchema.parse(minimal);
    expect(parsed.deployUrl).toBeUndefined();
    expect(parsed.videoUrl).toBeUndefined();
    expect(parsed.videoMobileUrl).toBeUndefined();
  });

  it("id, quando presente, não pode ser vazio", () => {
    // updateProject manda o id do registro; um "" viraria UPDATE em nada.
    expect(fieldErrors({ ...minimal, id: "" }).id?.[0]).toBe("Deve conter um ID");
    expect(projectSchema.safeParse({ ...minimal, id: "uuid-123" }).success).toBe(true);
  });
});
