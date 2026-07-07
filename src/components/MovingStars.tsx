import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useEffect } from "react";

export function MovingStars() {
  const starsRef = useRef<any>(null);
  
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.02 * delta;
      starsRef.current.rotation.x -= 0.01 * delta;

      starsRef.current.position.x = THREE.MathUtils.lerp(
        starsRef.current.position.x, 
        mouse.current.x * 5, 
        0.05
      );
      
      starsRef.current.position.y = THREE.MathUtils.lerp(
        starsRef.current.position.y, 
        mouse.current.y * 5, 
        0.05
      );
    }
  });

  return (
    <group ref={starsRef}>
      <Stars
        radius={50}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade={true}
        speed={2}
      />
    </group>
  );
}