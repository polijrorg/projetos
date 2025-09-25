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
import { Project, ProjectStatus } from "@/types";
import { useState } from "react";
import { ProjectStatusModal } from "./projectStatusModal";
import { updateProjectStatus } from "@/utils/storage/storage";
import { ca } from "date-fns/locale";
import { useRouter } from "next/navigation";



type Props = {
  project: Project;
  onBack: () => void;
};

const getStatusIcon = (status: Project["status"]) => {
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

const getStatusVariant = (status: Project["status"]) => {
  switch (status) {
    case "Crítica":
      return "critical";
    case "Ruim":
      return "bad";
    case "Normal":
      return "normal";
    case "Possível ENB":
      return "enb";
    case "Congelado":
      return "frozen";
    case "Finalizado":
      return "done";
    default:
      return "normal";
  }
};

export default function Header({ project, onBack }: Props) {

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const handleChangeStatus = () => setIsStatusModalOpen(true);
   const handleStatusChange = (newStatus: ProjectStatus) => {
    const updatedProject = updateProjectStatus(project.id, newStatus);
    if (updatedProject) {
      window.location.reload();
    }
  };
  const router = useRouter();

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
                variant={getStatusVariant(project.status)}
                className="flex items-center gap-1"
              >
                {getStatusIcon(project.status)}
                {project.status}
              </Badge>
            </div>

            <p className=" pb-3 text-muted-foreground">{project.shortDescription}</p>

            <Button 
                variant="hero" 
                size="sm"
                className="cursor-pointer hover:[background-image:var(--gradient-primary)] hover:text-white hover:border-transparent transition-colors"
                onClick={handleChangeStatus}>
                <Target className="h-4 w-4 mr-2" />
                Alterar Status
         </Button>
          </div>

          {project.coverImage && (
            <div className="w-full lg:w-64 h-48 bg-muted rounded-lg overflow-hidden">
              <img
                src={project.coverImage}
                alt={`Carlos Tavares é um gostoso`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
        <ProjectStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={project.status}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
