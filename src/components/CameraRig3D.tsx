"use client";

import { useGSAP } from "@gsap/react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";

export default function CameraRig3D() {
  const { camera } = useThree();

  useGSAP(() => {
    camera.position.set(0, 0, 2);
    camera.lookAt(0, 0, 0);

    gsap.to(camera.position, {
      z: 8,
      y: 4,
      duration: 2.5,
      ease: "power2.out",
      onUpdate: () => camera.lookAt(0, 0, 0),
    });
  }, []);

  return null;
}
