"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  FaGithub,
  FaArrowUpRightFromSquare,
  FaArrowRight,
} from "react-icons/fa6";
import { Project } from "@/lib/projectSchema";
import { stackIcons } from "@/lib/stackIcons";

const EXPAND_DELAY_MS = 3000;

// Os botões do rodapé ficam ACIMA do link esticado do título (ver abaixo).
const ACTION_BASE =
  "relative z-10 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5";
const ACTION_OUTLINE = `${ACTION_BASE} border border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-white/5`;

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
    <motion.article
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      layoutId={`card-${project.id}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        opacity: { duration: 0.5, delay: (index % 3) * 0.25 },
        y: { duration: 0.5, delay: (index % 3) * 0.25 },
        layout: { duration: 0.4, delay: 0 },
      }}
      className="group flex flex-col h-full relative overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/80 shadow-xl shadow-neutral-900/5 backdrop-blur-xl transition-colors duration-400 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-900/30 dark:border-neutral-800 dark:bg-[#131720]/80 dark:shadow-black/40"
    >
      <svg className="absolute inset-0 w-full h-full z-50 pointer-events-none">
        <motion.rect
          width={"100%"}
          height={"100%"}
          fill={"transparent"}
          rx={16}
          stroke={"#14b8a6"}
          strokeWidth={4}
          initial={{ pathLength: 0 }}
          animate={isHovering ? { pathLength: 1 } : { pathLength: 0 }}
          transition={
            isHovering
              ? { duration: EXPAND_DELAY_MS / 1000, ease: "linear" }
              : { duration: 0.3 }
          }
        ></motion.rect>
      </svg>
      <motion.div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        {hasVideo ? (
          <motion.video
            layoutId={`image-${project.id}`}
            ref={videoRef}
            // WebM ou MP4: o navegador decide pelo Content-Type da URL.
            src={project.videoUrl}
            // Sem poster o card fica um retângulo vazio até o 1º frame chegar.
            poster={project.thumbnail || "/fallback-thumb.jpeg"}
            // Só os metadados no load; o vídeo em si baixa quando o card
            // entra em cena e o play() é chamado.
            preload="metadata"
            muted
            loop
            playsInline
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          ></motion.video>
        ) : (
          project.thumbnail && (
            <motion.img
              layoutId={`image-${project.id}`}
              src={
                project.thumbnail ? project.thumbnail : "/fallback-thumb.jpeg"
              }
              onError={(e) => {
                e.currentTarget.src = "/fallback-thumb.jpeg";
              }}
              alt={`Preview do projeto ${project.title}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )
        )}
      </motion.div>

      <div className="p-6 flex flex-col grow">
        <motion.h3
          layoutId={`title-${project.id}`}
          className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white"
        >
          {/* "Link esticado": o ::after deste link cobre o card inteiro, então
              clicar em qualquer ponto navega. É o jeito de ter um card
              clicável SEM aninhar <a> dentro de <a> (HTML inválido — os botões
              Código/Deploy são links também): eles só ficam por cima, em z-10. */}
          {detailsHref ? (
            <Link
              href={detailsHref}
              className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-teal-500"
            >
              {project.title}
            </Link>
          ) : (
            project.title
          )}
        </motion.h3>
        <motion.p
          layoutId={`desc-${project.id}`}
          className="mt-1.5 line-clamp-2 text-sm font-light text-neutral-500 dark:text-neutral-400"
        >
          {project.description}
        </motion.p>

        {stacks.length > 0 && (
          <motion.div
            layoutId={`stacks-${project.id}`}
            className="mt-4 mb-4 flex flex-wrap gap-1.5"
          >
            {stacks.map((stack) => {
              const stackData = stackIcons[stack];
              const ComponentIcon = stackData?.icon;

              return (
                <span
                  key={stack}
                  className="flex items-center shrink-0 whitespace-nowrap gap-1.5 rounded-full border border-neutral-200 bg-neutral-100/60 px-2.5 py-1 font-mono text-[11px] font-medium text-neutral-600 transition-colors hover:bg-neutral-200/60 dark:border-neutral-800 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
                >
                  {ComponentIcon && (
                    <ComponentIcon className="text-sm opacity-70" />
                  )}
                  {stack}
                </span>
              );
            })}
          </motion.div>
        )}

        {/* Duas linhas: três botões lado a lado não cabem com texto legível
            num card de ~290px (a largura dele dentro do painel do hub). */}
        <div className="mt-auto flex flex-col gap-2 border-t border-neutral-200/70 pt-4 dark:border-neutral-800">
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
            <Link href={detailsHref} className={`${ACTION_OUTLINE} group/details`}>
              Detalhes
              <FaArrowRight className="text-xs transition-transform duration-200 group-hover/details:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}
