"use client";

import { motion } from "framer-motion";
import { FaGithub, FaArrowUpRightFromSquare, FaPlay } from "react-icons/fa6";
import { Project } from "@/lib/projectSchema";
import { stackIcons } from "@/lib/stackIcons";

export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const stacks = project.stacks ?? [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 1.5 + index * 0.75 }}
      className="group flex flex-col h-full overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/80 shadow-xl shadow-neutral-900/5 backdrop-blur-xl transition-colors duration-400 hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-900/10 dark:border-neutral-800 dark:bg-[#131720]/80 dark:shadow-black/40"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        {project.thumbnail && (
          <img
            src={project.thumbnail || "/fallback-thumb.jpeg"}
            onError={(e) => {
              e.currentTarget.src = "/fallback-thumb.jpeg";
            }}
            alt={`Preview do projeto ${project.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <div className="p-6 flex flex-col grow">
        <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
          {project.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm font-light text-neutral-500 dark:text-neutral-400">
          {project.description}
        </p>

        {stacks.length > 0 && (
          <div className="mt-4 mb-4 flex flex-wrap gap-1.5">
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
          </div>
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
              Ver projeto
            </a>
          )}

          {project.videoUrl && (
            <a
              href={project.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver demonstração em vídeo"
              className="flex items-center justify-center rounded-lg border border-neutral-200 p-2 text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-white/5"
            >
              <FaPlay className="text-xs" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
