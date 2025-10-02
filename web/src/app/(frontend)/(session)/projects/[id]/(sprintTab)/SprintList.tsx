/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  MessageSquare,
  Target,
} from "lucide-react";
import type { ProjectComplete, SprintComplete } from "@/types";
import { getScoreVariant5 } from "@/utils/projects/ui-helpers";

type Props = {
  project: ProjectComplete;
};

type SprintWithExtras = SprintComplete & {
  capacityHours?: number | null;
  goals?: string[];
};

type CSATState = Record<
  number,
  {
    exists: boolean;
    overall?: number;
  }
>;

export default function SprintList({ project }: Props) {
  const router = useRouter();
  const [sprints, setSprints] = useState<SprintWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // estado com cache do que já descobrimos sobre CSAT por sprint
  const [csat, setCsat] = useState<CSATState>({});

  // loading por sprint no clique do botão (evita duplo clique)
  const [checking, setChecking] = useState<Record<number, boolean>>({});

  // carrega sprints
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

  // pré-checa CSAT por sprint (para já renderizar “Ver CSAT” quando possível)
  useEffect(() => {
    if (!sprints.length) {
      setCsat({});
      return;
    }
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        sprints.map(async (s) => {
          try {
            const res = await fetch(`/api/projects/${project.id}/sprint/${s.number}/csat`, { cache: "no-store" });
            if (!res.ok) {
              return [s.number, { exists: false }] as const;
            }
            const data = await res.json();
            const overall =
              typeof data?.overallSatisfactionScore === "number"
                ? data.overallSatisfactionScore
                : undefined;
            return [s.number, { exists: true, overall }] as const;
          } catch {
            return [s.number, { exists: false }] as const;
          }
        })
      );
      if (!cancelled) setCsat(Object.fromEntries(entries));
    })();
    return () => { cancelled = true; };
  }, [project.id, sprints]);

  // GUARD: decide para onde ir no clique, em tempo real (conserta “clique rápido”)
  const goToCsat = async (sprintNumber: number) => {
    try {
      setChecking((m) => ({ ...m, [sprintNumber]: true }));
      const res = await fetch(`/api/projects/${project.id}/sprint/${sprintNumber}/csat`, { cache: "no-store" });
      if (res.ok) {
        router.push(`/projects/${project.id}/sprint/${sprintNumber}/response`);
      } else {
        router.push(`/projects/${project.id}/sprint/${sprintNumber}/csat`);
      }
    } finally {
      setChecking((m) => ({ ...m, [sprintNumber]: false }));
    }
  };

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

          const hasCSAT = csat[s.number]?.exists === true;
          const overall = csat[s.number]?.overall;
          const isChecking = !!checking[s.number];

          return (
            <Card key={s.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="whitespace-nowrap">Sprint {s.number}</CardTitle>
                      {hasCSAT && typeof overall === "number" && (
                        <Badge variant={getScoreVariant5(overall)} className="ml-1">CSAT: {overall}</Badge>
                      )}
                    </div>

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

                    {/* Botão único com guard no clique */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToCsat(s.number)}
                      className="cursor-pointer"
                      disabled={isChecking}
                    >
                      {isChecking
                        ? "Abrindo..."
                        : hasCSAT
                        ? "Ver CSAT"
                        : (<><MessageSquare className="h-4 w-4 mr-2" /> Coletar CSAT</>)}
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
