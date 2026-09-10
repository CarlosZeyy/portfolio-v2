"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Galaxy() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const count = 30000;

  const positions = useMemo(() => {
    const branches = 3;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 15;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const spinAngle = radius * 0.5 + Math.pow(Math.random(), 3) * 2;

      const randomX =
        Math.pow(Math.random(), 3) *
        (Math.random() < 0.5 ? 1 : -1) *
        0.5 *
        radius;
      const randomY =
        Math.pow(Math.random(), 3) *
        (Math.random() < 0.5 ? 1 : -1) *
        0.5 *
        radius;
      const randomZ =
        Math.pow(Math.random(), 3) *
        (Math.random() < 0.5 ? 1 : -1) *
        0.5 *
        radius;

      positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i * 3 + 1] = randomY;
      positions[i * 3 + 2] =
        Math.sin(branchAngle + spinAngle) * radius + randomZ;
    }

    return positions;
  }, []);

  const particleTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d");

    if (context) {
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
    }

    if (groupRef.current) {
      const targetX = Math.PI * 0.25 + state.pointer.y * 0.15;
      const targetZ = -(state.pointer.x * 0.15);

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetX,
        delta * 2,
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        targetZ,
        delta * 2,
      );
    }
  });

  return (
    <group ref={groupRef} rotation={[Math.PI * 0.25, 0, 0]}>
      <points ref={pointsRef}>
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
          size={0.025}
          color="#14b8a6"
          transparent={true}
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={particleTexture}
        />
      </points>
    </group>
  );
}
