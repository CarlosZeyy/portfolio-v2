"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FaGithub, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { Project } from "@/lib/projectSchema";
import { stackIcons } from "@/lib/stackIcons";

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

  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const isInView = useInView(cardRef, { amount: 0.5 });

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    setIsHovering(true);

    hoverTimerRef.current = setTimeout(() => {
      onExpand();
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsHovering(false);
  };

  useEffect(() => {
    if (!project.isFeatured || !videoRef.current) return;

    if (isInView) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isInView, project.isFeatured]);

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
            isHovering ? { duration: 3, ease: "linear" } : { duration: 0.3 }
          }
        ></motion.rect>
      </svg>
      <motion.div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        {project.isFeatured && project.videoUrl ? (
          <motion.video
            layoutId={`image-${project.id}`}
            ref={videoRef}
            src={project.videoUrl}
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
          {project.title}
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

        <div className="mt-auto flex items-center gap-2 border-t border-neutral-200/70 pt-4 dark:border-neutral-800">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-white/5"
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
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25"
            >
              <FaArrowUpRightFromSquare className="text-xs" />
              Deploy
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
