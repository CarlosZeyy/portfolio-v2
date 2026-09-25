import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest cobre os testes UNITÁRIOS e de COMPONENTE (pasta src/, arquivos
 * *.test.ts[x]). Os testes end-to-end ficam em e2e/ e rodam no Playwright,
 * contra o app de verdade — por isso estão excluídos daqui.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mesmo alias do tsconfig ("@/lib/..." -> "src/lib/...").
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // jsdom simula o DOM do navegador para os testes de componente. Arquivos
    // que só precisam do Node (rotas de API, Server Actions) sobrescrevem
    // isso com o comentário `// @vitest-environment node` no topo.
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
    // CSS não influencia nenhum teste; ignorar acelera o carregamento.
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
      // Só o que tem lógica testável. Cenas 3D, shaders e componentes puramente
      // visuais ficam de fora para o número refletir o que importa.
      include: [
        "src/lib/**/*.ts",
        "src/store/**/*.ts",
        "src/i18n/settings.ts",
        "src/app/api/health/route.ts",
        "src/app/(public)/actions.ts",
        "src/components/StackChip.tsx",
        "src/components/LanguageToggle.tsx",
        "src/components/admin/ConfirmButton.tsx",
      ],
      exclude: ["src/lib/stackIcons.ts", "src/lib/icons.ts", "src/lib/motion.ts"],
    },
  },
});
