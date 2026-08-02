"use client";

import { Project } from "@/lib/projectSchema";
import { stackIcons } from "@/lib/stackIcons";
import { motion } from "framer-motion";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { FaArrowDown } from "react-icons/fa";

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-999 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        layoutId={`card-${project.id}`}
        className="w-full max-w-4xl bg-neutral-900 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        transition={{layout: {duration: 0.3, ease: 'easeInOut'}}}
      >
        <motion.h2
          layoutId={`title-${project.id}`}
          className="text-2xl font-semibold flex justify-center mt-5"
        >
          {project.title}
        </motion.h2>
        <motion.div className="relative p-10 pb-0 w-full h-100 sm:h-125 overflow-hidden">
          {project.videoUrl ? (
            <motion.video
              layoutId={`image-${project.id}`}
              src={project.videoUrl}
              muted
              loop
              playsInline
              autoPlay
              className="h-full w-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
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
                className="h-full w-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
              />
            )
          )}
        </motion.div>

        <motion.div className="mx-10 my-5">
          {project.stacks.length > 0 && (
            <motion.div
              layoutId={`stacks-${project.id}`}
              className="mt-4 mb-4 flex flex-wrap gap-3"
            >
              {project.stacks.map((stack) => {
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

          <motion.p layoutId={`desc-${project.id}`}>
            {project.description}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.p className="mx-10 text-xs font-light flex items-center gap-2">
            Deseja ver mais detalhes sobre o projeto? <FaArrowDown />
          </motion.p>
          <motion.div className="cursor-pointer rounded-lg bg-teal-600 py-3 mx-10 my-3 flex flex-row gap-3 justify-center items-center text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0">
            <motion.button
              className="cursor-pointer"
              layoutId={`proj-${project.id}`}
            >
              Ver detalhes do Projeto
            </motion.button>
            <FaArrowUpRightFromSquare />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
