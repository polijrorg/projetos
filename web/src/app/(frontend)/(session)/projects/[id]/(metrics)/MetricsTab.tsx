"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types";

export default function MetricsTab({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>CSAT por Sprint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.sprints.map((sprint) => (
              <div key={sprint.id} className="flex justify-between items-center p-3 border rounded-lg">
                <span>Sprint {sprint.number}</span>
                {sprint.csatResponses?.length ? (
                  <Badge variant="secondary">{sprint.csatResponses.length} respostas</Badge>
                ) : (
                  <Badge variant="outline">Sem CSAT</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retrospectivas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.sprints.map((sprint) => (
              <div key={sprint.id} className="flex justify-between items-center p-3 border rounded-lg">
                <span>Sprint {sprint.number}</span>
                {sprint.retrospective ? (
                  <Badge variant="secondary">Concluída</Badge>
                ) : (
                  <Badge variant="outline">Pendente</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
