import { CheckCircle2 } from "lucide-react";


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


