"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TriangleAlert,
  ArrowLeft,
  Clock,
  Snowflake,
  Star,
  TrendingUp,
  Target,
  CheckCircle2,
} from "lucide-react";
import { ProjectComplete } from "@/types";
import { useState, useTransition } from "react";
import { ProjectStatusModal } from "./projectStatusModal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getStatusVariant } from "@/utils/projects/ui-helpers";

type Props = {
  project: ProjectComplete;
  onBack: () => void;
};

const getStatusIcon = (status: ProjectComplete["status"]) => {
  switch (status) {
    case "Crítica": return <TriangleAlert className="h-4 w-4" />;
    case "Ruim": return <TrendingUp className="h-4 w-4" />;
    case "Normal": return <Clock className="h-4 w-4" />;
    case "Possível ENB": return <Star className="h-4 w-4" />;
    case "Congelado": return <Snowflake className="h-4 w-4" />;
    case "Finalizado": return <CheckCircle2 className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

export default function Header({ project, onBack }: Props) {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [projectData, setProjectData] = useState<ProjectComplete>(project);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (
    newStatus: ProjectComplete["status"],
    newEndDate?: Date | null
  ) => {
    // UI otimista
    const prev = projectData;
    const optimistic: ProjectComplete = {
      ...prev,
      status: newStatus,
      ...(newEndDate !== undefined ? { endDate: newEndDate ?? null } : {}),
    };
    setProjectData(optimistic);

    try {
      const body: Record<string, Date | null | string> = { status: newStatus };
      if (newEndDate !== undefined) body.endDate = newEndDate;

      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setProjectData(prev); // rollback
        throw new Error(`Falha ao atualizar status (${res.status})`);
      }

      // IMPORTANTE: backend deve retornar o projeto completo já com endDate atualizado
      const updatedProject: ProjectComplete = await res.json();

      // Se vier string ISO, e você precisa como Date, converta aqui (opcional):
      // updatedProject.endDate = updatedProject.endDate ? new Date(updatedProject.endDate as any) : null;

      setProjectData(updatedProject);
      setIsStatusModalOpen(false);
      toast.success("Status atualizado!");

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setProjectData(prev); // rollback
      const msg = err instanceof Error ? err.message : "Erro ao atualizar status";
      toast.error(msg);
    }
  };

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
              <h1 className="text-3xl font-bold text-foreground">{projectData.name}</h1>
            </div>

            <p className="text-lg text-muted-foreground mb-4">{projectData.client}</p>

            <div className="flex items-center gap-4 mb-4">
              <Badge
                variant={getStatusVariant(projectData.status)}
                className="flex items-center gap-1"
              >
                {getStatusIcon(projectData.status)}
                {projectData.status}
              </Badge>
              {/* Se quiser visualizar endDate aqui para checar: */}
              {/* <span className="text-xs text-muted-foreground">
                endDate: {projectData.endDate ? new Date(projectData.endDate as any).toLocaleDateString() : "—"}
              </span> */}
            </div>

            <p className="pb-3 text-muted-foreground">{projectData.shortDescription}</p>

            <Button
              variant="hero"
              size="sm"
              className="cursor-pointer hover:[background-image:var(--gradient-primary)] hover:text-white hover:border-transparent transition-colors"
              onClick={() => setIsStatusModalOpen(true)}
              disabled={isPending}
              aria-disabled={isPending}
            >
              <Target className="h-4 w-4 mr-2" />
              {isPending ? "Atualizando..." : "Alterar Status"}
            </Button>
          </div>

          {projectData.coverImage && (
            <div className="w-full lg:w-64 h-48 bg-muted rounded-lg overflow-hidden">
              <img
                src={projectData.coverImage}
                alt="Imagem do projeto"
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
        onStatusChange={handleStatusChange} // (status, endDate?)
      />
    </div>
  );
}
