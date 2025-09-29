"use client";

import { useEffect, useState, useCallback } from "react";
import PageTop from "./pagetop";
import { ProjectCreateModal } from "@/app/(frontend)/(session)/projects/ProjectCreateModal";
import ProjectsGrid from "./projects-grid";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Busca projetos da API
  const fetchProjects = useCallback(async (): Promise<Project[]> => {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch("/api/projects", {
        method: "GET",
        cache: "no-store",
        // Se precisar enviar cookies/session:
        // credentials: "include",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Falha ao carregar projetos (status ${res.status})`);
      }

      const data: Project[] = await res.json();
      setProjects(data);
      return data;
    } catch (err: any) {
      console.error("Erro ao buscar projetos:", err);
      setError(err?.message ?? "Erro ao buscar projetos");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carrega ao montar
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = () => {
    setIsCreateModalOpen(true);
  };

  // Depois de criar um projeto, recarrega da API
  const handleProjectCreated = async () => {
    await fetchProjects();
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

        {loading && (
          <p className="text-sm text-muted-foreground">Carregando projetos…</p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        {!loading && !error && (
          <ProjectsGrid
            loadProjects={fetchProjects} 
            onSelect={(p: Project) => console.log(p)}
            projects={projects}
          />
        )}
      </div>
    </div>
  );
}
