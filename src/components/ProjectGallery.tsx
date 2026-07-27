"use client";

import { Project } from "@/lib/projectSchema";
import { useState } from "react";
import { ProjectCard } from "./ProjectCard";

interface ProjectGalleryProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectGalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} />
      ))}
    </div>
  );
}
