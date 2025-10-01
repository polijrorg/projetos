"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Clock, Target, Users, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ProjectComplete, SprintComplete } from "@/types";
import SprintTasksSection from "./SprintTasksSection";
import { percent, safeDate} from "@/utils/projects/ui-helpers";

type Task = {
  id: string;
  sprintId: string;
  title: string;
  description?: string | null;
  priority?: "Alta" | "Média" | "Baixa" | null;
  type?: string | null; // "Front" | "Back" (livre no schema)
  estimate?: number | null;
  status?: "ToDo" | "InProgress" | "Review" | "Done" | string | null;
};

export default function SprintDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const sprintNumber = Number(Array.isArray(params.number) ? params.number[0] : (params.number as string));

  const [project, setProject] = useState<ProjectComplete | null>(null);
  const [sprint, setSprint] = useState<SprintComplete | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  console.log(sprint);

  // fetch project + sprint + tasks
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // 1) Projeto (para nome no header)
        const pRes = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
        if (!pRes.ok) throw new Error(`Falha ao carregar projeto (HTTP ${pRes.status})`);
        const pData: ProjectComplete = await pRes.json();
        if (!mounted) return;
        setProject(pData);

        // 2) Sprint (busca lista e filtra pelo number)
        const sRes = await fetch(`/api/projects/${projectId}/sprint`, { cache: "no-store" });
        if (!sRes.ok) throw new Error(`Falha ao carregar sprints (HTTP ${sRes.status})`);
        const sData: SprintComplete[] = await sRes.json();
        if (!mounted) return;
        const found = sData.find((s) => s.number === sprintNumber) ?? null;
        setSprint(found ?? null);

        // 3) Tasks (se tiver sprint)
        if (found) {
          const tRes = await fetch(`/api/projects/${projectId}/sprint/${found.number}/tasks`, { cache: "no-store" });
          if (!tRes.ok) throw new Error(`Falha ao carregar tasks (HTTP ${tRes.status})`);
          const tData: Task[] = await tRes.json();
          if (!mounted) return;
          setTasks(Array.isArray(tData) ? tData : []);
        } else {
          setTasks([]);
        }
      } catch (e: any) {
        console.error("[SprintDetails] erro:", e);
        if (mounted) setErr(e?.message ?? "Erro ao carregar dados da sprint");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [projectId, sprintNumber]);

  const start = safeDate(sprint?.startDate);
  const end = safeDate(sprint?.endDate);

  const totals = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => (t.status ?? "ToDo") === "Done").length;
    const progress = percent(done, total);
    return { total, done, progress };
  }, [tasks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando sprint...</p>
      </div>
    );
  }

  if (err || !project || !sprint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sprint não encontrada</h1>
          <Button onClick={() => router.push(`/projects/${projectId}`)}>Voltar para Projeto</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-6 pt-20">
        <div className="flex items-center gap-4 mb-6">

          <div>
            <div className="pb-5"> 
              <Button
            variant="hero"
            size="sm"
            onClick={() => router.push(`/projects/${projectId}`)}
            className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
            </div>

            <h1 className="text-3xl font-bold text-foreground">
              Sprint {sprint.number} — {project.name}
            </h1>
            <p className="text-muted-foreground">
              {start ? format(start, "dd 'de' MMMM", { locale: ptBR }) : "—"} -{" "}
              {end ? format(end, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "—"}
            </p>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Capacidade</p>
                  <p className="text-lg font-semibold">{sprint.capacityHours ?? 0}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-lg font-semibold">{totals.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Progresso</p>
                  <p className="text-lg font-semibold">{Math.round(totals.progress)}%</p>
                </div>
              </div>
              <div className="mt-2">
                <Progress value={totals.progress} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Concluídas</p>
                  <p className="text-lg font-semibold">{totals.done}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Objetivos */}
        {Array.isArray(sprint.goals) && sprint.goals.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objetivos da Sprint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sprint.goals.map((goal, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p className="text-foreground">{goal}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Ações extras (ex.: CSAT) */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="secondary"
            onClick={() => router.push(`/projects/${projectId}/sprint/${sprintNumber}/csat`)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Coletar CSAT
          </Button>
        </div>

        {/* Tasks */}
        <SprintTasksSection
          projectId={projectId}
          sprint={sprint}
          tasks={tasks}
          onTasksChange={setTasks}
        />
      </div>
    </div>
  );
}
