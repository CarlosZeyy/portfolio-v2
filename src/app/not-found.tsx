"use client";

import { Canvas } from "@react-three/fiber";
import { MovingStars } from "@/components/MovingStars";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full relative flex justify-center items-center">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas>
          <MovingStars />
        </Canvas>
      </div>

      <div className="flex flex-col gap-7 justify-center items-center text-2xl z-10 relative">
        <h1 className="text-8xl font-bold">404</h1>
        <p className="text-3xl font-light">
          Parece que uma estrela se perdeu no buraco negro
        </p>

        <Link
          href={"/"}
          className="flex gap-2 text-xl font-extralight items-center hover:underline"
        >
          <FaArrowLeft className="cursor-pointer" />
          Voltar para a pagina principal
        </Link>
      </div>
    </div>
  );
}
