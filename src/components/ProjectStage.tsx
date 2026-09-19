"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import { LuMonitor, LuSmartphone } from "react-icons/lu";
import { EASE_OUT_EXPO } from "@/lib/motion";
import type { Project } from "@/lib/projectSchema";
import { PlayPauseButton, usePlayback } from "./VideoPlayback";

type Device = "desktop" | "mobile";

const DEVICES: { id: Device; icon: IconType; ratio: string }[] = [
  { id: "desktop", icon: LuMonitor, ratio: "16:9" },
  { id: "mobile", icon: LuSmartphone, ratio: "9:16" },
];

// Geometria do palco em cada modo. `bezel` é a moldura do aparelho: 0 no
// desktop (o vídeo vai de borda a borda), 10px no celular.
const SHAPE = {
  desktop: { aspect: 16 / 9, radius: 24, bezel: 0 },
  mobile: { aspect: 9 / 16, radius: 46, bezel: 10 },
} as const;
const PHONE_MAX_WIDTH = 340;
// Em telas estreitas o "celular" ocupa no máximo esta fração da largura útil,
// senão ele seria do tamanho do próprio celular de quem está vendo.
const PHONE_MAX_FRACTION = 0.8;

const MORPH = { duration: 0.8, ease: EASE_OUT_EXPO };

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

