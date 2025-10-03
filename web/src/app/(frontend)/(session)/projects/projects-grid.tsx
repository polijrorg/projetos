"use client";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns";
import type { ProjectComplete } from "@/types"
import { ptBR } from "date-fns/locale";
import { 
  Search, 
  TrendingUp,
  Clock,
  AlertTriangle,
  Star,
  Snowflake,
  CheckCircle2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation"
import { calcAverageCSATFromSprints, calculateProgress } from "@/utils/projects/project-metrics";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { getStatusVariant } from "@/utils/projects/ui-helpers";

type ProjectsGridProps = {
  className?: string;
  projects: ProjectComplete[];
  loadProjects?: () => Promise<ProjectComplete[]> | ProjectComplete[]
  onSelect?: (project: ProjectComplete) => void;
  ctaText?: string;
}

export default function ProjectsGrid({
  className,
  projects: projectsProp,
}: ProjectsGridProps){

  const getStatusIcon = (status: ProjectComplete['status']) => {
    switch (status) {
      case 'Crítica': return <AlertTriangle className="h-4 w-4" />;
      case 'Ruim': return <TrendingUp className="h-4 w-4" />;
      case 'Normal': return <Clock className="h-4 w-4" />;
      case 'Possível ENB': return <Star className="h-4 w-4" />;
      case 'Congelado': return <Snowflake className="h-4 w-4" />;
      case 'Finalizado': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const router = useRouter();

  const handleViewProject = (project: ProjectComplete) => {
    router.push(`/projects/${project.id}`)
  }

  const [projects, setProjects] = useState<ProjectComplete[]>(projectsProp || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all")

  useEffect(() => {
    fetch('/api/projects')
      .then(response => response.json())
      .then(data => setProjects(data))
      .catch(error => console.error('Erro ao buscar projetos:', error));
  }, []);

  // ⬇️ Filtra e ORDENA por startDate (mais recentes primeiro)
  const filteredProjects = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const isActive = (status: string) => status !== "Finalizado" && status !== "Congelado";

    return projects
      .filter(project => {
        const matchesSearch =
          project.name.toLowerCase().includes(term) ||
          project.client.toLowerCase().includes(term);

        const matchesStatus =
          statusFilter === "all"
            ? isActive(project.status)                  // “Ativos” = não finalizados nem congelados
            : project.status === statusFilter;          // demais filtros: match exato

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const ta = a?.startDate ? new Date(a.startDate as any).getTime() : 0;
        const tb = b?.startDate ? new Date(b.startDate as any).getTime() : 0;
        return tb - ta; // mais recentes primeiro
      });
  }, [projects, searchTerm, statusFilter]);

  if (loading && !projects) {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse h-40" />
        ))}
      </div>
    )
  }

  if (error && !projects) {
    return <div className={cn("text-sm text-red-600", className)}>{error}</div>
  }

  const list = projects ?? []

  if (list.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Nenhum projeto encontrado.
      </div>
    )
  }

  return (
    <div>
      <div>
        <Tabs className="mb-6" value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">Ativos</TabsTrigger>
            <TabsTrigger value="Normal">Normal</TabsTrigger>
            <TabsTrigger value="Crítica">Crítica</TabsTrigger>
            <TabsTrigger value="Ruim">Ruim</TabsTrigger>
            <TabsTrigger value="Possível ENB">Possível ENB</TabsTrigger>
            <TabsTrigger value="Congelado">Congelados</TabsTrigger>
            <TabsTrigger value="Finalizado">Finalizados</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
          className
        )}
      >
        {filteredProjects.map((p) => (
          <Card key={p.id} className="rounded-2xl bg-gradient-card shadow-card transition-all hover:shadow-elevated">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg font-semibold mb-1">{p.name}</CardTitle>
                <Badge variant={getStatusVariant(p.status)} className="flex items-center gap-1">
                  {getStatusIcon(p.status)}
                  {p.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Cliente: {p.client}</p>
            </CardHeader>

            <CardContent className="pt-0 space-y-2 justify-between">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {p.shortDescription}
              </p>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Prazo</span>
                  <span className="font-medium">{Math.round(calculateProgress(p))}%</span>
                </div>
                <Progress value={calculateProgress(p)} className="h-2" />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Início:</span>
                  <span>{format(p.startDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Término Planejado:</span>
                  <span>{format(p.plannedEndDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
                {p.endDate ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Término Real:</span>
                    <span>{format(p.endDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Equipe:</span>
                  <span>{p.analysts.length} membros</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Data da Venda:</span>
                  <span>{format(p.saleDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
                {p.price && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-medium">R$ {p.price.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">CSAT Médio</div>
                  <div className="font-semibold">
                    {calcAverageCSATFromSprints(p.sprints)?.toFixed(1) ?? "--"}/5.0
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">NPS</div>
                  <div className="font-semibold">
                    {p.npsResponse?.npsScore ?? "--"}
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="mt-auto pt-0">
              <Button className="w-full cursor-pointer" variant="hero" onClick={() => handleViewProject(p)}>
                Ver Projeto Completo
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
