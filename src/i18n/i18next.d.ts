import "i18next";
import type { Dictionary } from "./locales/pt-BR";

// Chaves tipadas: t("hero.greting") vira erro de compilação, com autocomplete.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: Dictionary };
  }
}
