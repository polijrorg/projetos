import { differenceInDays, differenceInWeeks, isAfter } from "date-fns";
import type { ProjectComplete } from "@/types";

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

