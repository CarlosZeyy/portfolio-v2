"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { LuPause, LuPlay } from "react-icons/lu";

const PLAYBACK_EVENTS = ["play", "playing", "pause", "ended", "emptied"] as const;

/**
 * Liga um botão de play/pause a um <video>.
 *
 * A fonte da verdade é o ELEMENTO, não um useState: `isPlaying` é lido de
 * `video.paused` e re-lido a cada evento de mídia (useSyncExternalStore). Um
 * booleano alternado no clique mentiria sempre que o estado mudasse por fora —
 * autoplay bloqueado pelo navegador, vídeo que termina, aba que vai para
 * segundo plano, a troca Desktop/Mobile que monta outro <video>.
 *
 * `videoRef` é um callback ref (guarda o nó em estado), não um useRef: quando o
 * <video> é trocado por outro, o hook precisa RE-assinar os eventos no nó novo,
 * e mudar `ref.current` não dispara nada.
 */
export function usePlayback() {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!video) return () => {};
      PLAYBACK_EVENTS.forEach((event) => video.addEventListener(event, onChange));
      return () =>
        PLAYBACK_EVENTS.forEach((event) => video.removeEventListener(event, onChange));
    },
    [video],
  );

  const isPlaying = useSyncExternalStore(
    subscribe,
    () => (video ? !video.paused && !video.ended : false),
    () => false,
  );

  // Quem pediu "menos movimento" no sistema não recebe vídeo em autoplay: ele
  // nasce pausado e o botão passa a ser o jeito de assistir (WCAG 2.2.2).
  useEffect(() => {
    if (video && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
    }
  }, [video]);

  const toggle = useCallback(() => {
    if (!video) return;
    // play() devolve uma Promise que rejeita se um pause() chegar no meio.
    if (video.paused || video.ended) video.play().catch(() => {});
    else video.pause();
  }, [video]);

  return { videoRef: setVideo, isPlaying, toggle, hasVideo: video !== null };
}

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Botão de vidro sobre a mídia. Discreto enquanto o vídeo toca (só aparece por
 * inteiro no hover/foco do palco, via group/media) e sempre visível quando está
 * pausado — pausado, ele é a única pista de que aquilo é um vídeo.
 */
export function PlayPauseButton({ isPlaying, onToggle, className = "" }: PlayPauseButtonProps) {
  const { t } = useTranslation();
  const label = t(isPlaying ? "projects.pause" : "projects.play");

  return (
    <button
      type="button"
      onClick={(event) => {
        // A mídia em volta também alterna no clique; sem isto seriam dois toggles.
        event.stopPropagation();
        onToggle();
      }}
      aria-label={label}
      aria-pressed={!isPlaying}
      title={label}
      className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/40 text-white shadow-lg shadow-black/40 outline-none backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-teal-400/60 hover:text-teal-300 focus-visible:border-teal-400/60 focus-visible:opacity-100 ${
        isPlaying
          ? "opacity-60 group-hover/media:opacity-100 [@media(hover:none)]:opacity-100"
          : "opacity-100"
      } ${className}`}
    >
      {/* Troca de ícone com um giro curto: mode="wait" + initial={false} evita
          animar no primeiro render. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isPlaying ? "pause" : "play"}
          initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
          transition={{ duration: 0.15 }}
          className="flex"
        >
          {/* O play é um triângulo: 1px à direita o centra opticamente. */}
          {isPlaying ? <LuPause /> : <LuPlay className="translate-x-px" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
