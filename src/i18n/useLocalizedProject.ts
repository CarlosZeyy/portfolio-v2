"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { localizeProject } from "@/lib/projectLocale";
import type { Project } from "@/lib/projectSchema";

/**
 * O projeto com os textos no idioma ativo do site. Reage à troca no PT | EN:
 * o useTranslation re-renderiza o componente e o memo recalcula.
 */
export function useLocalizedProject(project: Project): Project {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "pt-BR";

  return useMemo(() => localizeProject(project, locale), [project, locale]);
}
