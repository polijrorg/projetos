import { differenceInDays, differenceInWeeks, isAfter } from "date-fns";
import type { ProjectComplete, SprintComplete } from "@/types";
import { Sprint } from "@/generated/prisma";

export const calculateDelay = (project: ProjectComplete) => {
  if (project.status === 'Congelado') return 0;
  
  const today = new Date();
  if (isAfter(today, project.plannedEndDate)) {
    return differenceInDays(today, project.plannedEndDate);
  }
  return 0;
};

export const calculateProgress = (project: ProjectComplete) => {
  const total = Math.max(1, differenceInDays(project.plannedEndDate, project.startDate));
  const elapsed = Math.max(0, differenceInDays(new Date(), project.startDate));
  return Math.min(Math.max((elapsed / total) * 100, 0), 100);
};

export const calculateCSATCollectionRate = (project: ProjectComplete) => {
  if (!project?.sprints?.length) return 0;
  const withCsat = project.sprints.filter(s => s.csatResponses && s.csatResponses.length > 0).length;
  return Math.round((withCsat / project.sprints.length) * 100);
};

export const calculateITIP = (project: ProjectComplete) => {
  if (!project.analysts.length || !project.price) return 0;
  const itip = project.price /(project.analysts.length * project.sprintNumber * 2);
  return Number(itip.toFixed(2));
}

export const calculateRealITIP = (project: ProjectComplete) => {
  if (!project.analysts.length || !project.sprints.length || !project.price) return 0;
  const realItip = project.price / (project.analysts.length * project.sprints.length * 2);
  return Number(realItip.toFixed(2));
}


export const hasNPS = (project: ProjectComplete) => {
  const score = project?.npsResponse?.npsScore;
  return typeof score === "number" && Number.isFinite(score);
  // Se quiser ser mais rígido: && score >= 0 && score <= 10
};

export function hasCSATForSprint(sprint: Pick<SprintComplete, "csatResponses">) {
  return Array.isArray(sprint.csatResponses) && sprint.csatResponses.length > 0;
}

// utils/projects/csat.ts
type SprintWithCSAT = {
  csatResponses?: { overallSatisfactionScore: number }[];
};

export function calcAverageCSATFromSprints(sprints: SprintWithCSAT[]): number | null {
  if (!Array.isArray(sprints)) return null;

  const scores: number[] = [];
  for (const s of sprints) {
    const csat = Array.isArray(s.csatResponses) && s.csatResponses[0];
    if (csat && typeof csat.overallSatisfactionScore === "number") {
      scores.push(csat.overallSatisfactionScore);
    }
  }
  if (scores.length === 0) return null;

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Number(avg.toFixed(1));
}

export type DashboardMetrics = {
  totalProjects: number;
  activeProjects: number;
  enbCandidates: number;
  totalRevenue: number;     // soma de price (se existir)
  globalNPS: number;        // média simples do npsScore dos projetos que possuem NPS
  enbPercentage: number;    // % de projetos em ENB (isENB === true)
};

export function computeDashboardMetrics(projects: ProjectComplete[]): DashboardMetrics {
  const totalProjects = projects.length;

  const activeProjects = projects.filter(p => !p.endDate).length;

  const enbCandidates = projects.filter(p => p.status === "Possível ENB").length;

  const totalRevenue = projects.reduce((acc, p) => acc + (p.price ?? 0), 0);

  const npsList = projects
    .map(p => p.npsResponse?.npsScore)
    .filter((v): v is number => typeof v === "number");
  const globalNPS = npsList.length ? (npsList.reduce((a, b) => a + b, 0) / npsList.length) : 0;

  const enbPercentage = totalProjects
    ? (projects.filter(p => p.isENB).length / totalProjects) * 100
    : 0;

  return {
    totalProjects,
    activeProjects,
    enbCandidates,
    totalRevenue,
    globalNPS,
    enbPercentage,
  };
}


