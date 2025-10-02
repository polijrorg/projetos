import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Users, TrendingUp, AlertTriangle, Clock, Star } from "lucide-react";
import { ProjectComplete } from "@/types";
import { differenceInDays } from "date-fns";

interface ProjectCardProps {
  project: ProjectComplete;
  onViewProject: (id: string) => void;
}

export function ProjectCard({ project, onViewProject }: ProjectCardProps) {
  const getStatusVariant = (status: ProjectComplete['status']) => {
    switch (status) {
      case 'Crítica': return 'critical';
      case 'Ruim': return 'bad';
      case 'Normal': return 'normal';
      case 'Possível ENB': return 'enb';
      default: return 'normal';
    }
  };

  const getStatusIcon = (status: ProjectComplete['status']) => {
    switch (status) {
      case 'Crítica': return <AlertTriangle className="h-4 w-4" />;
      case 'Ruim': return <TrendingUp className="h-4 w-4" />;
      case 'Normal': return <Clock className="h-4 w-4" />;
      case 'Possível ENB': return <Star className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const calculateProgress = () => {
    const total = differenceInDays(project.plannedEndDate, project.startDate);
    const elapsed = differenceInDays(new Date(), project.startDate);
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const daysRemaining = differenceInDays(project.plannedEndDate, new Date());

  return (
    <Card className="h-full transition-all duration-300 hover:scale-[1.02] cursor-pointer" 
          onClick={() => onViewProject(project.id)}>
      {project.coverImage && (
        <div className="h-32 w-full bg-gradient-primary rounded-t-2xl" />
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground mb-1">
              {project.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{project.client}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge variant={getStatusVariant(project.status)} className="flex items-center gap-1">
              {getStatusIcon(project.status)}
              {project.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.shortDescription}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{Math.round(calculateProgress())}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Prazo</div>
              <div className="text-sm font-medium">
                {daysRemaining > 0 ? `${daysRemaining}d restam` : `${Math.abs(daysRemaining)}d atraso`}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Equipe</div>
              <div className="text-sm font-medium">{project.analysts.length} membros</div>
            </div>
          </div>
        </div>

        {/* CSAT and NPS */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-muted-foreground">CSAT Médio</div>
            <div className="text-sm font-semibold">
              {project.averageCSAT?.toFixed(1)}/5.0
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">NPS</div>
            <div className="text-sm font-semibold">
              {project.npsResponse?.npsScore ? project.npsResponse.npsScore : '--'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onViewProject(project.id);
            }}
          >
            Ver Projeto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}