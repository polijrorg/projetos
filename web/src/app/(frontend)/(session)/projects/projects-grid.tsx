"use client";
import { loadProjects } from "@/utils/storage";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format, differenceInDays } from "date-fns";
import type { Project } from "@/types"
import { ptBR } from "date-fns/locale";
import { 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  Users, 
  TrendingUp,
  Clock,
  AlertTriangle,
  Star,
  Eye,
  Edit,
  MoreHorizontal,
  Pause,
  Play,
  Snowflake
} from "lucide-react";
import { fi } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation"




type ProjectsGridProps = {
  className?: string;
  projects: Project[];
  loadProjects?: () => Promise<Project[]> | Project[]
  onSelect?: (project: Project) => void;
  ctaText?: string;
}

export default function ProjectsGrid({
  className,
  projects: projectsProp,
  loadProjects,
  onSelect,
  ctaText = "Ver Projeto Completo",
}: ProjectsGridProps){

  
  const getStatusVariant = (status: Project['status']) => {
      switch (status) {
        case 'Crítica': return 'critical';
        case 'Ruim': return 'bad';
        case 'Normal': return 'normal';
        case 'Possível ENB': return 'enb';
        default: return 'normal';
      }
  
    };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'Crítica': return <AlertTriangle className="h-4 w-4" />;
      case 'Ruim': return <TrendingUp className="h-4 w-4" />;
      case 'Normal': return <Clock className="h-4 w-4" />;
      case 'Possível ENB': return <Star className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

const router = useRouter()                  

  const handleViewProject = (project: Project) => {
    router.push(`/projects/${project.name}`)     
  }


    const calculateProgress = (project: Project) => {
    const total = differenceInDays(project.plannedEndDate, project.startDate);
    const elapsed = differenceInDays(new Date(), project.startDate);
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };


  const [projects, setProjects] = useState<Project[]>(projectsProp || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all")

  useEffect(() => {
    let active = true
    async function run() {
      if (projectsProp && active) return
      if (!loadProjects) return
      try {
        setLoading(true)
        const data = await Promise.resolve(loadProjects())
        if (active) setProjects(data)
      } catch (e) {
        if (active) setError("Falha ao carregar projetos.")
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  },[projectsProp, loadProjects])


  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                {p.isFrozen ? (
                    <Badge variant="frozen" className="flex items-center gap-1">
                      {}
                      {<Snowflake className="h-4 w-4" />}
                      Congelado
                    </Badge>
                  ) : (
                    <Badge variant={getStatusVariant(p.status)} className="flex items-center gap-1">
                      {getStatusIcon(p.status)}
                      {p.status}
                    </Badge>
                  )}
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
                    <span className="text-muted-foreground">Término:</span>
                    <span>{format(p.plannedEndDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Equipe:</span>
                    <span>{p.analysts.length} membros</span>
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
                    <div className="font-semibold">{p.averageCSAT.toFixed(1)}/5.0</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">NPS</div>
                    <div className="font-semibold">
                      {p.npsScore ? p.npsScore : '--'}
                    </div>
                  </div>
                </div>


          </CardContent>

          <CardFooter className="mt-auto pt-0">
            <Button className="w-full" variant="hero" onClick={() => handleViewProject(p)}>
              Ver Projeto Completo
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
    
  )
}



