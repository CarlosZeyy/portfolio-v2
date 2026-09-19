"use client";

import { useCallback, useState } from "react";
import { LuImageOff } from "react-icons/lu";

const FALLBACK = "/fallback-thumb.jpeg";

interface AdminThumbProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Miniaturas pequenas: no fallback mostra só o ícone, sem o selo de texto. */
  compact?: boolean;
}

/**
 * Thumbnail com fallback. Dois detalhes que um onError simples não cobre:
 *
 * 1. A imagem pode falhar ANTES da hidratação. O <img> vem no HTML do servidor
 *    e o navegador já tenta baixá-lo; se o 404 chegar antes de o React anexar
 *    o onError, o evento se perde e a imagem quebrada fica na tela. Por isso o
 *    ref confere `complete && naturalWidth === 0` assim que o nó existe.
 * 2. O fallback é tratado, não disfarçado: entra dessaturado, com um selo
 *    "sem imagem". No painel você PRECISA saber qual projeto está com a
 *    thumbnail quebrada — esconder isso atrás de uma foto genérica bonita
 *    seria pior do que mostrar o erro.
 */
export function AdminThumb({ src, alt, className = "", compact = false }: AdminThumbProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  // Falha guardada POR src: trocar a imagem (preview no formulário) dá uma
  // nova chance sem precisar de efeito para "resetar" o estado.
  const failed = !src || failedSrc === src;

  const checkAlreadyBroken = useCallback(
    (image: HTMLImageElement | null) => {
      if (src && image?.complete && image.naturalWidth === 0) setFailedSrc(src);
    },
    [src],
  );

  return (
    <div className={`relative overflow-hidden bg-neutral-950 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- URLs do bucket e blobs de preview */}
      <img
        ref={checkAlreadyBroken}
        src={failed ? FALLBACK : src}
        alt={failed ? "" : alt}
        loading="lazy"
        onError={() => src && setFailedSrc(src)}
        className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105 ${
          failed ? "opacity-40 saturate-0" : ""
        }`}
      />

      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br from-teal-500/10 via-transparent to-violet-500/15">
          <LuImageOff
            className={compact ? "text-lg text-neutral-300" : "text-2xl text-neutral-300"}
            aria-label={compact ? "imagem indisponível" : undefined}
          />
          <span hidden={compact} className="rounded-full border border-white/15 bg-black/50 px-3 py-1 font-mono text-[10px] tracking-widest text-neutral-300 uppercase backdrop-blur-sm">
            {src ? "imagem indisponível" : "sem imagem"}
          </span>
        </div>
      )}
    </div>
  );
}
