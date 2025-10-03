
export type CycleKey = "C1" | "C2" | "C3" | "C4";
export type PeriodKey = "YEAR" | "SEM1" | "SEM2" | "C1" | "C2" | "C3" | "C4";

type YearTarget = {
  cycles: Record<CycleKey, number>; // valores em reais (R$)
};

// Exemplo de metas para 2024
export const metasPorAno: Record<number, YearTarget> = {
  2024: {
    cycles: {
      C1: 120_000,
      C2: 130_000,
      C3: 110_000,
      C4: 140_000,
    },
  },
};

export function getMetaTarget(year: number, period: PeriodKey): number {
  const y = metasPorAno[year];
  if (!y) return 0;
  const { C1, C2, C3, C4 } = y.cycles;
  switch (period) {
    case "YEAR": return C1 + C2 + C3 + C4;
    case "SEM1": return C1 + C2;
    case "SEM2": return C3 + C4;
    case "C1": return C1;
    case "C2": return C2;
    case "C3": return C3;
    case "C4": return C4;
    default: return 0;
  }
}

export function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
