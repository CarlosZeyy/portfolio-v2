"use client";

import { useState } from "react";
import { LuX } from "react-icons/lu";
import { AdminThumb } from "./admin/AdminThumb";

/**
 * Imagens JÁ salvas na galeria do projeto. Remover aqui só tira da lista que
 * vai no campo oculto `remaining_gallery`; o banco só muda quando o formulário
 * é salvo — dá para desistir sem perder nada.
 */
export default function GalleryManager({ initialUrls }: { initialUrls: string[] }) {
  const [urls, setUrls] = useState<string[]>(initialUrls || []);

  return (
    <>
      {urls.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {urls.map((url) => (
            <li key={url} className="group/card relative">
              <AdminThumb src={url} alt="" compact className="aspect-4/3 rounded-xl" />
              <button
                type="button"
                onClick={() => setUrls(urls.filter((item) => item !== url))}
                aria-label="Remover imagem"
                className="absolute top-1.5 right-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/70 text-neutral-200 opacity-0 backdrop-blur-sm transition-all duration-200 group-hover/card:opacity-100 hover:border-rose-400/60 hover:text-rose-300 focus-visible:opacity-100"
              >
                <LuX className="text-sm" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input type="hidden" name="remaining_gallery" value={JSON.stringify(urls)} />
    </>
  );
}
