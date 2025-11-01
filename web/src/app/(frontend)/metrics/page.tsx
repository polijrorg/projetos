/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, PieChart, Activity, Calendar, Star } from "lucide-react";
import { MetricsCard } from "../(dashboard)/MetricsCard";
import { fetchProjects } from "./(parts)/data";
import { PeriodKey, getYearsFromData, buildPeriod, inPeriod } from "./(parts)/datePeriods";
import { computeRevenue, computeENBPercent, computeNPS } from "./(parts)/metrics";
import { ProjectWithNPS } from "./(parts)/types";
import { MetricsFilters } from "./MetricsFilter";
import { getStatusVariant } from "@/utils/projects/ui-helpers";
import { formatBRL, getMetaTarget } from "@/utils/projects/metas";

// ⬇️ IMPORTANTE: metas por período

export default function MetricsPage() {
  const [tab, setTab] = useState("overview");

  const [projects, setProjects] = useState<ProjectWithNPS[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filtros
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [periodKey, setPeriodKey] = useState<PeriodKey>("YEAR"); // YEAR | SEM1 | SEM2 | C1 | C2 | C3 | C4

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await fetchProjects();
        setProjects(data);
        // se não tiver ano escolhido, deduz do dataset
        if (data.length) {
          const years = getYearsFromData(data);
          if (years.size && !years.has(year)) {
            setYear(Math.max(...Array.from(years)));
          }
        }
      } catch (e: any) {
        setErr(e?.message ?? "Falha ao carregar projetos");
      } finally {
        setLoading(false);
      }
    })();
  }); // carrega 1x

  const { start, end } = useMemo(() => buildPeriod(year, periodKey), [year, periodKey]);

  // métricas principais (no período)
  const revenue = useMemo(() => computeRevenue(projects, start, end), [projects, start, end]);
  const enb = useMemo(() => computeENBPercent(projects, start, end), [projects, start, end]);
  const npsValue = useMemo(() => computeNPS(projects, start, end), [projects, start, end]);

  // meta do período selecionado
  const revenueTarget = useMemo(() => getMetaTarget(year, periodKey), [year, periodKey]);
// % REAL do faturamento (pode passar de 100)
const revenueRawProgress =
  revenueTarget > 0 ? (revenue / revenueTarget) * 100 : undefined;

// Valor só para a barra (0..100), tratando NaN/infinito
const revenueBarValue =
  revenueRawProgress === undefined
    ? undefined
    : Math.max(
        0,
        Math.min(100, Number.isFinite(revenueRawProgress) ? revenueRawProgress : 0)
      );

// Rótulo com a % real
const revenuePercentLabel =
  revenueRawProgress === undefined
    ? "Sem meta"
    : `${Math.round(revenueRawProgress)}%`;


  const totalProjects = projects.length;
  const activeNow = projects.filter(p => !p.endDate).length;

  // distribuição de status (snapshot atual — não por período)
  const statusDist = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of projects) {
      map[p.status] = (map[p.status] ?? 0) + 1;
    }
    return map;
  }, [projects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando métricas...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-destructive">{err}</p>
      </div>
    );
  }

  const rangeLabel = `${new Intl.DateTimeFormat("pt-BR").format(start)} — ${new Intl.DateTimeFormat("pt-BR").format(end)}`;
  const targetLabel = formatBRL(revenueTarget);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho + Filtros */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Métricas</h1>
            <p className="text-muted-foreground">Dashboard de performance e indicadores</p>
          </div>
          <MetricsFilters
            projects={projects}
            year={year}
            periodKey={periodKey}
            onChangeYear={setYear}
            onChangePeriod={setPeriodKey}
          />
        </div>

        {/* Cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricsCard
            title="Faturamento (período)"
            value={`R$ ${Math.round(revenue / 1000).toLocaleString()}k`}
            subtitle={`${rangeLabel} • Meta: ${targetLabel}`}
            target={revenueTarget}
            targetLabel={targetLabel}
            progress={revenueRawProgress}
            variant="revenue"
          />

          <MetricsCard
            title="% ENB (no período)"
            value={`${enb.percent.toFixed(1)}%`}
            subtitle={`${enb.enbCount} de ${enb.completedCount} finalizados`}
            progress={enb.percent}
            trend={enb.percent >= 20 ? "up" : "neutral"}
            variant="enb"
          />

          <MetricsCard
            title="NPS (no período)"
            value={Number.isFinite(npsValue) ? Math.round(npsValue) : "—"}
            subtitle="Promotores - Detratores"
            progress={Number.isFinite(npsValue) ? ((npsValue + 100) / 200) * 100 : 0}
            trend={Number.isFinite(npsValue) ? (npsValue > 0 ? "up" : "down") : "neutral"}
            variant="nps"
          />

          <MetricsCard
            title="Projetos Ativos (agora)"
            value={activeNow}
            subtitle={`${totalProjects} no total`}
            progress={totalProjects ? (activeNow / totalProjects) * 100 : 0}
            trend="neutral"
          />
        </div>

        {/* Abas detalhadas */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="nps">NPS</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Faturamento no período (detalhado) */}
              <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Faturamento no Período
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">
                          R$ {revenue.toLocaleString()}
                        </span>
                        <Badge variant="secondary">{rangeLabel}</Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Meta</span>
                        <span className="font-medium">{targetLabel}</span>
                      </div>

                      <Progress value={revenueBarValue ?? 0} className="h-3" />

                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Realizado</span>
                        <span>
                          {revenueTarget > 0 ? `${revenuePercentLabel} da meta` : "Sem meta"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>


              {/* Distribuição de status (snapshot) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Status dos Projetos (atual)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(statusDist).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span>{status}</span>
                        <Badge variant={getStatusVariant(status)}>{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    ENB no período
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{enb.percent.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">
                    {enb.enbCount} ENB de {enb.completedCount} finalizados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Janelas de Período
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p><b>Ano:</b> {year}</p>
                    <p><b>Início:</b> {start.toLocaleDateString("pt-BR")}</p>
                    <p><b>Fim:</b> {end.toLocaleDateString("pt-BR")}</p>
                    <p><b>Meta:</b> {targetLabel}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    NPS (período)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Number.isFinite(npsValue) ? Math.round(npsValue) : "—"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Baseado em respostas NPS no período
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Projetos considerados no período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-3">
                  Faturamento considera a <b>Data de Venda</b>. ENB considera <b>Data de Finalização</b>.
                </div>
                <ul className="space-y-2">
                  {projects.map(p => {
                    const saleIn = p.saleDate ? inPeriod(new Date(p.saleDate), start, end) : false;
                    const enbIn = p.endDate ? inPeriod(new Date(p.endDate), start, end) && p.isENB : false;
                    return (
                      <li key={p.id} className="flex items-center justify-between border rounded-md p-2">
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Cliente: {p.client}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant={saleIn ? "done" : "outline"}>{saleIn ? <p> Vendido no período </p> : <p>Fora do período</p>}</Badge>
                          <Badge variant={enbIn ? "enb" : "outline"}>{enbIn ? <p> ENB no período </p> : <p>Fora do período</p>}</Badge>
                          {p.isENB && <Badge variant="enb">ENB</Badge>}
                          {p.npsResponse && inPeriod(new Date(p.npsResponse.responseDate), start, end) && (
                            <Badge variant="secondary">NPS: {p.npsResponse.npsScore}</Badge>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nps" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhe NPS no período</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  % Promotores (9–10) menos % Detratores (0–6), considerando apenas respostas coletadas no período selecionado.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
