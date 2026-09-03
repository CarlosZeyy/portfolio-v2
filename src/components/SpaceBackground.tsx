"use client";

import { Canvas } from "@react-three/fiber";
import Galaxy from "./Galaxy";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

export function SpaceBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas>
        <Galaxy />
        <EffectComposer>
          <Bloom mipmapBlur intensity={1.2} luminanceThreshold={0} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
