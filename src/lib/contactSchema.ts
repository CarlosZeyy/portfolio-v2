import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome")
    .max(80, "Nome muito longo"),
  email: z.email("Informe um e-mail válido").max(160, "E-mail muito longo"),
  message: z
    .string()
    .trim()
    .min(10, "Escreva pelo menos 10 caracteres")
    .max(2000, "Mensagem muito longa (máx. 2000 caracteres)"),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;

/**
 * Estado que a Server Action devolve ao useActionState. Mora aqui (e não no
 * arquivo da action) porque um arquivo "use server" só pode exportar funções
 * assíncronas — tipos e constantes precisam vir de outro módulo.
 */
export interface ContactFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  /**
   * O React 19 reseta o <form> ao fim de TODA action, inclusive quando a
   * validação falha. Devolver o que foi digitado (e usar como defaultValue)
   * é o que impede o usuário de perder a mensagem por causa de um e-mail torto.
   */
  values?: Partial<Record<ContactField, string>>;
  /** Só informativo, para o dev saber por onde a mensagem saiu. */
  delivery?: "database" | "mock";
}

export const initialContactState: ContactFormState = { status: "idle" };
