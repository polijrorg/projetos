/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  MessageSquare,
  Plus,
  Target
} from "lucide-react";
import type { ProjectComplete, SprintComplete } from "@/types";

type Props = {
  project: ProjectComplete;
  onCreateTask: (sprint: SprintComplete) => void;
};

type SprintWithExtras = SprintComplete & {
  capacityHours?: number | null;
  goals?: string[];
  // se no futuro voltar a mostrar métricas, dá pra expandir aqui
};

export default function SprintList({ project, onCreateTask }: Props) {
  const router = useRouter();
  const [sprints, setSprints] = useState<SprintWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/projects/${project.id}/sprint`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Falha ao carregar sprints (HTTP ${res.status})`);
        const data = await res.json();
        if (mounted) setSprints(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error("[SprintList] erro ao buscar sprints:", e);
        if (mounted) {
          setErr(e?.message ?? "Erro ao carregar sprints");
          setSprints([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [project.id]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-40 bg-muted rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="h-4 w-52 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (err) {
    return <div className="text-destructive text-sm">{err}</div>;
  }

  if (!sprints.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Nenhuma sprint criada ainda. Clique em <span className="font-medium">“Nova Sprint”</span> para começar.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sprints
        .sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
        .map((s) => {
          const start = s.startDate ? new Date(s.startDate as unknown as string) : null;
          const end = s.endDate ? new Date(s.endDate as unknown as string) : null;
          const goals = Array.isArray(s.goals) ? s.goals.filter(Boolean) : [];
          const capacity = typeof s.capacityHours === "number" ? s.capacityHours : null;

          return (
            <Card key={s.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Sprint {s.number}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {start ? format(start, "dd/MM", { locale: ptBR }) : "—"} -{" "}
                        {end ? format(end, "dd/MM/yyyy", { locale: ptBR }) : "—"}
                      </span>
                      {capacity !== null && (
                        <>
                          <span className="mx-1">•</span>
                          <span>Capacidade: {capacity}h</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => router.push(`/projects/${project.id}/sprint/${s.number}`)}
                    >
                      Ver Sprint
                    </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/projects/${project.id}/sprint/${s.number}/csat`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    CSAT
                  </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => onCreateTask(s)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Task
                    </Button>

                
                  </div>
                  
                </div>
                
              </CardHeader>

              <CardContent>
                {!!goals.length && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Objetivos</h4>
                    </div>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {goals.map((goal, index) => (
                        <li key={index}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                )}



              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
