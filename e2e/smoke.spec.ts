import { expect, test } from "@playwright/test";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * Testes de FUMAÇA (smoke): não entram em detalhes de UI, verificam que o app
 * inteiro — servidor Node, roteamento do Next, i18n no servidor, redirects de
 * autenticação — está de pé e respondendo como deveria. Rodam contra a mesma
 * imagem Docker que vai para a VPS, então uma falha aqui é um deploy que
 * teria quebrado em produção.
 *
 * Não dependem de dados: passam com o banco vazio (mostram "Nenhum projeto
 * publicado ainda") e não exigem login.
 */

test.describe("infraestrutura", () => {
  test("GET /api/health responde 200 com { status: 'ok' }", async ({ request }) => {
    // É exatamente o que o HEALTHCHECK do Docker e o deploy na VPS consultam.
    const response = await request.get("/api/health");

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  test("rota inexistente devolve 404 com a página customizada", async ({ page }) => {
    const response = await page.goto("/esta-rota-nao-existe");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("link", { name: /voltar/i })).toHaveAttribute("href", "/");
  });
});

test.describe("página inicial", () => {
  test("carrega com status 200 e o título do site", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle("Carlos Moises");
  });

  test("renderiza em português para navegador em pt-BR", async ({ browser }) => {
    // O idioma da PRIMEIRA visita vem do Accept-Language, decidido no servidor
    // (i18n/server.ts). O <html lang> já tem que sair certo no HTML inicial.
    const context = await browser.newContext({ locale: "pt-BR" });
    const page = await context.newPage();
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await context.close();
  });

  test("renderiza em inglês para navegador em en-US", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
    await context.close();
  });

  test("o cookie de idioma tem prioridade sobre o Accept-Language", async ({ browser, baseURL }) => {
    // Visitante em português que escolheu inglês: a escolha (espelhada no
    // cookie) vence o cabeçalho do navegador.
    const context = await browser.newContext({ locale: "pt-BR" });
    await context.addCookies([
      { name: "portfolio-locale", value: "en-US", url: baseURL! },
    ]);
    const page = await context.newPage();
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
    await context.close();
  });
});

test.describe("área administrativa", () => {
  test("/login renderiza os provedores de autenticação", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /github/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^entrar$/i })).toBeVisible();
  });

  test("/admin sem sessão redireciona para /login", async ({ page }) => {
    // requireAdmin (lib/auth.ts) é a 2ª camada de proteção do painel; a 1ª é
    // o RLS do Supabase. Sem cookie de sessão, ninguém vê o painel.
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/login/);
  });
});
