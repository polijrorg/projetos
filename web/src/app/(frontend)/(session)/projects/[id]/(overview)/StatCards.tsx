"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle2, Target, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Project } from "@/types";
import { calculateDelay } from "@/utils/projects/project-metrics";

export default function StatCards({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Início</span>
          </div>
          <p className="text-lg font-semibold">
            {format(project.startDate, "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Prazo</span>
          </div>
          <p className="text-lg font-semibold">
            {format(project.plannedEndDate, "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </CardContent>
      </Card>

      {project.actualEndDate && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Finalizado</span>
            </div>
            <p className="text-lg font-semibold">
              {format(project.actualEndDate, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Atraso</span>
          </div>
          <p className="text-lg font-semibold">
            {calculateDelay(project) > 0 ? `${calculateDelay(project)} dias` : "No prazo"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
