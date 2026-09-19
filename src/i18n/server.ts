import { cookies, headers } from "next/headers";
import {
  LOCALE_COOKIE,
  isLocale,
  localeFromLanguageTag,
  type Locale,
} from "./settings";

/**
 * Idioma com que o servidor renderiza ESTA requisição:
 *  1. o cookie-espelho da escolha do usuário, se existir;
 *  2. senão (primeira visita), o Accept-Language do navegador.
 */
export async function getRequestLocale(): Promise<Locale> {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(stored)) return stored;

  return localeFromLanguageTag((await headers()).get("accept-language"));
}
