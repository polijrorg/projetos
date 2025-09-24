"use client";

import { useState } from "react";
import { Project, Sprint, TaskPriority, TaskType } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle2,
  MessageSquare,
  Plus,
  Target,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { differenceInDays, isAfter } from "date-fns";
import { useRouter } from "next/navigation";


const ProjectBacklog = ({ projectId, sprintCount }: { projectId: string; sprintCount: number }) => (
  <div className="p-4 border rounded-lg text-sm text-muted-foreground">
    Backlog do projeto {projectId} — {sprintCount} sprints (placeholder)
  </div>
);


const getPriorityVariant = (priority: TaskPriority) => {
  switch (priority) {
    case "Alta":
      return "destructive";
    case "Média":
      return "secondary";
    case "Baixa":
      return "outline";
    default:
      return "outline";
  }
};

const getTaskStatusIcon = (status: string) => {

  if (status === "done") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "doing") return <div className="h-2 w-2 rounded-full bg-yellow-500" />;
  return <div className="h-2 w-2 rounded-full bg-muted-foreground" />;
};

const calculateCSATCollectionRate = (project: Project) => {
  if (!project?.sprints?.length) return 0;
  const withCsat = project.sprints.filter((s) => s.csatResponses && s.csatResponses.length > 0).length;
  return Math.round((withCsat / project.sprints.length) * 100);
};

type Props = {
  project: Project;
};

export default function PageContent({ project }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [newSprint, setNewSprint] = useState({
    number: 1,
    startDate: "",
    endDate: "",
    capacity: 40,
    goals: [""],
  });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Média" as TaskPriority,
    type: "Front" as TaskType,
    responsible: "",
    estimate: 1,
  });

  const calculateDelay = () => {
    if (project.isFrozen) return 0;
    const today = new Date();
    if (isAfter(today, project.plannedEndDate)) {
      return differenceInDays(today, project.plannedEndDate);
    }
    return 0;
  };

  const calculateProgress = () => {
    const total = Math.max(1, differenceInDays(project.plannedEndDate, project.startDate)); // evita div/0
    const elapsed = Math.max(0, differenceInDays(new Date(), project.startDate));
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  
  const handleCreateSprint = () => {
    setIsSprintDialogOpen(true);

  };

  const handleCreateTask = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setIsTaskDialogOpen(true);

  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="sprints">Sprints & Tasks</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="handoff">Handoff</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
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
                  {calculateDelay() > 0 ? `${calculateDelay()} dias` : "No prazo"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progresso do Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progresso Temporal</span>
                      <span>{Math.round(calculateProgress())}%</span>
                    </div>
                    <Progress value={calculateProgress()} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Coleta CSAT</span>
                      <span>{calculateCSATCollectionRate(project)}%</span>
                    </div>
                    <Progress value={calculateCSATCollectionRate(project)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    <div className="text-2xl font-bold text-foreground">
                      {project.npsScore || "--"}
                    </div>
                    <div className="text-sm text-muted-foreground">NPS</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* BACKLOG */}
        <TabsContent value="backlog" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Cronograma & Backlog</h2>
              <p className="text-muted-foreground">Planeje e organize as tasks por sprint</p>
            </div>
          </div>

          <ProjectBacklog projectId={project.id} sprintCount={project.sprints.length || 4} />
        </TabsContent>

        {/* SPRINTS */}
        <TabsContent value="sprints" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Sprints</h2>
            <Button className="cursor-pointer" onClick={handleCreateSprint} variant="hero">
              <Plus className="h-4 w-4 mr-2" />
              Nova Sprint
            </Button>
          </div>

          <div className="space-y-4">
            {project.sprints.map((sprint) => (
              <Card key={sprint.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Sprint {sprint.number}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(sprint.startDate, "dd/MM", { locale: ptBR })} -{" "}
                        {format(sprint.endDate, "dd/MM/yyyy", { locale: ptBR })}
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
                      <Button className="cursor-pointer hover:[background-image:var(--gradient-primary)] hover:text-white hover:border-transparent transition-colors" variant="outline" size="sm" onClick={() => handleCreateTask(sprint)}>
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
                          {sprint.goals.map((goal, index) => (
                            <li key={index}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {sprint.tasks.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Tasks:</h4>
                        <div className="space-y-2">
                          {sprint.tasks.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {getTaskStatusIcon(task.status)}
                                <div>
                                  <p className="font-medium">{task.title}</p>
                                  <p className="text-sm text-muted-foreground">{task.description}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
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
        </TabsContent>

        {/* TEAM */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipe do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.analysts.map((analyst) => (
                  <div key={analyst.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{analyst.name}</p>
                      <p className="text-sm text-muted-foreground">{analyst.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HANDOFF */}
        <TabsContent value="handoff" className="space-y-6">
          {/* Você pode extrair essa seção para um componente próprio depois */}
          {/* Conteúdo idêntico ao seu, removido aqui por brevidade */}
        </TabsContent>

        {/* METRICS */}
        <TabsContent value="metrics" className="space-y-6">
          {/* Conteúdo idêntico ao seu, removido aqui por brevidade */}
        </TabsContent>

        {/* SATISFACTION */}
        <TabsContent value="satisfaction" className="space-y-6">
          {/* Conteúdo idêntico ao seu, removido aqui por brevidade */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
