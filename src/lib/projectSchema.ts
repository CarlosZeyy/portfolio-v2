import { z } from "zod";

// Texto opcional vindo de formulário: "" (campo deixado em branco) vira
// undefined. Sem isso o banco guardaria strings vazias, e o fallback
// "sem tradução -> mostra o português" teria que tratar dois tipos de vazio.
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const projectSchema = z.object({
  id: z.string().min(1, "Deve conter um ID").optional(),
  title: z.string().trim().min(1, "O título é obrigatório"),
  description: z.string().trim().min(1, "A descrição é obrigatória"),
  thumbnail: z.string().min(1, "A thumbnail é obrigatória"),
  stacks: z.string().array().min(1, "Informe pelo menos uma stack"),
  repoUrl: z.string().url("Informe uma URL válida para o repositório"),
  deployUrl: z.string().url("URL do deploy inválida").optional(),
  videoUrl: z.string().url("URL do vídeo inválida").optional(),
  isFeatured: z.boolean().default(false).optional(),
  problemDescription: optionalText,
  solutionDescription: optionalText,
  technicalChallenges: optionalText,
  galleryUrls: z.string().array().optional(),

  // Versão em inglês dos textos. Tudo opcional: projeto sem tradução continua
  // válido e o site mostra o português no lugar (ver projectLocale.ts).
  titleEn: optionalText,
  descriptionEn: optionalText,
  problemDescriptionEn: optionalText,
  solutionDescriptionEn: optionalText,
  technicalChallengesEn: optionalText,
});

export type Project = z.infer<typeof projectSchema>;
