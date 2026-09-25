// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialContactState } from "@/lib/contactSchema";
import { createServerSupabase } from "@/lib/supabase-server";
import { sendEmail } from "../actions";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * `sendEmail` é a Server Action do formulário de contato. O Supabase é
 * substituído por um dublê (vi.mock): controlamos o que o `insert` devolve
 * e verificamos como a action reage a cada cenário, sem rede.
 *
 * Cenários cobertos:
 *  1. honeypot preenchido -> "sucesso" falso, sem validar nem gravar;
 *  2. dados inválidos -> erro por campo + os valores digitados de volta;
 *  3. insert OK -> sucesso, com os dados normalizados (trim);
 *  4. tabela inexistente em DEV -> modo mock (sucesso, sem gravar);
 *  5. tabela inexistente em PRODUÇÃO -> erro de verdade;
 *  6. qualquer outro erro do banco -> erro genérico, com os valores de volta.
 */

vi.mock("@/lib/supabase-server", () => ({
  createServerSupabase: vi.fn(),
}));

const insert = vi.fn();

function formDataOf(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

const validFields = {
  name: "Ana Souza",
  email: "ana@example.com",
  message: "Olá! Quero conversar sobre um projeto.",
};

describe("sendEmail (Server Action de contato)", () => {
  beforeEach(() => {
    insert.mockReset();
    insert.mockResolvedValue({ error: null });
    vi.mocked(createServerSupabase).mockResolvedValue({
      from: vi.fn(() => ({ insert })),
    } as unknown as Awaited<ReturnType<typeof createServerSupabase>>);

    // A action loga aviso/erro nos cenários de falha; silenciamos para não
    // poluir a saída dos testes, mas ainda dá para verificar as chamadas.
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv("NODE_ENV", "test");
  });

  it("honeypot preenchido: devolve sucesso falso sem tocar no banco", async () => {
    // Bots preenchem todos os campos, inclusive o invisível "website".
    const state = await sendEmail(
      initialContactState,
      formDataOf({ ...validFields, website: "http://spam.example" }),
    );

    expect(state).toEqual({ status: "success", message: "contact.status.success" });
    expect(createServerSupabase).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("dados inválidos: erro por campo e os valores digitados de volta", async () => {
    const fields = { name: "A", email: "nao-e-email", message: "curta" };
    const state = await sendEmail(initialContactState, formDataOf(fields));

    expect(state.status).toBe("error");
    expect(state.message).toBe("contact.status.invalid");
    expect(state.fieldErrors).toEqual({
      name: "contact.errors.nameShort",
      email: "contact.errors.emailInvalid",
      message: "contact.errors.messageShort",
    });
    // O React 19 reseta o <form> depois da action; sem `values` o usuário
    // perderia o que digitou por causa de um e-mail torto.
    expect(state.values).toEqual(fields);
    expect(insert).not.toHaveBeenCalled();
  });

  it("campos ausentes no FormData contam como string vazia", async () => {
    const state = await sendEmail(initialContactState, new FormData());

    expect(state.status).toBe("error");
    expect(state.values).toEqual({ name: "", email: "", message: "" });
  });

  it("insert OK: sucesso vindo do banco, com os dados normalizados", async () => {
    const state = await sendEmail(
      initialContactState,
      formDataOf({ ...validFields, name: "  Ana Souza  " }),
    );

    expect(state).toEqual({
      status: "success",
      message: "contact.status.success",
      delivery: "database",
    });
    // O que vai para o banco é o resultado do schema (trim aplicado).
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(validFields);
  });

  it("tabela inexistente em DESENVOLVIMENTO: modo mock (sucesso sem gravar)", async () => {
    vi.stubEnv("NODE_ENV", "development");
    insert.mockResolvedValue({ error: { code: "PGRST205", message: "table not found" } });

    const state = await sendEmail(initialContactState, formDataOf(validFields));

    expect(state).toEqual({
      status: "success",
      message: "contact.status.successMock",
      delivery: "mock",
    });
    expect(console.warn).toHaveBeenCalled();
  });

  it("tabela inexistente em PRODUÇÃO: é erro de verdade", async () => {
    // Um "enviado!" para uma mensagem que não foi a lugar nenhum faria um
    // visitante real achar que falou com você.
    vi.stubEnv("NODE_ENV", "production");
    insert.mockResolvedValue({ error: { code: "42P01", message: "relation does not exist" } });

    const state = await sendEmail(initialContactState, formDataOf(validFields));

    expect(state.status).toBe("error");
    expect(state.message).toBe("contact.status.generic");
    expect(state.values).toEqual(validFields);
    expect(console.error).toHaveBeenCalled();
  });

  it("outro erro do banco: erro genérico com os valores de volta", async () => {
    insert.mockResolvedValue({ error: { code: "42501", message: "permission denied" } });

    const state = await sendEmail(initialContactState, formDataOf(validFields));

    expect(state).toEqual({
      status: "error",
      message: "contact.status.generic",
      values: validFields,
    });
  });
});
