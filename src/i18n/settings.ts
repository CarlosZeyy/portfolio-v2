export const LOCALES = ["pt-BR", "en-US"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt-BR";
/** Persistência pedida: a escolha do usuário mora no localStorage. */
export const STORAGE_KEY = "portfolio:locale";
/**
 * Espelho da mesma escolha num cookie. O servidor não enxerga o localStorage;
 * com o cookie ele já renderiza o HTML no idioma certo (ver server.ts).
 */
export const LOCALE_COOKIE = "portfolio-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  "pt-BR": "PT",
  "en-US": "EN",
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/** Navegador/cabeçalho em português -> pt-BR; qualquer outro idioma -> inglês. */
export const localeFromLanguageTag = (tag: string | null | undefined): Locale =>
  !tag ? DEFAULT_LOCALE : tag.toLowerCase().startsWith("pt") ? "pt-BR" : "en-US";
