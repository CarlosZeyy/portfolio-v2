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

// Órbitas entre 2.8 e 5.2: abaixo disso o planeta entra no bulbo incandescente
// do núcleo; acima, ao passar na frente da câmera (que fica em z = 8) ele sai
// pela borda de baixo da tela junto com o label.
const PLANETS: {
  id: PlanetId;
  variant: PlanetVariant;
  title: string;
  radius: number;
}[] = [
  { id: "about", variant: "moon", title: "Sobre Mim", radius: 2.8 },
  { id: "experience", variant: "gyro", title: "Experiência", radius: 3.6 },
  { id: "projects", variant: "rings", title: "Projetos", radius: 4.4 },
  { id: "contact", variant: "lattice", title: "Contato", radius: 5.2 },
];

// Fase inicial: o ciclo de 2π dividido igualmente entre os planetas (π/2 com
// quatro). Sai do índice, então acrescentar um 5º planeta redistribui sozinho.
// Como todos têm a mesma velocidade angular, o espaçamento nunca se desfaz.
const NAV_STARS = PLANETS.map((planet, index) => ({
  ...planet,
  angle: (index / PLANETS.length) * Math.PI * 2,
}));

interface SpaceBackgroundProps {
  /**
   * false = só pano de fundo, mesmo no modo 3D: sem planetas, sem zoom e sem
   * capturar o mouse. É o caso de /project/[id]: o modo 3D persiste no store
   * durante a navegação, e o hub interativo atrás do texto roubaria o scroll.
   */
  hub?: boolean;
}

export function SpaceBackground({ hub = true }: SpaceBackgroundProps) {
  const is3DMode = useModeStore((state) => state.is3DMode) === true && hub;
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
