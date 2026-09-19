import { createInstance, type i18n as I18n } from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./settings";
import ptBR from "./locales/pt-BR";
import enUS from "./locales/en-US";

/**
 * Uma instância POR provider, não um singleton de módulo. No servidor o módulo
 * é compartilhado entre todas as requisições: um singleton com idioma mutável
 * faria a escolha de um visitante vazar para o HTML do próximo.
 *
 * initAsync: false -> os dicionários (pequenos, já no bundle) ficam prontos de
 * forma síncrona. Com o padrão assíncrono o 1º render sairia sem traduções.
 */
export function createI18n(locale: Locale): I18n {
  const instance = createInstance();

  instance.use(initReactI18next).init({
    resources: {
      "pt-BR": { translation: ptBR },
      "en-US": { translation: enUS },
    },
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...LOCALES],
    interpolation: { escapeValue: false }, // o React já escapa
    react: { useSuspense: false },
    initAsync: false,
  });

  return instance;
}
