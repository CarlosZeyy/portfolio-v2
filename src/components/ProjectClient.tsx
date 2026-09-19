"use client";

import { Project } from "@/lib/projectSchema";
import { SpaceBackground } from "@/components/SpaceBackground";
import { slugify } from "@/lib/formats";
import { EASE_OUT_EXPO, fadeUp, revealOnce, staggerContainer } from "@/lib/motion";
import Link from "next/link";
import { BiArrowBack } from "react-icons/bi";
import { FaGithub, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  type Variants,
} from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { GlassPanel } from "./GlassPanel";
import { ProjectStage } from "./ProjectStage";
import { StackChip } from "./StackChip";
import { useLocalizedProject } from "@/i18n/useLocalizedProject";
import { useTranslation } from "react-i18next";

// Título: cada palavra sobe de trás de uma máscara (overflow-hidden), em
// cascata. É a mesma revelação do menu — a assinatura de entrada do site.
const wordVariants: Variants = {
  hidden: { y: "110%", rotate: 3 },
  visible: {
    y: "0%",
    rotate: 0,
    transition: { duration: 1, ease: EASE_OUT_EXPO },
  },
};

const pad = (value: number) => String(value).padStart(2, "0");

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useTranslation();

  const step = useCallback(
    (direction: 1 | -1) =>
      setActiveIndex(
        (current) => (current + direction + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step]);

  return (
    <motion.section className="mt-24" variants={staggerContainer()} {...revealOnce}>
      <motion.div variants={fadeUp} className="flex items-end justify-between gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-teal-400">
            {t("paths.gallery")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t("projects.gallery.title")}
          </h2>
        </div>
        <p className="font-mono text-sm text-neutral-400">
          <span className="text-white">{pad(activeIndex + 1)}</span> /{" "}
          {pad(images.length)}
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="group/stage relative mt-8 aspect-video w-full overflow-hidden rounded-3xl bg-neutral-950 shadow-2xl shadow-black/50"
      >
        {/* Sem mode="wait": a imagem que sai e a que entra ficam empilhadas
            (absolute) e animam AO MESMO TEMPO. É um crossfade de verdade — com
            "wait" a tela ficava vazia entre uma foto e outra. */}
        <AnimatePresence initial={false}>
          <motion.img
            key={images[activeIndex]}
            src={images[activeIndex]}
            alt={t("projects.gallery.alt", {
              title,
              index: activeIndex + 1,
              total: images.length,
            })}
            initial={{ opacity: 0, scale: 1.06, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div
          aria-hidden
          className="glass-ring pointer-events-none absolute inset-0 rounded-[inherit]"
        />

        {images.length > 1 &&
          ([-1, 1] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => step(direction)}
              aria-label={t(
                direction === 1
                  ? "projects.gallery.next"
                  : "projects.gallery.previous",
              )}
              className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-all duration-300 hover:border-teal-400/60 hover:text-teal-300 focus-visible:opacity-100 sm:opacity-0 sm:group-hover/stage:opacity-100 ${
                direction === 1 ? "right-4" : "left-4"
              }`}
            >
              {direction === 1 ? <LuChevronRight /> : <LuChevronLeft />}
            </button>
          ))}
      </motion.div>

      {images.length > 1 && (
        <motion.div
          variants={fadeUp}
          className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6"
        >
          {images.map((url, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={url}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={t("projects.gallery.view", { index: index + 1 })}
                aria-current={isActive}
                className="group/thumb relative aspect-4/3 cursor-pointer overflow-hidden rounded-xl bg-neutral-900 outline-none"
              >
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  className={`h-full w-full object-cover transition-all duration-500 group-hover/thumb:scale-110 group-hover/thumb:opacity-100 group-hover/thumb:saturate-100 group-focus-visible/thumb:opacity-100 ${
                    isActive ? "opacity-100" : "opacity-45 saturate-50"
                  }`}
                />
                {/* O anel da miniatura ativa é UM elemento com layoutId: ao
                    trocar de foto ele desliza de uma miniatura para a outra,
                    em vez de apagar aqui e acender ali. */}
                {isActive ? (
                  <motion.span
                    layoutId="gallery-active-ring"
                    transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                    className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_2px_#2dd4bf,0_0_20px_rgb(45_212_191/0.35)]"
                  />
                ) : (
                  <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)] transition-shadow duration-300 group-hover/thumb:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.35)]" />
                )}
              </button>
            );
          })}
        </motion.div>
      )}
    </motion.section>
  );
}

export default function ProjectClient({
  project: rawProject,
}: {
  project: Project;
}) {
  const project = useLocalizedProject(rawProject);
  const stacks = project.stacks ?? [];
  const gallery = project.galleryUrls ?? [];
  const { t } = useTranslation();
  // `id` é a chave estável (React key + ramo do dicionário); o rótulo exibido
  // vem de projects.narrative.<id>. O TEXTO de cada capítulo vem do banco, já
  // no idioma ativo quando existe tradução (useLocalizedProject).
  const caseStudy = (
    [
      { id: "problem", content: project.problemDescription },
      { id: "solution", content: project.solutionDescription },
      { id: "challenges", content: project.technicalChallenges },
    ] as const
  ).filter((section) => section.content);

  // Barra de progresso de leitura no topo (a mola tira o tremor do scroll).
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      <SpaceBackground hub={false} />

      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-linear-to-r from-teal-400 to-violet-500"
      />

      <div className="relative mx-auto max-w-5xl px-6 pb-32">
        <Link
          href="/#projects"
          className="group inline-flex w-fit items-center gap-2 py-10 text-sm font-medium text-neutral-400 transition-colors hover:text-teal-400"
        >
          <BiArrowBack className="transition-transform duration-200 group-hover:-translate-x-1" />
          {t("projects.back")}
        </Link>

        <motion.header
          variants={staggerContainer(0.09, 0.1)}
          initial="hidden"
          animate="visible"
          className="relative flex flex-col pt-6 sm:pt-14"
        >
          {/* Véu: um degradê radial escuro e desfocado atrás do cabeçalho. O
              hero fica solto sobre a nébula (sem caixa), mas o texto ganha um
              fundo que não depende de onde a faixa clara da galáxia está. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-16 -inset-y-10 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_30%_55%,rgb(11_14_20/0.9),transparent_75%)] blur-2xl"
          />
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs uppercase tracking-wide text-teal-400"
          >
            {t("paths.projects")}/{slugify(project.title)}
          </motion.p>

          {/* aria-label: leitores de tela leem o título inteiro, não palavra
              por palavra (cada uma vive num span próprio por causa da máscara). */}
          <h1
            aria-label={project.title}
            className="mt-5 text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.95] font-semibold tracking-tighter text-balance text-white"
          >
            {project.title.split(" ").map((word, index) => (
              <span
                key={index}
                aria-hidden
                className="mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-bottom"
              >
                <motion.span variants={wordVariants} className="inline-block origin-left">
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          {project.description && (
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300 md:text-xl"
            >
              {project.description}
            </motion.p>
          )}

          {stacks.length > 0 && (
            <motion.div
              variants={staggerContainer(0.04)}
              className="mt-8 flex flex-wrap gap-2"
            >
              {stacks.map((stack) => (
                <motion.div key={stack} variants={fadeUp}>
                  <StackChip stack={stack} size="md" />
                </motion.div>
              ))}
            </motion.div>
          )}

          {(project.repoUrl || project.deployUrl) && (
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              {project.deployUrl && (
                <a
                  href={project.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
                >
                  <FaArrowUpRightFromSquare className="text-xs" />{" "}
                  {t("projects.viewDeploy")}
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0E14]/60 px-5 py-3 text-sm font-medium text-neutral-200 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400/40 hover:bg-white/10"
                >
                  <FaGithub /> {t("projects.sourceCode")}
                </a>
              )}
            </motion.div>
          )}
        </motion.header>

        {/* Palco da mídia: play/pause + seletor Desktop / Mobile (ProjectStage). */}
        {(project.videoUrl || project.videoMobileUrl || project.thumbnail) && (
          <ProjectStage project={project} />
        )}

        {caseStudy.length > 0 && (
          // Uma única "folha" de vidro para a narrativa inteira: texto corrido
          // solto sobre a nébula não tem contraste, e um card por capítulo
          // viraria uma pilha de caixas. Dentro dela o layout é de revista:
          // numeral e título fixos (sticky) à esquerda, texto à direita.
          <GlassPanel className="mt-24" contentClassName="px-6 sm:px-12" spotlight={false}>
            {caseStudy.map((section, index) => (
              <motion.article
                key={section.id}
                variants={staggerContainer(0.1)}
                {...revealOnce}
                className="grid grid-cols-1 gap-6 border-b border-white/10 py-12 last:border-b-0 sm:py-16 lg:grid-cols-12 lg:gap-12"
              >
                <motion.div variants={fadeUp} className="lg:col-span-4">
                  <div className="lg:sticky lg:top-24">
                    <span className="block bg-linear-to-b from-teal-300 to-violet-500/40 bg-clip-text font-mono text-6xl leading-none font-light text-transparent sm:text-7xl">
                      {pad(index + 1)}
                    </span>
                    <p className="mt-5 font-mono text-xs text-teal-400">
                      {t(`projects.narrative.${section.id}.key`)}:
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {t(`projects.narrative.${section.id}.title`)}
                    </h2>
                  </div>
                </motion.div>

                {/* whitespace-pre-line respeita as quebras de parágrafo que
                    você digita no textarea do admin. A primeira linha em
                    destaque é o "lead" de artigo. */}
                <motion.p
                  variants={fadeUp}
                  className="text-lg leading-[1.8] whitespace-pre-line text-neutral-300 first-line:text-xl first-line:font-medium first-line:text-white lg:col-span-8"
                >
                  {section.content}
                </motion.p>
              </motion.article>
            ))}
          </GlassPanel>
        )}

        {gallery.length > 0 && <Gallery images={gallery} title={project.title} />}

        <motion.footer
          variants={fadeUp}
          {...revealOnce}
          className="mt-24 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-10 sm:flex-row sm:items-center"
        >
          <p className="text-2xl font-semibold tracking-tight text-white">
            {t("projects.liked")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/#contact"
              className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25"
            >
              {t("projects.letsTalk")}
            </Link>
            <Link
              href="/#projects"
              className="rounded-xl border border-white/10 bg-[#0B0E14]/60 px-5 py-3 text-sm font-medium text-neutral-200 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400/40"
            >
              {t("projects.otherProjects")}
            </Link>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
