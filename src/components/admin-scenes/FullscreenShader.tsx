"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const MAX_DELTA = 0.1;
const POINTER_DAMPING = 2.5;

// O quad já nasce em clip space (-1..1): não existe câmera, matriz nem
// projeção no caminho. A cena inteira é o fragment shader.
const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

interface FullscreenShaderProps {
  fragmentShader: string;
}

/**
 * Base dos fundos do admin: um quad de tela cheia + um fragment shader que
 * recebe uTime, uResolution (em pixels do buffer) e uPointer (-1..1, amortecido).
 *
 * Memória de GPU: o que existe aqui é UM programa, UM buffer de 4 vértices e
 * nenhuma textura ou render target. Geometria e material são declarados em
 * JSX, então o R3F chama .dispose() nos dois quando o componente desmonta — é
 * o que acontece ao navegar de /login para /admin: o programa do buraco negro
 * é liberado antes de o da supernova ser compilado. O contexto WebGL em si é
 * destruído pelo <Canvas> quando o layout do admin sai de cena.
 */
export function FullscreenShader({ fragmentShader }: FullscreenShaderProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  // Ponteiro lido da window: o canvas é um fundo com pointer-events: none.
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame((state, rawDelta) => {
    const material = materialRef.current;
    if (!material) return;

    const delta = Math.min(rawDelta, MAX_DELTA);
    const { uTime, uResolution, uPointer } = material.uniforms;

    uTime.value += delta;
    uResolution.value.set(
      state.size.width * state.viewport.dpr,
      state.size.height * state.viewport.dpr,
    );
    uPointer.value.set(
      THREE.MathUtils.damp(uPointer.value.x, pointer.current.x, POINTER_DAMPING, delta),
      THREE.MathUtils.damp(uPointer.value.y, pointer.current.y, POINTER_DAMPING, delta),
    );
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        // O tone mapping é feito à mão dentro de cada shader.
        toneMapped={false}
      />
    </mesh>
  );
}
