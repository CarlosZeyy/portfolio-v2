"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Galaxy() {
  const pointsRef = useRef<THREE.Points>(null);

  const count = 30000;

  const positions = useMemo(() => {
    const branches = 3;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 15;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const spinAngle = radius * 0.5 + Math.pow(Math.random(), 3) * 2;

      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * radius;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * radius;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * radius;

      const x = Math.cos(branchAngle + spinAngle) * radius + randomX;
      const y = randomY;
      const z = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    return positions;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <points ref={pointsRef} rotation={[Math.PI * 0.25, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.015}
        color={"#14b8a6"}
        transparent={true}
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
