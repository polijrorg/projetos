/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TaskForm = {
  title: string;
  description?: string;
  priority?: "Alta" | "Média" | "Baixa";
  type?: "Front" | "Back";
  estimate?: number;
  status?: "ToDo" | "InProgress" | "Review" | "Done";
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialTask?: Partial<TaskForm>;
  onConfirm: (payload: TaskForm) => Promise<void> | void;
};

export default function TaskDialog({ open, onOpenChange, initialTask, onConfirm }: Props) {
  const [form, setForm] = useState<TaskForm>({
    title: "",
    description: "",
    priority: "Média",
    type: "Front",
    estimate: 1,
    status: "ToDo",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        title: initialTask?.title ?? "",
        description: initialTask?.description ?? "",
        priority: (initialTask?.priority as any) ?? "Média",
        type: (initialTask?.type as any) ?? "Front",
        estimate: (initialTask?.estimate as any) ?? 1,
        status: (initialTask?.status as any) ?? "ToDo",
      });
    }
  }, [open, initialTask]);

  const handleConfirm = async () => {
    if (!form.title.trim()) return;
    try {
      setSubmitting(true);
      await onConfirm(form);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialTask?.title ? "Editar Task" : "Nova Task"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Título</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Digite o título da task"
              disabled={submitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-description">Descrição</Label>
            <Textarea
              id="task-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Descreva a task"
              rows={3}
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="task-priority">Prioridade</Label>
              <Select
                value={form.priority}
                onValueChange={(v: "Alta" | "Média" | "Baixa") => setForm((f) => ({ ...f, priority: v }))}
              >
                <SelectTrigger disabled={submitting}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-type">Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v: "Front" | "Back") => setForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger disabled={submitting}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Front">Front-end</SelectItem>
                  <SelectItem value="Back">Back-end</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="task-estimate">Estimativa (horas)</Label>
              <Input
                id="task-estimate"
                type="number"
                min={1}
                value={form.estimate ?? 1}
                onChange={(e) => setForm((f) => ({ ...f, estimate: parseInt(e.target.value) || 1 }))}
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v: "ToDo" | "InProgress" | "Review" | "Done") => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger disabled={submitting}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ToDo">ToDo</SelectItem>
                  <SelectItem value="InProgress">InProgress</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {initialTask?.title ? "Atualizar" : "Criar"} Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
