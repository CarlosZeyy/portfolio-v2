import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_LABELS,
  isLocale,
  localeFromLanguageTag,
} from "@/i18n/settings";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * As regras de escolha de idioma que o SERVIDOR usa na primeira visita
 * (i18n/server.ts): ler o cookie-espelho, e na falta dele, o cabeçalho
 * Accept-Language. Errar aqui significa renderizar o HTML num idioma e o
 * cliente hidratar em outro.
 */

describe("isLocale", () => {
  it("aceita só os idiomas suportados", () => {
    expect(isLocale("pt-BR")).toBe(true);
    expect(isLocale("en-US")).toBe(true);
  });

  it("rejeita variantes, caixa diferente e valores não-string", () => {
    // O cookie pode ter sido editado: "en", "PT-BR", "es"... nada disso é
    // um locale conhecido, e o servidor deve cair para o Accept-Language.
    expect(isLocale("en")).toBe(false);
    expect(isLocale("PT-BR")).toBe(false);
    expect(isLocale("es-ES")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(42)).toBe(false);
  });
});

describe("localeFromLanguageTag", () => {
  it("qualquer português vira pt-BR", () => {
    expect(localeFromLanguageTag("pt-BR")).toBe("pt-BR");
    expect(localeFromLanguageTag("pt-PT")).toBe("pt-BR");
    expect(localeFromLanguageTag("pt")).toBe("pt-BR");
    expect(localeFromLanguageTag("PT-br,en;q=0.8")).toBe("pt-BR");
  });

  it("qualquer outro idioma vira inglês", () => {
    expect(localeFromLanguageTag("en-US")).toBe("en-US");
    expect(localeFromLanguageTag("es-ES")).toBe("en-US");
    expect(localeFromLanguageTag("de")).toBe("en-US");
  });

  it("sem cabeçalho, usa o idioma padrão", () => {
    expect(localeFromLanguageTag(null)).toBe(DEFAULT_LOCALE);
    expect(localeFromLanguageTag(undefined)).toBe(DEFAULT_LOCALE);
    expect(localeFromLanguageTag("")).toBe(DEFAULT_LOCALE);
  });
});

describe("configuração", () => {
  it("o idioma padrão é um dos suportados e todos têm rótulo", () => {
    expect(LOCALES).toContain(DEFAULT_LOCALE);
    for (const locale of LOCALES) {
      expect(LOCALE_LABELS[locale]).toBeTruthy();
    }
  });
});
