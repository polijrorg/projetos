"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TriangleAlert,
  ArrowLeft,
  Clock,
  PauseCircle,
  Star,
  TrendingUp,
  Target,
  CheckCircle2,
  Snowflake,
  Link,
} from "lucide-react";
import { ProjectComplete} from "@/types";
import { useState, useTransition } from "react";
import { ProjectStatusModal } from "./projectStatusModal";
import { ca } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getStatusVariant } from "@/utils/projects/ui-helpers";



type Props = {
  project: ProjectComplete;
  onBack: () => void;
};

const getStatusIcon = (status: ProjectComplete["status"]) => {
  switch (status) {
    case "Crítica":
      return <TriangleAlert className="h-4 w-4" />;
    case "Ruim":
      return <TrendingUp className="h-4 w-4" />;
    case "Normal":
      return <Clock className="h-4 w-4" />;
    case "Possível ENB":
      return <Star className="h-4 w-4" />;
    case "Congelado":
      return <Snowflake className="h-4 w-4" />;
      case "Finalizado":
      return <CheckCircle2 className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};


export default function Header({ project, onBack }: Props) {

    type Replace<T, R> = Omit<T, keyof R> & R;
    type ProjectAnalyst = Omit<ProjectComplete['analysts'][number], 'projectId'>;

    type Project = Replace<ProjectComplete, {
      analysts: ProjectAnalyst[];
    }>;

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const handleChangeStatus = () => setIsStatusModalOpen(true);
    const [projectData, setProjectData] = useState<ProjectComplete>(project);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const handleStatusChange = async (newStatus: ProjectComplete["status"]) => {
    setProjectData(prev => ({ ...prev, status: newStatus }));
    // Otimista: atualiza UI antes de bater na API (se você tiver setProject)
    // setProject(p => p ? { ...p, status: newStatus } as Project : p);
      try {
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      setProjectData(prev => ({ ...prev, status: project.status }));
      throw new Error(`Falha ao atualizar status (${res.status})`);
    }



    const updatedProject = await res.json();
    setProjectData(updatedProject);
    setIsStatusModalOpen(false);
    toast.success("Status atualizado!");

    startTransition(() => {
      router.refresh(); // atualiza dados da página sem reload completo
    });
  } catch (err: unknown) {
    // Se usou UI otimista acima, opcional: desfazer
    // setProject(p => p ? { ...p, status: project.status } as Project : p);

    
    const msg = err instanceof Error ? err.message : "Erro ao atualizar status";
    toast.error(msg);
  }
}

  return (
    <div className="border-b bg-card">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-4 pt-7">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer hover:[background-image:var(--gradient-primary)] hover:text-white hover:border-transparent transition-colors"
            onClick={() => router.push("/projects")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

        </div>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            </div>

            <p className="text-lg text-muted-foreground mb-4">{project.client}</p>

            <div className="flex items-center gap-4 mb-4">
              <Badge
                variant={getStatusVariant(projectData.status)}
                className="flex items-center gap-1"
              >
                {getStatusIcon(projectData.status)}
                {projectData.status}
              </Badge>
            </div>

            <p className=" pb-3 text-muted-foreground">{project.shortDescription}</p>

            <Button 
                variant="hero" 
                size="sm"
                className="cursor-pointer hover:[background-image:var(--gradient-primary)] hover:text-white hover:border-transparent transition-colors"
                onClick={handleChangeStatus}
                disabled={isPending}
                aria-disabled={isPending}
                >

                <Target className="h-4 w-4 mr-2" />
                {isPending ? "Atualizando..." : "Alterar Status"}
         </Button>
          </div>

          {project.coverImage && (
            <div className="w-full lg:w-64 h-48 bg-muted rounded-lg overflow-hidden">
              <img
                src={project.coverImage}
                alt={`Imagem do projeto`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
        <ProjectStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={projectData.status}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
