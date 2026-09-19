"use client";

import { useTranslation } from "react-i18next";
import { LOCALES, LOCALE_LABELS } from "@/i18n/settings";

interface LanguageToggleProps {
  className?: string;
}

/** PT | EN. A escolha é salva no localStorage pelo I18nProvider. */
export function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { t, i18n } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={`flex items-center font-mono text-xs tracking-wider ${className}`}
    >
      {LOCALES.map((locale, index) => {
        const isActive = i18n.resolvedLanguage === locale;

        return (
          <span key={locale} className="flex items-center">
            {index > 0 && (
              <span aria-hidden className="px-1.5 text-neutral-600">
                |
              </span>
            )}
            <button
              type="button"
              onClick={() => i18n.changeLanguage(locale)}
              aria-pressed={isActive}
              title={t(`language.${locale}`)}
              className={`cursor-pointer transition-colors ${
                isActive
                  ? "text-teal-400"
                  : "text-neutral-500 hover:text-neutral-200"
              }`}
            >
              {LOCALE_LABELS[locale]}
            </button>
          </span>
        );
      })}
    </div>
  );
}
