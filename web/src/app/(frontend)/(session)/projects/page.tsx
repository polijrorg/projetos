"use client";

import { useState } from "react";
import PageTop from "./pagetop"; 
import { ProjectCreateModal } from "@/components/modals/ProjectCreateModal";
import { loadProjects } from "@/utils/storage";
import ProjectsGrid from "./projects-grid";
import { Project } from "@/types";

export default function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState(() => loadProjects());

  const handleCreateProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleProjectCreated = () => {
    setProjects(loadProjects());
  };

  return (
    <div className="min-h-screen bg-background p-20">
      <div className="max-w-7xl mx-auto">
        <PageTop onNewProject={handleCreateProject} />
      </div>

      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Projetos</h1>
        <ProjectsGrid loadProjects={loadProjects} onSelect={(p) => console.log(p)} projects={projects} />
      </div>

      
    </div>

    
  );
}
