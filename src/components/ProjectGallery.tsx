"use client";

import { AnimatePresence } from "framer-motion";
import { Project } from "@/lib/projectSchema";
import { useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

interface ProjectGalleryProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectGalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedProject = projects.find((project) => project.id === selectedId);
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>

      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          index={index}
          onExpand={() => setSelectedId(project.id as string)}
        />
      ))}
    </div>
  );
}
