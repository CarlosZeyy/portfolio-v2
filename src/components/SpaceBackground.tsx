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
        {is3DMode && <NavStar position={[-2.5, 0, 4]} title="Sobre Mim" />}
        {is3DMode && <NavStar position={[0, 0, 4.5]} title="Projetos" />}
        {is3DMode && <NavStar position={[2.5, 0, 4]} title="Contato" />}

        <Galaxy />

        <EffectComposer>
          <Bloom mipmapBlur intensity={1.2} luminanceThreshold={0} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
