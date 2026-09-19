"use client";

import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useState } from "react";
import Galaxy from "./Galaxy";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import CameraRig2D from "./CameraRig2D";
import CameraRig3D from "./CameraRig3D";
import { useModeStore } from "@/store/useMenuStore";
import NavStar from "./NavStar";
import type { PlanetVariant } from "./Planet";
import type { PlanetId } from "@/store/useOrbitStore";

const ORBIT_SPEED = 0.15;

// Teto de resolução de render. Névoa aditiva é fill-rate puro e o custo cresce
// com o QUADRADO do dpr: em tela retina (dpr 2) seriam 4x mais fragmentos para
// um ganho invisível em sprites que já são borrões macios.
const MAX_DPR = 1.5;
const MIN_DPR = 0.75;

const NAV_STARS: {
  id: PlanetId;
  variant: PlanetVariant;
  title: string;
  radius: number;
  angle: number;
}[] = [
  { id: "about", variant: "moon", title: "Sobre Mim", radius: 3, angle: 0 },
  { id: "projects", variant: "rings", title: "Projetos", radius: 4, angle: Math.PI * (2 / 3) },
  { id: "contact", variant: "lattice", title: "Contato", radius: 5, angle: Math.PI * (4 / 3) },
];

export function SpaceBackground() {
  const is3DMode = useModeStore((state) => state.is3DMode);
  const [dprCap, setDprCap] = useState(MAX_DPR);

  return (
    // No modo 3D o canvas precisa receber o mouse (raycaster do hover + wheel);
    // no 2D ele continua sendo só um fundo que não bloqueia a página.
    <div
      className={`fixed inset-0 z-0 ${is3DMode ? "" : "pointer-events-none"}`}
    >
      {/* dpr={[min, max]} limita o devicePixelRatio real a esse intervalo. */}
      <Canvas dpr={[MIN_DPR, dprCap]}>
        {/* Válvula de segurança: mede o fps real e devolve um fator 0..1. Em
            GPU fraca a resolução desce sozinha até o frame rate estabilizar;
            se ficar oscilando (flipflops), trava num valor conservador. */}
        <PerformanceMonitor
          flipflops={3}
          onChange={({ factor }) =>
            setDprCap(
              Math.round((MIN_DPR + (MAX_DPR - MIN_DPR) * factor) * 10) / 10,
            )
          }
          onFallback={() => setDprCap(1)}
        />
        {is3DMode ? <CameraRig3D /> : <CameraRig2D />}
        {is3DMode &&
          NAV_STARS.map((star) => (
            <NavStar key={star.id} speed={ORBIT_SPEED} {...star} />
          ))}

        <Galaxy intensity={is3DMode ? 1 : 0.3} />

        {/* multisampling={0}: o padrão do composer é MSAA 8x, que multiplica
            a largura de banda de cada fragmento aditivo por 8 e não melhora em
            nada sprites macios. Desligar levou a cena de ~30 para 60 fps. */}
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.2} luminanceThreshold={0} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
