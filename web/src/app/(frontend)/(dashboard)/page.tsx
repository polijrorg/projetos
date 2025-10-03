/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ProjectComplete } from "@/types";

import QuickActions from "./QuickActions";
import { ProjectCard } from "./ProjectCard";
import { DashboardHeader } from "./DashboardHeader";
import { MetricsCard } from "./MetricsCard";
import { getMetaTarget } from "@/utils/projects/metas";
import { PeriodKey } from "../metrics/(parts)/datePeriods";



// ------------------------------------
// Helpers de período (ciclo atual)
// ------------------------------------
function monthToCycleKey(m: number): "C1" | "C2" | "C3" | "C4" {
  // m: 0(jan) .. 11(dez)
  if (m <= 2) return "C1";       // jan-fev-mar
  if (m <= 5) return "C2";       // abr-mai-jun
  if (m <= 8) return "C3";       // jul-ago-set
  return "C4";                   // out-nov-dez
}

function buildCyclePeriod(year: number, cycle: "C1" | "C2" | "C3" | "C4") {
  const startMap: Record<typeof cycle, { m: number; d: number }> = {
    C1: { m: 0, d: 1 },   // 01/jan
    C2: { m: 3, d: 1 },   // 01/abr
    C3: { m: 6, d: 1 },   // 01/jul
    C4: { m: 9, d: 1 },   // 01/out
  };
  const endMap: Record<typeof cycle, { m: number; d: number }> = {
    C1: { m: 2, d: 31 },  // 31/mar
    C2: { m: 5, d: 30 },  // 30/jun
    C3: { m: 8, d: 30 },  // 30/set
    C4: { m: 11, d: 31 }, // 31/dez
  };
  const s = startMap[cycle];
  const e = endMap[cycle];
  const start = new Date(year, s.m, s.d, 0, 0, 0, 0);
  const end = new Date(year, e.m, e.d, 23, 59, 59, 999);
  return { start, end };
}

