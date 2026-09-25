import { defineConfig, devices } from "@playwright/test";

/**
 * Testes END-TO-END: um navegador de verdade (Chromium) contra o app de
 * verdade. Dois modos de uso:
 *
 *  - LOCAL (`npm run test:e2e`): sobe `npm run start` sozinho (precisa de um
 *    `npm run build` antes) e testa em http://127.0.0.1:3000.
 *
 *  - CI (PLAYWRIGHT_BASE_URL definida): NÃO sobe nada. O workflow builda a
 *    imagem Docker — a mesma que vai para a VPS — sobe o container e aponta
 *    o Playwright para ele. Testa-se exatamente o artefato que será deployado.
 */
const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // `test.only` esquecido num commit faria o CI rodar 1 teste e passar.
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    // Grava o trace (screenshots + rede + DOM) só quando um teste falha e é
    // reexecutado: dá para abrir no Playwright UI e ver o que aconteceu.
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run start",
        url: `${baseURL}/api/health`,
        reuseExistingServer: !isCI,
        timeout: 120_000,
      },
});
