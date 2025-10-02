import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardHeaderProps {
  totalProjects: number;
  activeProjects: number;
  enbCandidates: number;
  onCreateProject: () => void;
  onCreateSprint: () => void;
  onViewMetrics: () => void;
}

export function DashboardHeader({
  totalProjects,
  activeProjects,
  enbCandidates,
  onCreateProject,
  onCreateSprint,
  onViewMetrics
}: DashboardHeaderProps) {
  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <div className="mb-8 pt-10">
      {/* Header with greeting and date */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Poli Júnior - NTEC
          </h1>
          <p className="text-muted-foreground capitalize">{today}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onViewMetrics}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Métricas
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-card rounded-2xl border p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projetos Ativos</p>
              <p className="text-2xl font-bold text-foreground">{activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-card rounded-2xl border p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Projetos</p>
              <p className="text-2xl font-bold text-foreground">{totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-card rounded-2xl border p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-status-enb/10 rounded-lg">
              <Calendar className="h-5 w-5 text-status-enb" />
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Candidatos ENB</p>
                <p className="text-2xl font-bold text-foreground">{enbCandidates}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}