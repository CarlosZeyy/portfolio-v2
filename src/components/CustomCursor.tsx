"use client";

import { useEffect, useRef } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";

type CursorState = "default" | "link" | "native" | "space" | "target";

// Onde o anel abre: tudo que é clicável. O card de projeto entra de graça — o
// clique dele é o ::after esticado de um <a>, então o alvo do evento já é o link.
const INTERACTIVE =
  'a[href], button, summary, select, label[for], [role="button"], [role="radio"], [role="tab"], [role="link"], [data-cursor="link"]';
// Onde o cursor customizado sai de cena e o I-beam nativo volta (globals.css).
const TEXT_ENTRY =
  'input:not([type="checkbox"], [type="radio"], [type="range"], [type="file"], [type="submit"], [type="button"]), textarea, [contenteditable="true"]';

// Rigidez do atraso do anel: ele percorre ~95% da distância em 3/LAMBDA s.
const RING_LAMBDA = 18;
// Abaixo disto (px) o anel é considerado "chegou" e o loop para.
const SETTLE_DISTANCE = 0.1;

/**
 * Cursor customizado. O requisito que manda em todas as decisões é: NÃO custar
 * FPS — ele convive com um canvas WebGL pesado.
 *
 *  1. O React renderiza este componente UMA vez. Mover o mouse não chama
 *     setState: a posição é escrita direto em `style.transform` via refs, e os
 *     estados visuais são data-atributos trocados no DOM. Zero reconciliação.
 *  2. Só `transform` e `opacity` mudam (camadas promovidas com will-change):
 *     o compositor resolve sozinho, sem layout nem repaint do que está embaixo.
 *  3. O requestAnimationFrame só existe enquanto o anel está alcançando o
 *     ponteiro. Mouse parado = nenhum código rodando por frame.
 *  4. O que é caro — descobrir o que está sob o mouse (`closest`) — roda no
 *     `pointerover`, que dispara ao ENTRAR num elemento, e não a cada pixel.
 *  5. Sem mix-blend-mode e sem backdrop-filter: os dois forçariam o navegador
 *     a recompor o canvas inteiro por baixo de um elemento de 36px.
 *
 * (Framer Motion resolveria o atraso com useSpring, também sem re-render; o
 * loop próprio ganha no item 3 — a mola do Framer não sabe que pode dormir.)
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!root || !ring || !dot) return;

    // Só com mouse de verdade. Em tela de toque o componente não faz nada e o
    // cursor nativo (que lá nem existe) não é escondido.
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const pointer = { x: 0, y: 0 };
    const ringPosition = { x: 0, y: 0 };
    let frame = 0;
    let lastTime = 0;
    let hasPosition = false;
    // Estado vindo do DOM (o que está sob o mouse) e do hub 3D (planeta em
    // hover). O segundo tem prioridade enquanto o mouse estiver no canvas.
    let domState: CursorState = "default";
    let planetHovered = useOrbitStore.getState().hoveredPlanetId !== null;

    const applyState = () => {
      const state =
        domState === "space" && planetHovered ? "target" : domState;
      if (root.dataset.state !== state) root.dataset.state = state;
    };

    const place = (element: HTMLElement, x: number, y: number) => {
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const tick = (now: number) => {
      // Suavização exponencial corrigida pelo tempo do frame: o anel leva o
      // mesmo tempo para chegar a 60Hz ou 144Hz.
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const factor = reduceMotion.matches ? 1 : 1 - Math.exp(-RING_LAMBDA * delta);

      ringPosition.x += (pointer.x - ringPosition.x) * factor;
      ringPosition.y += (pointer.y - ringPosition.y) * factor;

      const settled =
        Math.abs(pointer.x - ringPosition.x) + Math.abs(pointer.y - ringPosition.y) <
        SETTLE_DISTANCE;
      if (settled) {
        ringPosition.x = pointer.x;
        ringPosition.y = pointer.y;
      }
      place(ring, ringPosition.x, ringPosition.y);

      // Chegou: o loop morre aqui e só renasce no próximo pointermove.
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      pointer.x = event.clientX;
      pointer.y = event.clientY;
      // O ponto acompanha 1:1, sem atraso: é ele que diz onde o clique cai. (O
      // navegador já alinha os pointermove ao frame, então isto é 1x por frame.)
      place(dot, pointer.x, pointer.y);

      if (!hasPosition) {
        // Primeiro movimento: o anel nasce NO ponteiro, não viajando do canto.
        hasPosition = true;
        ringPosition.x = pointer.x;
        ringPosition.y = pointer.y;
        place(ring, pointer.x, pointer.y);
        root.dataset.visible = "true";
      }

      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest(TEXT_ENTRY)) domState = "native";
      else if (target.closest(INTERACTIVE)) domState = "link";
      // O <canvas> só é alvo de evento no hub 3D: no modo 2D e no admin ele é
      // pointer-events: none, e o mouse "atravessa" até a página.
      else if (target instanceof HTMLCanvasElement) domState = "space";
      else domState = "default";

      applyState();
    };

    const handlePointerDown = () => (root.dataset.pressed = "true");
    const handlePointerUp = () => (root.dataset.pressed = "false");
    const handleLeave = () => (root.dataset.visible = "false");
    const handleEnter = () => {
      if (hasPosition) root.dataset.visible = "true";
    };
    // Notebook com tela de toque: ao tocar, o cursor some até o mouse voltar.
    const handleTouchStart = () => {
      root.dataset.visible = "false";
      hasPosition = false;
    };

    // O hover do planeta vem do raycaster do R3F, não do DOM: assina o store
    // FORA do React (subscribe), então mirar um planeta também não re-renderiza.
    const unsubscribe = useOrbitStore.subscribe((state) => {
      const hovered = state.hoveredPlanetId !== null;
      if (hovered === planetHovered) return;
      planetHovered = hovered;
      applyState();
    });

    const options = { passive: true } as const;
    document.addEventListener("pointermove", handlePointerMove, options);
    document.addEventListener("pointerover", handlePointerOver, options);
    document.addEventListener("pointerdown", handlePointerDown, options);
    document.addEventListener("pointerup", handlePointerUp, options);
    document.addEventListener("touchstart", handleTouchStart, options);
    document.documentElement.addEventListener("mouseleave", handleLeave);
    document.documentElement.addEventListener("mouseenter", handleEnter);
    // A classe que esconde o cursor nativo só entra agora, com tudo pronto.
    document.documentElement.classList.add("has-custom-cursor");

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("touchstart", handleTouchStart);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
      document.documentElement.removeEventListener("mouseenter", handleEnter);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="cursor"
      data-state="default"
      data-visible="false"
      data-pressed="false"
    >
      <div ref={ringRef} className="cursor__layer">
        <div className="cursor__ring">
          <svg viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="17" />
            {/* Marcas do retículo (só no hub 3D). Dois grupos: o de fora gira
                por animação, o de dentro aproxima as marcas ao "travar". */}
            <g className="cursor__spin">
              <g className="cursor__ticks">
                <path d="M18 -5v7M18 34v7M-5 18h7M34 18h7" />
              </g>
            </g>
          </svg>
        </div>
      </div>
      <div ref={dotRef} className="cursor__layer">
        <div className="cursor__dot" />
      </div>
    </div>
  );
}
