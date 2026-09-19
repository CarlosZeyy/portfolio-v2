"use client";

import { Project } from "@/lib/projectSchema";
import { slugify } from "@/lib/formats";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { motion, type Variants } from "framer-motion";
import { useEffect, useRef } from "react";
import { FaArrowRight, FaArrowUpRightFromSquare, FaGithub } from "react-icons/fa6";
import { LuX } from "react-icons/lu";
import Link from "next/link";
import { StackChip } from "./StackChip";
import { useTranslation } from "react-i18next";

// Só o que NÃO é elemento compartilhado entra com fade: o que tem layoutId
// (card, mídia, título, descrição, stacks) já chega "voando" do card.
const extrasVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (order: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.25 + order * 0.08, ease: EASE_OUT_EXPO },
  }),
};

const SECONDARY_ACTION =
  "flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400/40 hover:bg-white/10";

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const stacks = project.stacks ?? [];
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    // Trava a rolagem da página por baixo da vitrine e devolve o valor antigo.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-999 flex items-center justify-center overflow-y-auto bg-[#05070B]/80 p-4 backdrop-blur-xl sm:p-8"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Auroras do fundo: a vitrine "acende" o ambiente em volta dela. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(45%_40%_at_20%_15%,rgb(20_184_166/0.16),transparent_70%),radial-gradient(50%_45%_at_85%_90%,rgb(139_92_246/0.2),transparent_70%)]"
      />

      <motion.div
        layoutId={`card-${project.id}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${project.id}`}
        className="relative my-auto w-full max-w-6xl rounded-[28px] bg-[#0B0E14]/95 shadow-[0_40px_120px_-20px_rgb(0_0_0/0.9),0_0_80px_-30px_rgb(45_212_191/0.35)]"
        onClick={(e) => e.stopPropagation()}
        transition={{ layout: { duration: 0.45, ease: EASE_OUT_EXPO } }}
      >
        <div
          aria-hidden
          className="glass-ring pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
        />

        <motion.button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t("projects.close")}
          variants={extrasVariants}
          custom={0}
          initial="hidden"
          animate="visible"
          className="group absolute top-4 right-4 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/50 text-neutral-300 outline-none backdrop-blur-md transition-colors hover:border-teal-400/50 hover:text-teal-300 focus-visible:border-teal-400/50"
        >
          <LuX className="transition-transform duration-500 group-hover:rotate-90" />
        </motion.button>

        {/* Mídia à esquerda (o palco), ficha do projeto à direita. No celular
            empilha. A mídia mantém 16:9 como no card, então o morph do
            layoutId só escala — não distorce a imagem no caminho. */}
        <div className="grid grid-cols-1 gap-2 p-2 lg:grid-cols-12 lg:items-center">
          <div className="relative lg:col-span-7">
            <div className="relative aspect-video w-full overflow-hidden rounded-[22px] bg-neutral-900">
              {project.videoUrl ? (
                <motion.video
                  layoutId={`image-${project.id}`}
                  src={project.videoUrl}
                  poster={project.thumbnail || "/fallback-thumb.jpeg"}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="h-full w-full object-cover"
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
                    alt={t("projects.previewAlt", { title: project.title })}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),inset_0_-80px_80px_-40px_rgb(0_0_0/0.6)]"
              />
            </div>
          </div>

          <div className="flex flex-col p-6 sm:p-8 lg:col-span-5 lg:self-stretch lg:py-8">
            <motion.p
              variants={extrasVariants}
              custom={0}
              initial="hidden"
              animate="visible"
              className="font-mono text-xs tracking-wide text-teal-400"
            >
              {t("paths.projects")}/{slugify(project.title)}
            </motion.p>

            <motion.h2
              id={`modal-title-${project.id}`}
              layoutId={`title-${project.id}`}
              layout="position"
              className="mt-3 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl"
            >
              {project.title}
            </motion.h2>

            <motion.p
              layoutId={`desc-${project.id}`}
              layout="position"
              className="mt-4 leading-relaxed text-neutral-300"
            >
              {project.description}
            </motion.p>

            {stacks.length > 0 && (
              <>
                <motion.p
                  variants={extrasVariants}
                  custom={1}
                  initial="hidden"
                  animate="visible"
                  className="mt-7 font-mono text-[11px] tracking-widest text-neutral-500 uppercase"
                >
                  {t("projects.stack")}
                </motion.p>
                <motion.div
                  layoutId={`stacks-${project.id}`}
                  className="mt-3 flex flex-wrap gap-2"
                >
                  {stacks.map((stack) => (
                    <StackChip key={stack} stack={stack} size="md" />
                  ))}
                </motion.div>
              </>
            )}

            <motion.div
              variants={extrasVariants}
              custom={2}
              initial="hidden"
              animate="visible"
              className="mt-auto flex flex-col gap-2 pt-8"
            >
              <Link
                href={`/project/${project.id}`}
                className="group/cta flex items-center justify-between gap-3 rounded-xl bg-teal-600 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/30 active:translate-y-0"
              >
                <motion.span layoutId={`proj-${project.id}`}>
                  {t("projects.caseStudy")}
                </motion.span>
                <FaArrowRight className="transition-transform duration-300 group-hover/cta:translate-x-1" />
              </Link>

              {(project.repoUrl || project.deployUrl) && (
                <div className="flex gap-2">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${SECONDARY_ACTION} flex-1`}
                    >
                      <FaGithub /> {t("projects.code")}
                    </a>
                  )}
                  {project.deployUrl && (
                    <a
                      href={project.deployUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${SECONDARY_ACTION} flex-1`}
                    >
                      <FaArrowUpRightFromSquare className="text-xs" /> {t("projects.deploy")}
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
