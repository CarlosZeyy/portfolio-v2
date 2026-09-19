"use client";

import { useRef, useEffect, useId, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  FaGithub,
  FaArrowUpRightFromSquare,
  FaArrowRight,
} from "react-icons/fa6";
import { Project } from "@/lib/projectSchema";
import { StackChip } from "./StackChip";

const EXPAND_DELAY_MS = 3000;
const EXPAND_DELAY_S = EXPAND_DELAY_MS / 1000;
const MAX_VISIBLE_STACKS = 4;
const CARD_RADIUS = 20; // = rounded-[20px]; o neon precisa do mesmo raio

// Comprimento da "cabeça" do feixe, em fração do perímetro.
const BEAM_HEAD = 0.035;

// Os botões do rodapé ficam ACIMA do link esticado do título (ver abaixo).
const ACTION_BASE =
  "relative z-10 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5";
const ACTION_OUTLINE = `${ACTION_BASE} border border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-white/10 dark:text-neutral-200 dark:hover:border-teal-400/40 dark:hover:bg-white/5`;

/**
 * Feixe neon que dá a volta no card durante os 3s do hover. Três camadas sobre
 * o mesmo traçado, como num tubo de neon de verdade:
 *  1. halo  — traço largo e desfocado: a luz que vaza para fora do card
 *  2. tubo  — traço fino em degradê teal -> violeta
 *  3. cabeça — um traço curto, quase branco, que corre na PONTA do feixe
 * Todas usam pathLength=1, então "0 a 1" é o perímetro inteiro seja qual for o
 * tamanho do card.
 */
