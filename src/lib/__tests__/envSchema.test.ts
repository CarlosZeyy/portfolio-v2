import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * `envSchema.ts` valida as variáveis de ambiente NO MOMENTO DO IMPORT e
 * derruba o processo se faltarem. É o que faz o `next build` (e o build do
 * Docker) falhar cedo, com mensagem legível, em vez de gerar uma imagem
 * "pronta" que quebra na primeira requisição.
 *
 * Como a validação acontece ao importar, cada teste limpa o cache de módulos
 * (vi.resetModules) e importa o arquivo de novo com um ambiente diferente.
 */

async function loadEnv() {
  vi.resetModules();
  return import("@/lib/envSchema");
}

describe("envSchema", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY", "anon-key");
    vi.stubEnv("ADMIN_EMAILS", "");
  });

  it("expõe as variáveis quando tudo está preenchido", async () => {
    vi.stubEnv("ADMIN_EMAILS", "a@x.com,b@x.com");
    const { env } = await loadEnv();

    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://abc.supabase.co");
    expect(env.NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY).toBe("anon-key");
    expect(env.ADMIN_EMAILS).toBe("a@x.com,b@x.com");
  });

  it("ADMIN_EMAILS é opcional (não existe no bundle do cliente)", async () => {
    vi.stubEnv("ADMIN_EMAILS", undefined);
    const { env } = await loadEnv();
    expect(env.ADMIN_EMAILS).toBeUndefined();
  });

  it("derruba o boot se a URL do Supabase não for uma URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "abc.supabase.co");
    await expect(loadEnv()).rejects.toThrow(/SUPABASE_URL must be a valid URL/);
  });

  it("derruba o boot se a URL do Supabase estiver ausente", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    await expect(loadEnv()).rejects.toThrow();
  });

  it("derruba o boot se a anon key estiver vazia", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY", "");
    await expect(loadEnv()).rejects.toThrow(/SUPABASE_ANON_KEY/);
  });
});
