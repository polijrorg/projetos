"use client";

import { ProjectComplete, SprintComplete} from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TaskPriority = "Alta" | "Média" | "Baixa";
export type TaskType = "Front" | "Back";

export type TaskInput = {
  title: string;
  description: string;
  priority: TaskPriority; // "Alta" | "Média" | "Baixa"
  type: TaskType;         // "Front" | "Back"
  responsible: string;    // nome do analista
  estimate: number;       // story points
};

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskInput) => void;
  project: ProjectComplete;
  sprint?: SprintComplete | null; // para exibir o número no título
  initialValue?: Partial<TaskInput>;
};

export default function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  project,
  sprint,
  initialValue,
}: TaskDialogProps) {
  const [data, setData] = useState<TaskInput>({
    title: initialValue?.title ?? "",
    description: initialValue?.description ?? "",
    priority: (initialValue?.priority as TaskPriority) ?? "Média",
    type: (initialValue?.type as TaskType) ?? "Front",
    responsible: initialValue?.responsible ?? "",
    estimate: initialValue?.estimate ?? 3,
  });

  const handleConfirm = () => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Nova Task{typeof sprint?.number !== "undefined" ? ` - Sprint ${sprint?.number}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="task-title">Título</Label>
            <Input
              id="task-title"
              value={data.title}
              onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))}
              placeholder="Digite o título da task"
            />
          </div>

          <div>
            <Label htmlFor="task-description">Descrição</Label>
            <Textarea
              id="task-description"
              value={data.description}
              onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))}
              placeholder="Descreva a task"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="task-priority">Prioridade</Label>
              <Select
                value={data.priority}
                onValueChange={(value: TaskPriority) =>
                  setData((d) => ({ ...d, priority: value }))
                }
              >
                <SelectTrigger className="cursor-pointer" >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="Alta">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      Alta
                    </div>
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="Média">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      Média
                    </div>
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="Baixa">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Baixa
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="task-type">Tipo</Label>
              <Select
                value={data.type}
                onValueChange={(value: TaskType) =>
                  setData((d) => ({ ...d, type: value }))
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="Front">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      Front-end
                    </div>
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="Back">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      Back-end
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="task-responsible">Responsável</Label>
            <Select
              value={data.responsible}
              onValueChange={(value) => setData((d) => ({ ...d, responsible: value }))}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                {project.analysts.map((analyst) => (
                  <SelectItem className="cursor-pointer" key={analyst.id} value={analyst.name}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {analyst.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{analyst.name}</div>
                        <div className="text-xs text-muted-foreground">{analyst.role}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="task-estimate">Estimativa (Story Points)</Label>
            <Select
              value={String(data.estimate)}
              onValueChange={(value) =>
                setData((d) => ({ ...d, estimate: parseInt(value) }))
              }
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="cursor-pointer" value="1">1 ponto</SelectItem>
                <SelectItem className="cursor-pointer" value="2">2 pontos</SelectItem>
                <SelectItem className="cursor-pointer" value="3">3 pontos</SelectItem>
                <SelectItem className="cursor-pointer" value="5">5 pontos</SelectItem>
                <SelectItem className="cursor-pointer" value="8">8 pontos</SelectItem>
                <SelectItem className="cursor-pointer" value="13">13 pontos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button className="cursor-pointer" variant="cancel" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="cursor-pointer" variant="hero" onClick={handleConfirm}>Criar Task</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