function NeonBeam({ active }: { active: boolean }) {
  const gradientId = useId();

  const draw = active
    ? { duration: EXPAND_DELAY_S, ease: "linear" as const }
    : { duration: 0.35 };
  const shared = {
    width: "100%",
    height: "100%",
    rx: CARD_RADIUS,
    fill: "transparent",
    stroke: `url(#${gradientId})`,
    strokeLinecap: "round" as const,
    initial: { pathLength: 0 },
    animate: { pathLength: active ? 1 : 0 },
    transition: draw,
  };

  return (
    // overflow-visible + fora do wrapper que recorta o card: o halo pode
    // sangrar para FORA da borda, que é o que faz parecer luz e não contorno.
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="55%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>

      <motion.rect
        {...shared}
        strokeWidth={12}
        opacity={0.75}
        style={{ filter: "blur(10px)" }}
      />
      <motion.rect {...shared} strokeWidth={2} />

      {/* Cabeça: um traço de BEAM_HEAD de comprimento. O dashoffset anda de
          BEAM_HEAD até BEAM_HEAD - 1, no mesmo ritmo linear do pathLength
          acima, então ela fica sempre colada na ponta do feixe. */}
      <motion.rect
        width="100%"
        height="100%"
        rx={CARD_RADIUS}
        fill="transparent"
        stroke="#f0fdfa"
        strokeWidth={3.5}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${BEAM_HEAD} ${1 - BEAM_HEAD}`}
        style={{ filter: "drop-shadow(0 0 6px #5eead4) drop-shadow(0 0 14px #2dd4bf)" }}
        initial={{ strokeDashoffset: BEAM_HEAD, opacity: 0 }}
        animate={
          active
            ? { strokeDashoffset: BEAM_HEAD - 1, opacity: 1 }
            : { strokeDashoffset: BEAM_HEAD, opacity: 0 }
        }
        transition={
          active
            ? { strokeDashoffset: draw, opacity: { duration: 0.2 } }
            : { duration: 0.2 }
        }
      />
    </svg>
  );
}

export function ProjectCard({
  project,
  index,
  onExpand,
}: {
  project: Project;
  index: number;
  onExpand: () => void;
}) {
  const stacks = project.stacks ?? [];
  const hiddenStacks = stacks.length - MAX_VISIBLE_STACKS;
  const detailsHref = project.id ? `/project/${project.id}` : null;
  const hasVideo = Boolean(project.isFeatured && project.videoUrl);

  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Sem `root`: o IntersectionObserver usa o viewport, mas leva em conta o
  // recorte de qualquer ancestral com overflow. Por isso o mesmo card pausa
  // ao sair da tela no modo 2D E ao ser rolado para fora do painel de vidro
  // no hub 3D, sem precisar saber onde está montado.
  const isInView = useInView(cardRef, { amount: 0.5 });

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
  };

  const handleMouseEnter = () => {
    clearHoverTimer();
    setIsHovering(true);
    hoverTimerRef.current = setTimeout(onExpand, EXPAND_DELAY_MS);
  };

  const handleMouseLeave = () => {
    clearHoverTimer();
    setIsHovering(false);
  };

  // Clicar no card navega e desmonta tudo: sem isto o timer do hover
  // dispararia o modal 3s depois, já em outra página.
  useEffect(
    () => () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!hasVideo || !video) return;

    if (isInView) {
      // play() devolve uma Promise que rejeita (AbortError) se um pause()
      // chegar antes de o vídeo começar — rolagem rápida faz isso o tempo
      // todo. É esperado, então não pode virar erro não tratado no console.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isInView, hasVideo]);

  return (
    // O <article> NÃO tem overflow-hidden: quem recorta (cantos, zoom da
    // mídia) é o wrapper interno. Assim o halo do neon, que é filho direto do
    // article, consegue vazar para fora da borda.
    <motion.article
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      layoutId={`card-${project.id}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        opacity: { duration: 0.5, delay: (index % 3) * 0.15 },
        y: { duration: 0.5, delay: (index % 3) * 0.15 },
        layout: { duration: 0.4, delay: 0 },
      }}
      className="group relative flex h-full flex-col rounded-[20px]"
    >
      <NeonBeam active={isHovering} />

      {/* Sem backdrop-blur de propósito: cada card desfocaria o canvas WebGL
          (que muda a cada frame) por conta própria — 6+ passes de blur por
          frame, e dentro do painel do hub seria blur em cima de blur. O fundo
          a 85% já garante a leitura. */}
      <div className="relative flex h-full flex-col overflow-hidden rounded-[inherit] bg-white/85 shadow-xl shadow-neutral-900/5 transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-teal-900/30 dark:bg-[#0F131B]/85 dark:shadow-black/40">
        <div
          aria-hidden
          className="glass-ring pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-70 transition-opacity duration-500 group-hover:opacity-100"
        />

        {/* Mídia "emoldurada": a margem de 8px e o raio próprio fazem a imagem
            parecer uma tela encaixada no vidro, não um topo colado na borda. */}
        <div className="p-2 pb-0">
          <motion.div className="relative aspect-video w-full overflow-hidden rounded-[14px] bg-neutral-100 dark:bg-neutral-900">
            {hasVideo ? (
              <motion.video
                layoutId={`image-${project.id}`}
                ref={videoRef}
                // WebM ou MP4: o navegador decide pelo Content-Type da URL.
                src={project.videoUrl}
                // Sem poster o card fica um retângulo vazio até o 1º frame.
                poster={project.thumbnail || "/fallback-thumb.jpeg"}
                // Só os metadados no load; o vídeo em si baixa quando o card
                // entra em cena e o play() é chamado.
                preload="metadata"
                muted
                loop
                playsInline
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              ></motion.video>
            ) : (
              project.thumbnail && (
                <motion.img
                  layoutId={`image-${project.id}`}
                  src={
                    project.thumbnail
                      ? project.thumbnail
                      : "/fallback-thumb.jpeg"
                  }
                  onError={(e) => {
                    e.currentTarget.src = "/fallback-thumb.jpeg";
                  }}
                  alt={`Preview do projeto ${project.title}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )
            )}

            {/* Vinheta: escurece a base da mídia para os selos lerem sobre
                qualquer imagem, clara ou escura. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/25"
            />

            <span className="absolute top-3 left-3 font-mono text-[11px] tracking-widest text-white/80">
              {String(index + 1).padStart(2, "0")}
            </span>

            {project.isFeatured && (
              <span className="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 font-mono text-[10px] tracking-wider text-white uppercase backdrop-blur-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-teal-400/80" />
                  <span className="relative h-full w-full rounded-full bg-teal-400" />
                </span>
                Destaque
              </span>
            )}
          </motion.div>
        </div>

        <div className="flex grow flex-col p-6 pt-5">
          {/* layout="position": no morph para o modal, o texto só viaja até a
              posição nova. Sem isso o layoutId ESTICA as letras para cobrir a
              diferença de tamanho de fonte entre o card e o modal. */}
          <motion.h3
            layoutId={`title-${project.id}`}
            layout="position"
            className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white"
          >
            {/* "Link esticado": o ::after deste link cobre o card inteiro,
                então clicar em qualquer ponto navega. É o jeito de ter um card
                clicável SEM aninhar <a> dentro de <a> (HTML inválido — os
                botões Código/Deploy são links também): eles só ficam por
                cima, em z-10. */}
            {detailsHref ? (
              <Link
                href={detailsHref}
                className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-[20px] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-teal-500"
              >
                {project.title}
              </Link>
            ) : (
              project.title
            )}
          </motion.h3>
          <motion.p
            layoutId={`desc-${project.id}`}
            layout="position"
            className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400"
          >
            {project.description}
          </motion.p>

          {stacks.length > 0 && (
            <motion.div
              layoutId={`stacks-${project.id}`}
              className="mt-5 mb-5 flex flex-wrap gap-1.5"
            >
              {stacks.slice(0, MAX_VISIBLE_STACKS).map((stack) => (
                <StackChip key={stack} stack={stack} />
              ))}
              {/* O resto aparece no modal e no case study; aqui o "+N" mantém
                  todos os cards da grade com a mesma altura. */}
              {hiddenStacks > 0 && (
                <span className="flex items-center rounded-full border border-dashed border-neutral-300 px-2.5 py-1 font-mono text-[11px] text-neutral-500 dark:border-white/15 dark:text-neutral-400">
                  +{hiddenStacks}
                </span>
              )}
            </motion.div>
          )}

          {/* Duas linhas: três botões lado a lado não cabem com texto legível
              num card de ~290px (a largura dele dentro do painel do hub). */}
          <div className="mt-auto flex flex-col gap-2 border-t border-neutral-200/70 pt-4 dark:border-white/10">
            {(project.repoUrl || project.deployUrl) && (
              <div className="flex items-center gap-2">
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${ACTION_OUTLINE} flex-1`}
                  >
                    <FaGithub className="text-sm" />
                    Código
                  </a>
                )}

                {project.deployUrl && (
                  <a
                    href={project.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${ACTION_BASE} flex-1 bg-teal-600 text-white hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25`}
                  >
                    <FaArrowUpRightFromSquare className="text-xs" />
                    Deploy
                  </a>
                )}
              </div>
            )}

            {detailsHref && (
              <Link
                href={detailsHref}
                className={`${ACTION_OUTLINE} group/details`}
              >
                Detalhes
                <FaArrowRight className="text-xs transition-transform duration-200 group-hover/details:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
