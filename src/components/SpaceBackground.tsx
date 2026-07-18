"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { MovingStars } from "./MovingStars";

export function SpaceBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas>
        <MovingStars />
      </Canvas>
    </div>
  );
}
