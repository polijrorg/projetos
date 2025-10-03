import type { ProjectWithNPS } from "./types";

export type PeriodKey = "YEAR" | "SEM1" | "SEM2" | "C1" | "C2" | "C3" | "C4";

// ciclos pedidos:
// C1: jan-fev-mar
// C2: abr-mai-jun
// C3: jul-ago-set
// C4: out-nov-dez

export function buildPeriod(year: number, key: PeriodKey) {
  const start = new Date(year, 0, 1, 0, 0, 0, 0);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);

  switch (key) {
    case "YEAR":
      return { start, end };
    case "SEM1":
      return {
        start: new Date(year, 0, 1, 0, 0, 0, 0),
        end: new Date(year, 5, 30, 23, 59, 59, 999), // Jan 1 - Jun 30
      };
    case "SEM2":
      return {
        start: new Date(year, 6, 1, 0, 0, 0, 0),
        end: new Date(year, 11, 31, 23, 59, 59, 999), // Jul 1 - Dec 31
      };
    case "C1":
      return {
        start: new Date(year, 0, 1, 0, 0, 0, 0),
        end: new Date(year, 2, 31, 23, 59, 59, 999), // Jan 1 - Mar 31
      };
    case "C2":
      return {
        start: new Date(year, 3, 1, 0, 0, 0, 0),
        end: new Date(year, 5, 30, 23, 59, 59, 999), // Apr 1 - Jun 30
      };
    case "C3":
      return {
        start: new Date(year, 6, 1, 0, 0, 0, 0),
        end: new Date(year, 8, 30, 23, 59, 59, 999), // Jul 1 - Sep 30
      };
    case "C4":
      return {
        start: new Date(year, 9, 1, 0, 0, 0, 0),
        end: new Date(year, 11, 31, 23, 59, 59, 999), // Oct 1 - Dec 31
      };
    default:
      return { start, end };
  }
}

export function inPeriod(date: Date, start: Date, end: Date) {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

/** Deriva os anos possíveis a partir de saleDate/endDate/responseDate do dataset */
export function getYearsFromData(projects: ProjectWithNPS[]) {
  const years = new Set<number>();
  for (const p of projects) {
    for (const d of [p.saleDate, p.endDate, p.npsResponse?.responseDate]) {
      if (!d) continue;
      const dd = new Date(d as any);
      if (!isNaN(dd.getTime())) years.add(dd.getFullYear());
    }
  }
  return years;
}
