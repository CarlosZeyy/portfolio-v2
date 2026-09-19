"use client";

import { AnimatePresence } from "framer-motion";
import { Project } from "@/lib/projectSchema";
import { useCallback, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

interface ProjectGalleryProps {
  projects: Project[];
}

// false no servidor e na hidratação, true depois: portais não existem no SSR.
const subscribeToNothing = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

export function ProjectList({ projects }: ProjectGalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedProject = projects.find((project) => project.id === selectedId);
  const isClient = useIsClient();
  // Referência estável: o modal registra Esc/trava de scroll num efeito que
  // depende do onClose, e uma arrow nova a cada render o refaria à toa.
  const closeModal = useCallback(() => setSelectedId(null), []);

  return (
    // @container: as colunas respondem à largura de ONDE a lista está, não à
    // da janela. A mesma lista vive na página 2D (~1100px -> 3 colunas) e no
    // painel de vidro do hub 3D (~600px -> 2 colunas); com md:/lg: o painel
    // herdaria as 3 colunas do viewport, espremidas em 190px cada.
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @xl:grid-cols-2 @4xl:grid-cols-3">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            onExpand={() => setSelectedId(project.id as string)}
          />
        ))}
      </div>

      {/* Portal para o <body>: o modal é position: fixed, mas o painel do hub
          tem backdrop-filter e transform, e ambos viram o containing block de
          descendentes fixed — sem o portal o modal abriria preso dentro do
          vidro. O layoutId continua animando normalmente através do portal. */}
      {isClient &&
        createPortal(
          <AnimatePresence>
            {selectedProject && (
              <ProjectModal
                project={selectedProject}
                onClose={closeModal}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
