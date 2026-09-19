import { IconType } from "react-icons";

/**
 * Uma entrada do catálogo de stacks (src/lib/stackIcons.ts).
 *
 * Os ícones vêm do pacote `react-icons` (conjunto Simple Icons: `react-icons/si`),
 * que já são componentes SVG otimizados e tree-shakeable — só os importados
 * entram no bundle. SVG próprio só quando a marca não existe lá (hoje, só o
 * Zustand, em public/svg/zustand.jsx).
 */
export interface Icon {
  icon: IconType;
  /**
   * Cor OFICIAL da marca + "66" de alpha (#RRGGBB66). O StackChip usa os 6
   * primeiros dígitos para pintar o ícone; marcas quase pretas caem na cor
   * neutra do texto para não sumirem no vidro escuro.
   */
  bg: string;
}
