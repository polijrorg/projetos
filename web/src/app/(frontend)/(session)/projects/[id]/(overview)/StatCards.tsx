"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Target, Users, PowerOff, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ProjectComplete } from "@/types";
import { calculateDelay, calculateITIP, calculateRealITIP } from "@/utils/projects/project-metrics";
import { useState } from "react";


export default function StatCards({ project }: { project: ProjectComplete }) {

  
  const end =
  project.endDate ? new Date(project.endDate as unknown as string) : null;

const showFinalizadoCard =
  !!end && !isNaN(end.getTime()) && end.getFullYear() > 2020;



  const [projectData, setProjectData] = useState<ProjectComplete>(project);
  const [savingWeeksOff, setSavingWeeksOff] = useState(false);

  const weeksOff = projectData.weeksOff ?? 0;

  async function handleWeeksOffChange(delta: number) {
    const prev = weeksOff;
    const next = Math.max(0, prev + delta); // evita negativo

    setProjectData(p => ({ ...p, weeksOff: next }));

    try {
      setSavingWeeksOff(true);
      const res = await fetch(`/api/projects/${projectData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeksOff: next }),
      });

      if (!res.ok) {
        // rollback
        setProjectData(p => ({ ...p, weeksOff: prev }));
        const txt = await res.text().catch(() => "");
        throw new Error(`Falha ao atualizar semanas off (${res.status}) ${txt}`);
      }

      const updated: ProjectComplete = await res.json();
      setProjectData(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingWeeksOff(false);
    }
  }

  return (
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

        {showFinalizadoCard && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Finalizado</span>
              </div>
              <p className="text-lg font-semibold">
                {format(end!, "dd/MM/yyyy", { locale: ptBR })}
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
            {calculateDelay(project) > 0 ? `${calculateDelay(project)} dias` : "No prazo"}
          </p>
        </CardContent>
      </Card>

      <Card>
         <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">ITIP / ITIP Real</span>
          </div>
          <p className="text-lg font-semibold">
            R${calculateITIP(project)} / R${calculateRealITIP(project)}
          </p>
        </CardContent>
      </Card>

          {project.price ? (
            <Card>
         <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Preço</span>
          </div>
          <p className="text-lg font-semibold">
            R$ {(project.price / 1000).toFixed(1) + "k"}
          </p>
        </CardContent>
      </Card>) : (null)}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PowerOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Semanas Off</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => handleWeeksOffChange(-1)}
                  disabled={savingWeeksOff || weeksOff <= 0}
                  aria-label="Diminuir semanas off"
                  title="Diminuir"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => handleWeeksOffChange(+1)}
                  disabled={savingWeeksOff}
                  aria-label="Aumentar semanas off"
                  title="Aumentar"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-lg font-semibold flex items-center gap-2">
              {savingWeeksOff && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {weeksOff} semana{weeksOff === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>

    </div>
  );
}
