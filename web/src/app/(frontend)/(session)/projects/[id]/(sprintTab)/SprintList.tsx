"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import type { ProjectComplete, SprintComplete } from "@/types";
import { getTaskStatusIcon, getPriorityVariant } from "@/utils/projects/ui-helpers";


export default function SprintList({
  project,
  onCreateTask,
}: {
  project: ProjectComplete;
  onCreateTask: (sprint: SprintComplete) => void;
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {project.sprints.map((sprint) => (
        <Card key={sprint.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Sprint {sprint.number}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(sprint.startDate, "dd/MM", { locale: ptBR })} - {format(sprint.endDate, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="cursor-pointer hover:[background-image:var(--gradient-primary)] hover:text-white hover:border-transparent transition-colors"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/projeto/${project.id}/sprint/${sprint.number}`)}
                >
                  Ver Sprint
                </Button>
                <Button
                  className="cursor-pointer hover:[background-image:var(--gradient-primary)] hover:text-white hover:border-transparent transition-colors"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/projeto/${project.id}/sprint/${sprint.number}/csat`)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  CSAT
                </Button>
                <Button
                  className="cursor-pointer hover:[background-image:var(--gradient-primary)] hover:text-white hover:border-transparent transition-colors"
                  variant="outline"
                  size="sm"
                  onClick={() => onCreateTask(sprint)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Task
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {sprint.goals.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Objetivos:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {sprint.goals.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              )}

              {sprint.tasks.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Tasks:</h4>
                  <div className="space-y-2">
                    {sprint.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTaskStatusIcon(task.status ?? "")}
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityVariant(task.priority ?? "")}>{task.priority ?? "—"}</Badge>
                          <Badge variant="outline">{task.type}</Badge>
                          <span className="text-sm text-muted-foreground">{task.estimate}pt</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
