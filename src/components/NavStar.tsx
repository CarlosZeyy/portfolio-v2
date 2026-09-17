import { Float, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from 'three'

export default function NavStar({
  radius,
  speed,
  title,
  angle
}: {
  radius: number;
  speed: number;
  angle: number;
  title: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const time = (state.clock.elapsedTime * speed) + angle;

      meshRef.current.position.x = Math.cos(time) * radius;

      meshRef.current.position.z = Math.sin(time) * radius;
    }
  })

  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color={"#fff"} />
        <Html center position={[0, -0.3, 0]}>
          <div className="text-white font-mono text-xl">{title}</div>
        </Html>
      </mesh>
    </Float>
  );
}
