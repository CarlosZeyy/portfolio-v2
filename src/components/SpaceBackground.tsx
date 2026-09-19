"use client";

import { Canvas } from "@react-three/fiber";
import Galaxy from "./Galaxy";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import CameraRig2D from "./CameraRig2D";
import CameraRig3D from "./CameraRig3D";
import { useModeStore } from "@/store/useMenuStore";
import NavStar from "./NavStar";

const ORBIT_SPEED = 0.15;

const NAV_STARS = [
  { id: "about", title: "Sobre Mim", radius: 3, angle: 0 },
  { id: "projects", title: "Projetos", radius: 4, angle: Math.PI * (2 / 3) },
  { id: "contact", title: "Contato", radius: 5, angle: Math.PI * (4 / 3) },
];

export function SpaceBackground() {
  const is3DMode = useModeStore((state) => state.is3DMode);

  return (
    // No modo 3D o canvas precisa receber o mouse (raycaster do hover + wheel);
    // no 2D ele continua sendo só um fundo que não bloqueia a página.
    <div
      className={`fixed inset-0 z-0 ${is3DMode ? "" : "pointer-events-none"}`}
    >
      <Canvas>
        {is3DMode ? <CameraRig3D /> : <CameraRig2D />}
        {is3DMode &&
          NAV_STARS.map((star) => (
            <NavStar key={star.id} speed={ORBIT_SPEED} {...star} />
          ))}

        <Galaxy />

        <EffectComposer>
          <Bloom mipmapBlur intensity={1.2} luminanceThreshold={0} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
