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
} from "lucide-react";
import { Project } from "@/types";

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
    default:
      return "normal";
  }
};

export default function Header({ project, onBack }: Props) {
  return (
    <div className="border-b bg-card">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-4 pt-7">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer hover:[background-image:var(--gradient-primary)] hover:text-white hover:border-transparent transition-colors"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
              {project.isFrozen && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <PauseCircle className="h-3 w-3" />
                  Congelado
                </Badge>
              )}
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

              {project.isENBCandidate && (
                <Badge variant="enb" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Possível ENB
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground">{project.shortDescription}</p>
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
    </div>
  );
}
