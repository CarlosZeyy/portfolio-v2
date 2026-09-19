import { stackIcons } from "@/lib/stackIcons";

// O `bg` do stackIcons é a cor da marca com alpha ("#3178C666"). Marcas quase
// pretas (Express, Vercel...) sumiriam no vidro escuro: abaixo desse brilho o
// ícone usa a cor neutra do texto.
const MIN_BRIGHTNESS = 70;

function brandColor(stack: string): string | undefined {
  const hex = stackIcons[stack]?.bg?.slice(1, 7);
  if (!hex || hex.length < 6) return undefined;

  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return brightness < MIN_BRIGHTNESS ? undefined : `#${hex}`;
}

const SIZES = {
  sm: "gap-1.5 px-2.5 py-1 text-[11px]",
  md: "gap-2 px-3 py-1.5 text-xs",
};

interface StackChipProps {
  stack: string;
  size?: keyof typeof SIZES;
}

/** Tag de tecnologia: a mesma no card, no modal e no case study. */
export function StackChip({ stack, size = "sm" }: StackChipProps) {
  const Icon = stackIcons[stack]?.icon;

  return (
    <span
      className={`flex shrink-0 items-center whitespace-nowrap rounded-full border border-neutral-200 bg-neutral-100/70 font-mono font-medium text-neutral-600 transition-colors hover:border-neutral-300 dark:border-white/10 dark:bg-[#0B0E14]/65 dark:text-neutral-300 dark:hover:border-white/25 ${SIZES[size]}`}
    >
      {Icon && (
        <Icon
          className={size === "md" ? "text-base" : "text-sm"}
          style={{ color: brandColor(stack) }}
        />
      )}
      {stack}
    </span>
  );
}
