"use client";

import { Canvas } from "@react-three/fiber";
import Galaxy from "./Galaxy";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import CameraRig2D from "./CameraRig2D";
import CameraRig3D from "./CameraRig3D";
import { useModeStore } from "@/store/useMenuStore";
import NavStar from "./NavStar";

export function SpaceBackground() {
  const is3DMode = useModeStore((state) => state.is3DMode);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas>
        {is3DMode ? <CameraRig3D /> : <CameraRig2D />}
        {is3DMode && (
          <NavStar radius={3} speed={0.15} angle={0} title="Sobre Mim" />
        )}
        {is3DMode && (
          <NavStar
            radius={4}
            speed={0.15}
            angle={Math.PI * (2 / 3)}
            title="Projetos"
          />
        )}
        {is3DMode && (
          <NavStar
            radius={5}
            speed={0.15}
            angle={Math.PI * (4 / 3)}
            title="Contato"
          />
        )}

        <Galaxy />

        <EffectComposer>
          <Bloom mipmapBlur intensity={1.2} luminanceThreshold={0} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
