/* eslint-disable @typescript-eslint/no-explicit-any */

import { CheckCircle2, Circle, PlayCircle } from "lucide-react";


export const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "Alta": return "destructive";
    case "Média": return "secondary";
    case "Baixa": return "outline";
    default: return "outline";
  }
};

export const getTaskStatusIcon = (status: string) => {
  if (status === "done") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "doing") return <div className="h-2 w-2 rounded-full bg-yellow-500" />;
  return <div className="h-2 w-2 rounded-full bg-muted-foreground" />;
};

export const getNPSVariant = (score: number | null | undefined) => {
  if (typeof score !== "number") return "secondary";
  if (score <= 6) return "destructive"; // detrator
  if (score <= 8) return "secondary";   // neutro
  return "done";                      // promotor
};

export const getScoreVariant5 = (score: number | null | undefined) => {
  if (typeof score !== "number") return "secondary";
  const pct = (score / 5) * 100;
  if (pct >= 80) return "done";
  if (pct >= 60) return "yellow";
  return "destructive";
};



export const percent = (done: number, total: number) => {
  if (!total) return 0;
  return (done / total) * 100;
};

export const safeDate = (d?: string | Date | null) => {
  if (!d) return null;
  try {
    return new Date(d);
  } catch {
    return null;
  }
};

export const statusOrder = ["ToDo", "InProgress", "Review", "Done"] as const;

export const getStatusIcon = (status?: string | null) => {
  const s = status ?? "ToDo";
  switch (s) {
    case "Done":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "InProgress":
    case "Review":
      return <PlayCircle className="h-4 w-4 text-primary" />;
    case "ToDo":
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
};

// apenas para referência se quiser usar em outros lugares
export const getStatusVariant = (status: string) => {
  switch (status) {
    case "Crítica":
      return "critical";
    case "Ruim":
      return "bad";
    case "Normal":
      return "normal";
    case "Possível ENB":
      return "enb";
    case "Congelado":
      return "outline";
    default:
      return "normal";
  }
};



