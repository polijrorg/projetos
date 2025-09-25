"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Project } from "@/types";
import { useRouter } from "next/navigation";

export default function SatisfactionTab({ project }: { project: Project }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coleta de Satisfação</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/projeto/${project.id}/nps`)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <TrendingUp className="h-4 w-4" />
            Coletar NPS
          </Button>
          <Button
            onClick={() => router.push(`/projeto/${project.id}/satisfacao`)}
            className="flex items-center gap-2 cursor-pointer"
            variant="hero"
          >
            <MessageSquare className="h-4 w-4" />
            Ver Respostas
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              CSAT por Sprint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.sprints.map((sprint) => (
                <div key={sprint.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Sprint {sprint.number}</span>
                    <p className="text-sm text-muted-foreground">
                      {format(sprint.startDate, "dd/MM", { locale: ptBR })} -{" "}
                      {format(sprint.endDate, "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {sprint.csatResponses?.length ? (
                      <Badge variant="secondary">
                        CSAT: {sprint.csatResponses[0].averageScore.toFixed(1)}
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/projeto/${project.id}/sprint/${sprint.number}/csat`)}
                        className="cursor-pointer"
                      >
                        Coletar CSAT
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              NPS do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              {typeof project.npsScore === "number" ? (
                <div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {project.npsScore}/10
                  </div>
                  <div className="text-muted-foreground">NPS Coletado</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 cursor-pointer"
                    onClick={() => router.push(`/projeto/${project.id}/satisfacao`)}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="text-muted-foreground mb-4">
                    NPS ainda não coletado
                  </div>
                  <Button className="cursor-pointer" onClick={() => router.push(`/projeto/${project.id}/nps`)}>
                    Coletar NPS
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
