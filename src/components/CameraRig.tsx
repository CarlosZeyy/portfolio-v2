"use client";

import { useGSAP } from "@gsap/react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function CameraRig() {
  const { camera } = useThree();

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    camera.position.set(0, 0, 2);
    camera.lookAt(0, 0, 0);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    tl.to(
      camera.position,
      {
        z: 10,
        y: 5,
        ease: "none",
        onUpdate: () => camera.lookAt(0, 0, 0),
      },
      "<",
    );
  }, []);

  return null;
}
