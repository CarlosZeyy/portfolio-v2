"use client";

import { Project } from "@/lib/projectSchema";
import { stackIcons } from "@/lib/stackIcons";
import { SpaceBackground } from "@/components/SpaceBackground";
import Link from "next/link";
import { BiArrowBack } from "react-icons/bi";
import { FaGithub, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProjectClient({ project }: { project: Project }) {
  const stacks = project.stacks ?? [];
  const gallery = project.galleryUrls ?? [];
  const caseStudy = [
    {
      key: "problema",
      title: "O Problema",
      content: project.problemDescription,
    },
    {
      key: "solução",
      title: "A Solução",
      content: project.solutionDescription,
    },
    {
      key: "desafios",
      title: "Desafios Técnicos",
      content: project.technicalChallenges,
    },
  ].filter((section) => section.content);

  const [activeImg, setActiveImg] = useState(gallery[0]);

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      <SpaceBackground />
      <div className="pointer-events-none absolute -left-24 -top-16 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-64 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 pb-24">
        <Link
          href="/#projects"
          className="group inline-flex w-fit items-center gap-2 py-10 text-sm font-medium text-neutral-400 transition-colors hover:text-teal-400"
        >
          <BiArrowBack className="transition-transform duration-200 group-hover:-translate-x-1" />
          Voltar aos projetos
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <p className="font-mono text-xs uppercase tracking-wide text-teal-500">
            ~/projetos/{slugify(project.title)}
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {project.title}
          </h1>

          {project.description && (
            <p className="max-w-2xl text-lg font-light leading-relaxed text-neutral-400 md:text-xl">
              {project.description}
            </p>
          )}

          {stacks.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-xl">
              {stacks.map((stack) => {
                const stackData = stackIcons[stack];
                const ComponentIcon = stackData?.icon;
                const ComponentBg = stackData.bg;

                return (
                  <span
                    key={stack}
                    style={{ backgroundColor: ComponentBg }}
                    className="flex shrink-0 items-center gap-1.5  whitespace-nowrap rounded-full border border-neutral-800 bg-white/5 px-2.5 py-1 font-mono font-medium text-neutral-300 backdrop-blur-xl transition-colors hover:bg-white/10"
                  >
                    {ComponentIcon && (
                      <ComponentIcon className="text-xl opacity-70" />
                    )}
                    {stack}
                  </span>
                );
              })}
            </div>
          )}

          {(project.repoUrl || project.deployUrl) && (
            <div className="flex flex-wrap gap-3 pt-2">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-white/5 px-5 py-3 text-sm font-medium text-neutral-200 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-700 hover:bg-white/10"
                >
                  <FaGithub /> Código-fonte
                </a>
              )}

              {project.deployUrl && (
                <a
                  href={project.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
                >
                  <FaArrowUpRightFromSquare className="text-xs" /> Ver deploy
                </a>
              )}
            </div>
          )}
        </motion.header>

        {(project.videoUrl || project.thumbnail) && (
          <div
            className="animate-fade-in-up mt-12 aspect-video w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/40"
            style={{ animationDelay: "0.1s" }}
          >
            {project.videoUrl ? (
              <video
                src={project.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                poster={project.thumbnail || undefined}
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={project.thumbnail || "/fallback-thumb.jpeg"}
                alt={`Preview do projeto ${project.title}`}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        )}

        {caseStudy.length > 0 && (
          <div className="mt-16 flex flex-col">
            {caseStudy.map((section, index) => (
              <div
                key={section.key}
                className="relative pb-10 pl-8 last:pb-0 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-neutral-800 last:before:hidden hover:before:bg-teal-500/60"
              >
                <span className="absolute left-[-4.5px] top-2 h-2.5 w-2.5 rounded-full bg-teal-500 shadow-[0_0_0_4px_rgba(20,184,166,0.15)]" />

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-2xl border border-neutral-800 bg-white/5 p-8 shadow-xl backdrop-blur-md"
                >
                  <p className="font-mono text-xs text-teal-500">
                    {section.key}:
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">
                    {section.title}
                  </h2>
                  <p className="mt-4 text-lg font-light leading-relaxed text-neutral-400">
                    {section.content}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        )}

        {gallery.length > 0 && (
          <div
            className="animate-fade-in-up mt-16"
            style={{ animationDelay: "0.2s" }}
          >
            <p className="font-mono text-xs uppercase tracking-wide text-neutral-500">
              ~/galeria
            </p>

            <div className="aspect-video w-full mt-5">
              <AnimatePresence mode="wait">
                <motion.img
                  src={activeImg}
                  key={activeImg}
                  alt=""
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </AnimatePresence>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {gallery.map((url) => (
                <div
                  onClick={() => setActiveImg(url)}
                  key={url}
                  className={`group aspect-square overflow-hidden rounded-xl cursor-pointer border border-neutral-800 bg-neutral-900 ${url === activeImg ? "border-teal-500 opacity-100" : "border-neutral-800 opacity-70 hover:opacity-100"}`}
                >
                  <img
                    src={url}
                    alt={`Imagem da galeria de ${project.title}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
