/**
 * Roda antes de CADA arquivo de teste do Vitest (ver setupFiles no
 * vitest.config.ts).
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// envSchema.ts valida estas variáveis no momento em que o módulo é importado
// e derruba o processo se faltarem. Qualquer módulo que importe `env` (auth,
// supabase...) precisa delas presentes — com valores de mentira, porque
// nenhum teste unitário fala com o Supabase de verdade.
vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test-project.supabase.co");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY", "test-anon-key");

// Desmonta os componentes renderizados por cada teste. Sem `globals: true`
// a Testing Library não consegue registrar isto sozinha.
afterEach(() => {
  cleanup();
});
