"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectComplete } from "@/types";
import StatCards from "./StatCards";
import ProgressPanel from "./ProgressPanel";
import { calculateProgress, calculateCSATCollectionRate } from "@/utils/projects/project-metrics";

export default function OverviewTab({ project }: { project: ProjectComplete }) {
  return (
    <div className="space-y-6">
      
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
                  {(project.averageCSAT ?? 0).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">CSAT Médio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{project.npsResponse?.npsScore || "--"}</div>
                <div className="text-sm text-muted-foreground">NPS</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <StatCards project={project} />
      <p>* O ITIP Real é calculado com base no número de sprints criadas na aba sprints.</p>
    </div>
  );
}
