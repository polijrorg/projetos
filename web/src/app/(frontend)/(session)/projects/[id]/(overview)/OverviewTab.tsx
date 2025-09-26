"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Target, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Project } from "@/types";
import StatCards from "./StatCards";
import ProgressPanel from "./ProgressPanel";
import { calculateProgress, calculateCSATCollectionRate } from "@/utils/projects/project-metrics";

export default function OverviewTab({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <StatCards project={project} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressPanel
          temporalProgress={Math.round(calculateProgress(project))}
          csatProgress={calculateCSATCollectionRate(project)}
        />
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Qualidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {project.averageCSAT.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">CSAT Médio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{project.npsScore || "--"}</div>
                <div className="text-sm text-muted-foreground">NPS</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
