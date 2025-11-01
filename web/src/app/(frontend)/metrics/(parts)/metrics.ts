import { inPeriod } from "./datePeriods";
import type { ProjectWithNPS } from "./types";

/** Soma dos preços (price) dos projetos cuja saleDate cai no período */
export function computeRevenue(projects: ProjectWithNPS[], start: Date, end: Date) {
  return projects.reduce((sum, p) => {
    if (!p.saleDate || typeof p.price !== "number") return sum;
    const d = new Date(p.saleDate);
    return inPeriod(d, start, end) ? sum + (p.price ?? 0) : sum;
  }, 0);
}

/** Entre os finalizados no período (endDate), % que são ENB */
export function computeENBPercent(projects: ProjectWithNPS[], start: Date, end: Date) {
  const finalized = projects.filter(p => p.endDate && inPeriod(new Date(p.endDate), start, end));
  const enbCount = finalized.filter(p => !!p.isENB).length;
  const total = finalized.length;
  return {
    enbCount,
    completedCount: total,
    percent: total ? (enbCount / total) * 100 : 0,
  };
}

/** NPS no período: promotores (>=9) - detratores (<=6), usando respostas com responseDate no período */
export function computeNPS(projects: ProjectWithNPS[], start: Date, end: Date) {
  const responses = projects
    .map(p => p.npsResponse)
    .filter(Boolean)
    .filter((r): r is NonNullable<ProjectWithNPS["npsResponse"]> => !!r)
    .filter(r => inPeriod(new Date(r.responseDate), start, end));

  const total = responses.length;
  if (!total) return NaN;

  const promoters = responses.filter(r => r.npsScore >= 9).length;
  const detractors = responses.filter(r => r.npsScore <= 6).length;

  return (promoters / total) * 100 - (detractors / total) * 100;
}
