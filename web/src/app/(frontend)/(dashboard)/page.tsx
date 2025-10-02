/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";



import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


import type { ProjectComplete } from "@/types";

import { computeDashboardMetrics } from "@/utils/projects/project-metrics";
import QuickActions from "./QuickActions";
import { ProjectCard } from "./ProjectCard";
import { DashboardHeader } from "./DashboardHeader";
import { MetricsCard } from "./MetricsCard";

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

  const metrics = useMemo(() => computeDashboardMetrics(projects), [projects]);

  const handleCreateProject = () => router.push("/projects/new");
  const handleCreateSprint  = () => router.push("/projects"); // ajuste se houver rota de criação
  const handleViewMetrics   = () => router.push("/metrics");

  const handleViewProject = (id: string) => {
    router.push(`/projects/${id}`);
  };

  const getFilteredProjects = () => {
    switch (selectedTab) {
      case "active":
        return projects.filter(p => !p.endDate);
      case "critical":
        return projects.filter(p => p.status === "Crítica" || p.status === "Ruim");
      case "enb":
        return projects.filter(p => p.isENB || p.status === "Possível ENB");
      default:
        return projects;
    }
  };

  const filtered = getFilteredProjects();

  const metaFaturamento = 400000;
  const metaENB = 50;

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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricsCard
            title="Faturamento do ciclo"
            value={`R$ ${(metrics.totalRevenue / 1000).toFixed(1)}k`}
            subtitle={"R$ "+ (metaFaturamento / 1000).toFixed(1) + "k" }
            target = {metaFaturamento}
            targetLabel={"R$ "+ (metaFaturamento / 1000).toFixed(1) + "k" }
            progress={(metrics.totalRevenue / metaFaturamento) * 100}
            trend="up"
            variant="revenue"
          />
          <MetricsCard
            title="Taxa ENB"
            value={`${metrics.enbPercentage.toFixed(1)}%`}
            subtitle="Excelente Não Basta"
            progress={metrics.enbPercentage}
            target = {metaENB}
            targetLabel={metaENB + "%"}
            trend="up"
            variant="enb"
          />
          <MetricsCard
            title="NPS Global"
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

        {/* Quick Actions (links úteis) */}
        <QuickActions />

        {/* Projects */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Projetos</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-gradient-card">
                {filtered.length} projetos
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
                    {filtered.map((project) => (
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
