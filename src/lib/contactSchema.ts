import { z } from "zod";

/**
 * As mensagens são CHAVES do dicionário (src/i18n/locales), não texto. A
 * Server Action roda no servidor e não sabe o idioma que o visitante escolheu
 * (ele mora no localStorage); ela devolve a chave e o cliente traduz com t().
 */
export type ContactErrorKey =
  `contact.errors.${"nameShort" | "nameLong" | "emailInvalid" | "emailLong" | "messageShort" | "messageLong"}`;
export type ContactStatusKey =
  `contact.status.${"success" | "successMock" | "invalid" | "generic"}`;

const error = (key: ContactErrorKey) => key;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, error("contact.errors.nameShort"))
    .max(80, error("contact.errors.nameLong")),
  email: z
    .email(error("contact.errors.emailInvalid"))
    .max(160, error("contact.errors.emailLong")),
  message: z
    .string()
    .trim()
    .min(10, error("contact.errors.messageShort"))
    .max(2000, error("contact.errors.messageLong")),
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
  message?: ContactStatusKey;
  fieldErrors?: Partial<Record<ContactField, ContactErrorKey>>;
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