function inPeriod(date: Date, start: Date, end: Date) {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

// ------------------------------------
// Fetch
// ------------------------------------
async function fetchProjects(): Promise<ProjectComplete[]> {
  const res = await fetch("/api/projects", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Falha ao buscar projetos (HTTP ${res.status})`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function DashboardPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"all" | "active" | "critical" | "enb">("all");
  const [projects, setProjects] = useState<ProjectComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // metas extras (se quiser manter metas de ENB fixas)
  const metaENBCyclePercent = 35;

  // carregar projetos do backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const list = await fetchProjects();
        if (mounted) setProjects(list);
      } catch (e: any) {
        console.error("[Dashboard] erro ao buscar projetos:", e);
        if (mounted) setErr(e?.message ?? "Falha ao carregar projetos");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ------------------------------
  // Ciclo atual (ano + período)
  // ------------------------------
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentCycle = monthToCycleKey(now.getMonth());
  const { start, end } = useMemo(() => buildCyclePeriod(currentYear, currentCycle), [currentYear, currentCycle]);

  // Meta de faturamento para o ciclo atual
  const cycleMetaRevenue = useMemo(() => getMetaTarget(currentYear, currentCycle as PeriodKey), [currentYear, currentCycle]);

  // ------------------------------
  // Métricas do ciclo atual
  // ------------------------------
  const metrics = useMemo(() => {
    // faturamento: soma de price dos projetos com saleDate dentro do período
    const totalRevenue = projects.reduce((sum, p) => {
      const sale = p.saleDate ? new Date(p.saleDate) : null;
      if (sale && inPeriod(sale, start, end) && typeof p.price === "number") {
        return sum + p.price;
      }
      return sum;
    }, 0);

    // ENB: % entre projetos finalizados no período cujo isENB é true
    let completedCount = 0;
    let enbCount = 0;
    projects.forEach((p) => {
      const ended = p.endDate ? new Date(p.endDate) : null;
      if (ended && inPeriod(ended, start, end)) {
        completedCount += 1;
        if (p.isENB) enbCount += 1;
      }
    });
    const enbPercentage = completedCount > 0 ? (enbCount / completedCount) * 100 : 0;

    // NPS: promotores - detratores com base em respostas dentro do período

    let promoters = 0;
    let detractors = 0;
    let totalResp = 0;
projects.forEach((p) => {
  const nps = p.npsResponse;
  if (!nps?.responseDate) return;

  const rDate = new Date(nps.responseDate);
  if (!inPeriod(rDate, start, end)) return;

  const score = typeof nps.npsScore === "number" ? nps.npsScore : null;
  if (score === null) return;

  totalResp += 1;
  if (score >= 9) promoters += 1;
  else if (score <= 6) detractors += 1;
});

    const globalNPS = totalResp > 0 ? ((promoters / totalResp) - (detractors / totalResp)) * 100 : 0;

    // Snapshot atual para cards auxiliares
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status !== "Finalizado" && p.status !== "Congelado").length;
    const enbCandidates = projects.filter(p => p.status === "Possível ENB").length;

    return {
      totalRevenue,
      enbPercentage,
      globalNPS,
      totalProjects,
      activeProjects,
      enbCandidates,
    };
  }, [projects, start, end]);

  const handleCreateProject = () => router.push("/projects/new");
  const handleCreateSprint  = () => router.push("/projects");
  const handleViewMetrics   = () => router.push("/metrics");
  const handleViewProject = (id: string) => router.push(`/projects/${id}`);

  const getFilteredProjects = () => {
    switch (selectedTab) {
      case "active":
        return projects.filter(p => p.status !== "Finalizado" && p.status !== "Congelado");
      case "critical":
        return projects.filter(p => p.status === "Crítica" || p.status === "Ruim");
      case "enb":
        return projects.filter(p => p.isENB || p.status === "Possível ENB");
      default:
        return projects;
    }
  };

  const filtered = getFilteredProjects();
  const displayed = useMemo(() => {
  const ts = (d: Date | string | null | undefined) =>
    d ? new Date(d as any).getTime() : 0; // trata valores falsy

  return [...filtered]
    .sort((a, b) => ts(b.startDate) - ts(a.startDate)) // mais recentes primeiro
    .slice(0, 6); // apenas os 6
}, [filtered]);


  const revenueProgress = cycleMetaRevenue > 0 ? (metrics.totalRevenue / cycleMetaRevenue) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader
          totalProjects={metrics.totalProjects}
          activeProjects={metrics.activeProjects}
          enbCandidates={metrics.enbCandidates}
          onCreateProject={handleCreateProject}
          onCreateSprint={handleCreateSprint}
          onViewMetrics={handleViewMetrics}
        />

        {/* Key Metrics -> apenas do ciclo atual */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricsCard
            title={`Faturamento do ciclo (${currentCycle} ${currentYear})`}
            value={`R$ ${(metrics.totalRevenue / 1000).toFixed(1)}k`}
            subtitle={`Meta: R$ ${(cycleMetaRevenue / 1000).toFixed(1)}k`}
            target={cycleMetaRevenue}
            targetLabel={`R$ ${(cycleMetaRevenue / 1000).toFixed(1)}k`}
            progress={revenueProgress}
            trend={revenueProgress >= 100 ? "up" : "neutral"}
            variant="revenue"
          />
          <MetricsCard
            title="Taxa ENB (ciclo)"
            value={`${metrics.enbPercentage.toFixed(1)}%`}
            subtitle="Excelente Não Basta"
            progress={metrics.enbPercentage}
            target={metaENBCyclePercent}
            targetLabel={`${metaENBCyclePercent}%`}
            trend={metrics.enbPercentage >= metaENBCyclePercent ? "up" : "neutral"}
            variant="enb"
          />
          <MetricsCard
            title="NPS (ciclo)"
            value={metrics.globalNPS.toFixed(1)}
            subtitle="Net Promoter Score"
            progress={((metrics.globalNPS + 100) / 200) * 100}
            trend={metrics.globalNPS > 0 ? "up" : "down"}
            variant="nps"
          />
          <MetricsCard
            title="Projetos Ativos"
            value={metrics.activeProjects}
            subtitle={`${metrics.totalProjects} projetos total`}
            progress={metrics.totalProjects ? (metrics.activeProjects / metrics.totalProjects) * 100 : 0}
            trend="neutral"
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Projects (somente 6 exibidos) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Projetos</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-gradient-card">
                {displayed.length} de {filtered.length}
              </Badge>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as typeof selectedTab)}>
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="critical">Críticos</TabsTrigger>
              <TabsTrigger value="enb">ENB</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : err ? (
                <div className="text-sm text-destructive">{err}</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayed.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onViewProject={() => handleViewProject(project.id)}
                      />
                    ))}
                  </div>

                  {filtered.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-muted-foreground mb-4">
                        Nenhum projeto encontrado nesta categoria.
                      </div>
                      <Button variant="outline" onClick={handleCreateProject}>
                        Criar Primeiro Projeto
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
