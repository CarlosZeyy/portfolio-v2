"use client";

import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { createI18n } from "./client";
import { LOCALE_COOKIE, STORAGE_KEY, isLocale, type Locale } from "./settings";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function persist(locale: string) {
  document.documentElement.lang = locale;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // localStorage pode lançar (modo privado, storage bloqueado). A troca na
    // sessão e o cookie continuam funcionando.
  }
}

interface I18nProviderProps {
  /** Idioma com que o SERVIDOR renderizou esta página (getRequestLocale). */
  locale: Locale;
  children: ReactNode;
}

/**
 * Por que o idioma vem do servidor e não é "trocado depois da hidratação":
 * com streaming (o loading.tsx cria uma fronteira de Suspense) a página
 * hidrata em pedaços, e o conteúdo chega DEPOIS do layout. Um efeito que
 * trocasse o idioma rodaria nesse intervalo, e o pedaço tardio renderizaria em
 * inglês contra um HTML em português — erro de hidratação. Nascendo no mesmo
 * idioma dos dois lados, todos os pedaços batem, e ainda some o flash de
 * português para quem escolheu inglês.
 */
export function I18nProvider({ locale, children }: I18nProviderProps) {
  const [i18n] = useState(() => createI18n(locale));

  useEffect(() => {
    i18n.on("languageChanged", persist);

    // O localStorage é a fonte da verdade da escolha. Só diverge do que o
    // servidor usou se o cookie-espelho sumiu (expirou, foi limpo): aí
    // corrige, e o persist() regrava o cookie para a próxima requisição.
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // sem acesso ao storage: fica com o idioma do servidor
    }

    if (isLocale(stored) && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    } else {
      persist(i18n.language); // 1ª visita: fixa o idioma detectado
    }

    return () => i18n.off("languageChanged", persist);
  }, [i18n]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
