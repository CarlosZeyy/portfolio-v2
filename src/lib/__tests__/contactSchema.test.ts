import { describe, expect, it } from "vitest";
import { z } from "zod";
import { contactSchema, type ContactField } from "@/lib/contactSchema";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * `contactSchema` é a validação do formulário público de contato. Ela roda na
 * Server Action (sendEmail) — ou seja, é a ÚNICA barreira entre o que o
 * visitante digita e o INSERT na tabela `messages`.
 *
 * Duas coisas importam aqui:
 *  1. os limites (mín/máx de cada campo) batem com o que o banco espera;
 *  2. as mensagens de erro são CHAVES de tradução ("contact.errors.x"), e não
 *     texto — o cliente traduz com t(). Se alguém trocar por texto solto, o
 *     formulário passa a mostrar a chave crua na tela.
 */

const valid = {
  name: "Carlos Moises",
  email: "carlos@example.com",
  message: "Olá! Gostaria de conversar sobre um projeto.",
};

/** Valida e devolve a primeira mensagem de erro do campo pedido. */
function firstError(input: Record<string, unknown>, field: ContactField) {
  const result = contactSchema.safeParse(input);
  expect(result.success).toBe(false);
  if (result.success) throw new Error("esperava falha de validação");
  return z.flattenError(result.error).fieldErrors[field]?.[0];
}

describe("contactSchema", () => {
  it("aceita um envio válido sem alterar os dados", () => {
    const result = contactSchema.safeParse(valid);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(valid);
  });

  it("remove espaços nas pontas do nome e da mensagem (trim)", () => {
    // O trim acontece ANTES do min/max: "  Carlos  " conta como "Carlos".
    const result = contactSchema.parse({
      ...valid,
      name: "   Carlos   ",
      message: `\n  ${valid.message}  \n`,
    });

    expect(result.name).toBe("Carlos");
    expect(result.message).toBe(valid.message);
  });

  it("nome só de espaços é tratado como vazio", () => {
    // Sem o trim, "   " (3 caracteres) passaria no min(2).
    expect(firstError({ ...valid, name: "   " }, "name")).toBe(
      "contact.errors.nameShort",
    );
  });

  it.each([
    ["nome com 1 caractere", { name: "A" }, "name", "contact.errors.nameShort"],
    ["nome com 81 caracteres", { name: "a".repeat(81) }, "name", "contact.errors.nameLong"],
    ["e-mail sem @", { email: "carlos.example.com" }, "email", "contact.errors.emailInvalid"],
    ["e-mail vazio", { email: "" }, "email", "contact.errors.emailInvalid"],
    [
      "e-mail com mais de 160 caracteres",
      { email: `${"a".repeat(150)}@example.com` },
      "email",
      "contact.errors.emailLong",
    ],
    ["mensagem com 9 caracteres", { message: "123456789" }, "message", "contact.errors.messageShort"],
    ["mensagem com 2001 caracteres", { message: "x".repeat(2001) }, "message", "contact.errors.messageLong"],
  ] as const)("rejeita %s com a chave de tradução certa", (_label, patch, field, expectedKey) => {
    expect(firstError({ ...valid, ...patch }, field)).toBe(expectedKey);
  });

  it("aceita exatamente os limites (2/80, 160, 10/2000)", () => {
    // Testa as bordas: um "off by one" no schema apareceria aqui.
    expect(contactSchema.safeParse({ ...valid, name: "Ab" }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, name: "a".repeat(80) }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, message: "1234567890" }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, message: "x".repeat(2000) }).success).toBe(true);
  });

  it("reporta os erros de todos os campos de uma vez", () => {
    // O formulário mostra o erro embaixo de cada campo. Se o schema parasse no
    // primeiro erro, o usuário corrigiria um campo e descobriria o próximo só
    // no envio seguinte.
    const result = contactSchema.safeParse({ name: "A", email: "x", message: "curta" });
    expect(result.success).toBe(false);
    if (result.success) return;

    const { fieldErrors } = z.flattenError(result.error);
    expect(Object.keys(fieldErrors).sort()).toEqual(["email", "message", "name"]);
  });
});
