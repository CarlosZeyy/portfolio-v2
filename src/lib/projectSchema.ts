import { z } from "zod";

export const projectSchema = z.object({
  id: z.string().min(1, "Deve conter um ID").optional(),
  title: z.string().min(1, "O titulo é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  thumbnail: z.string().min(1, "Thumbnail é obrigatória"),
  stacks: z.string().array().min(1, "Deve conter pelo menos uma stack"),
  repoUrl: z.string().url("URL do repositório é obrigatório"),
  deployUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  isFeatured: z.boolean().default(false).optional(),
});

export type Project = z.infer<typeof projectSchema>;
