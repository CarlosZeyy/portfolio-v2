"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import BlackHole3D from "./BlackHole3D";
import Supernova3D from "./Supernova3D";

// Fundo não precisa de 60fps: o gás e o disco se movem devagar. Metade dos
// quadros = metade do trabalho da GPU (e da bateria) numa tela de formulário.
const BACKGROUND_FPS = 30;

/**
 * Com frameloop="demand" o R3F só desenha quando alguém chama invalidate().
 * Este componente chama a 30Hz — ou uma única vez, se o usuário pediu menos
 * movimento no sistema (o fundo vira uma imagem estática).
 */
function FrameLimiter() {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      // Aba em segundo plano: não acumula trabalho à toa.
      if (!document.hidden) invalidate();
    }, 1000 / BACKGROUND_FPS);
    return () => clearInterval(timer);
  }, [invalidate]);

  return null;
}

export function AdminBackground() {
  // Igualdade exata: só /login é o buraco negro. Qualquer outra rota do grupo
  // (admin) — /admin, /admin/new, /admin/edit/[id], /admin/messages — é a
  // supernova.
  const isLogin = usePathname() === "/login";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-[#05060A]">
      <Canvas
        frameloop="demand"
        // Buraco negro: O(1) por pixel e tem bordas nítidas (sombra, estrelas)
        // -> resolução cheia. Supernova: 14 amostras de ruído 3D por pixel e
        // conteúdo naturalmente difuso -> meia resolução, ~4x menos raios.
        dpr={isLogin ? [1, 1.5] : [0.5, 0.75]}
        gl={{
          antialias: false, // MSAA não faz nada por um quad de tela cheia
          alpha: false,
          depth: false,
          stencil: false,
          powerPreference: "low-power",
        }}
      >
        <FrameLimiter />
        {/* Um único <Canvas> (um contexto WebGL) para o grupo inteiro: ao
            trocar de rota só a cena filha é desmontada, e o R3F descarta o
            material e a geometria dela. */}
        {isLogin ? <BlackHole3D /> : <Supernova3D />}
      </Canvas>

      {/* Véu de leitura das páginas do painel: a explosão fica viva no topo e
          o degradê escurece a área onde estão formulários e listas. No /login
          não precisa: o buraco negro fica de lado e o card tem fundo próprio. */}
      {!isLogin && (
        <div className="absolute inset-0 bg-linear-to-b from-[#05060A]/10 via-[#05060A]/60 to-[#05060A]/85" />
      )}
    </div>
  );
}