export function ProjectStage({ project }: { project: Project }) {
  const { t } = useTranslation();
  const { videoRef, isPlaying, toggle, hasVideo } = usePlayback();
  const containerRef = useRef<HTMLDivElement>(null);

  const [device, setDevice] = useState<Device>("desktop");
  // Só para o fallback de CSS do primeiro paint (ver o style da moldura).
  const [measured, setMeasured] = useState(false);
  const hasMobile = Boolean(project.videoMobileUrl);

  // A geometria inteira do palco deriva de DOIS MotionValues:
  //   containerWidth — largura disponível, escrita direto pelo ResizeObserver
  //   morph          — 0 = desktop, 1 = mobile, animado no clique do seletor
  // Como são MotionValues (e não estado do React), redimensionar a janela
  // atualiza o palco na hora e sem re-render, e trocar de aparelho é sempre
  // uma animação — não existe "às vezes anima, às vezes pula".
  //
  // Por que largura/altura REAIS e não a prop `layout` do Framer: `layout`
  // anima com transform: scale. Isso (1) esticaria o vídeo no meio do caminho
  // entre 16:9 e 9:16 e (2) não empurraria o resto da página — a narrativa
  // abaixo PULARIA para a posição nova no primeiro frame. Com dimensões reais o
  // vídeo só é recortado (object-cover) e tudo o que vem depois flui junto.
  const containerWidth = useMotionValue(0);
  const morph = useMotionValue(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      containerWidth.set(entry.contentRect.width);
      setMeasured(true);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerWidth]);

  const phoneWidth = (available: number) =>
    Math.min(PHONE_MAX_WIDTH, available * PHONE_MAX_FRACTION);

  const width = useTransform([containerWidth, morph], ([available, progress]: number[]) =>
    mix(available, phoneWidth(available), progress),
  );
  const height = useTransform([containerWidth, morph], ([available, progress]: number[]) =>
    mix(
      available / SHAPE.desktop.aspect,
      phoneWidth(available) / SHAPE.mobile.aspect,
      progress,
    ),
  );
  const frameRadius = useTransform(morph, [0, 1], [SHAPE.desktop.radius, SHAPE.mobile.radius]);
  const bezel = useTransform(morph, [0, 1], [SHAPE.desktop.bezel, SHAPE.mobile.bezel]);
  const screenRadius = useTransform(
    morph,
    [0, 1],
    [
      SHAPE.desktop.radius - SHAPE.desktop.bezel,
      SHAPE.mobile.radius - SHAPE.mobile.bezel,
    ],
  );

  // Parallax (só no desktop): a imagem desliza dentro da moldura enquanto o
  // palco atravessa a tela. Num mockup de celular a "tela" não deve escorregar.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const selectDevice = (next: Device) => {
    if (next === device) return;
    setDevice(next);
    // Parte do valor ATUAL: clicar no meio de uma transição inverte o caminho
    // suavemente, sem voltar ao início.
    animate(morph, next === "mobile" ? 1 : 0, MORPH);
  };

  const desktopMedia = project.videoUrl ? (
    <video
      ref={videoRef}
      src={project.videoUrl}
      autoPlay
      loop
      muted
      playsInline
      poster={project.thumbnail || undefined}
      className="h-full w-full object-cover"
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element -- URL do bucket do Supabase
    <img
      src={project.thumbnail || "/fallback-thumb.jpeg"}
      alt={t("projects.previewAlt", { title: project.title })}
      className="h-full w-full object-cover"
    />
  );

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.1, delay: 0.5, ease: EASE_OUT_EXPO }}
      className="relative mt-16"
    >
      {hasMobile && (
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
            <span className="text-teal-400">
              {DEVICES.find((item) => item.id === device)?.ratio}
            </span>{" "}
            · {t(`projects.device.${device}`)}
          </p>

          <div
            role="radiogroup"
            aria-label={t("projects.device.label")}
            className="flex rounded-full border border-white/10 bg-[#0B0E14]/60 p-1 backdrop-blur-md"
          >
            {DEVICES.map(({ id, icon: Icon }) => {
              const active = device === id;

              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => selectDevice(id)}
                  className={`relative flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm outline-none transition-colors duration-300 focus-visible:text-teal-300 ${
                    active ? "text-white" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {/* UM único destaque com layoutId: ele desliza de uma opção
                      para a outra em vez de apagar aqui e acender ali. */}
                  {active && (
                    <motion.span
                      layoutId="device-toggle-pill"
                      transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                      className="absolute inset-0 rounded-full bg-linear-to-r from-teal-500/25 to-violet-500/25 shadow-[inset_0_0_0_1px_rgb(45_212_191/0.4)]"
                    />
                  )}
                  <Icon className="relative" />
                  <span className="relative">{t(`projects.device.${id}`)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <motion.div
        // Antes de medir (SSR / 1º paint) o tamanho vem do CSS, que já é o
        // formato desktop — assim não existe um "salto" quando a medida chega.
        style={
          measured
            ? { width, height, borderRadius: frameRadius, padding: bezel }
            : { width: "100%", aspectRatio: "16 / 9", borderRadius: SHAPE.desktop.radius }
        }
        className="relative mx-auto bg-neutral-950 shadow-2xl shadow-black/50"
      >
        {/* Halo nas cores da nébula. Mora DENTRO da moldura animada, então
            encolhe e cresce junto com ela. */}
        <div
          aria-hidden
          className="absolute -inset-8 -z-10 rounded-[3rem] bg-linear-to-br from-teal-500/20 via-transparent to-violet-500/25 blur-3xl"
        />

        {/* Botões laterais do aparelho: só existem no modo celular. */}
        <AnimatePresence>
          {device === "mobile" && (
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <span className="absolute top-28 -left-[3px] h-8 w-[3px] rounded-l bg-neutral-700" />
              <span className="absolute top-40 -left-[3px] h-14 w-[3px] rounded-l bg-neutral-700" />
              <span className="absolute top-36 -right-[3px] h-20 w-[3px] rounded-r bg-neutral-700" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* A "tela". group/media: o botão de play reage ao hover dela; clicar
            na própria mídia também alterna, como em qualquer player. */}
        <motion.div
          style={{ borderRadius: measured ? screenRadius : SHAPE.desktop.radius }}
          onClick={hasVideo ? toggle : undefined}
          className={`group/media relative h-full w-full overflow-hidden bg-neutral-950 ${
            hasVideo ? "cursor-pointer" : ""
          }`}
        >
          {/* mode="wait": o vídeo antigo some rápido (0.2s), a moldura muda de
              forma quase vazia, e o novo entra quando ela já está perto do
              formato final — nenhum dos dois é visto no formato errado. */}
          <AnimatePresence mode="wait" initial={false}>
            {device === "mobile" && project.videoMobileUrl ? (
              <motion.div
                key="mobile"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.5, delay: 0.3, ease: EASE_OUT_EXPO },
                }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="absolute inset-0"
              >
                <video
                  ref={videoRef}
                  src={project.videoMobileUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
                {/* "Dynamic island": o detalhe que faz o retângulo ler como
                    celular, sem desenhar um aparelho inteiro. */}
                <span
                  aria-hidden
                  className="absolute top-3 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]"
                />
              </motion.div>
            ) : (
              <motion.div
                key="desktop"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.5, delay: 0.3, ease: EASE_OUT_EXPO },
                }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="absolute inset-0"
              >
                {/* scale-112: folga para o parallax de ±6% nunca mostrar a borda. */}
                <motion.div style={{ y: parallaxY }} className="h-full w-full scale-112">
                  {desktopMedia}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {hasVideo && (
            <PlayPauseButton
              isPlaying={isPlaying}
              onToggle={toggle}
              className="absolute right-4 bottom-4 z-10"
            />
          )}
        </motion.div>

        <div
          aria-hidden
          className="glass-ring pointer-events-none absolute inset-0 rounded-[inherit]"
        />
      </motion.div>
    </motion.div>
  );
}
