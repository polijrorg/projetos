/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2 } from "lucide-react";
import type { SprintComplete } from "@/types";
import TaskDialog2 from "./TaskDialog2";
import { getPriorityVariant, getStatusIcon, percent } from "@/utils/projects/ui-helpers";

type Task = {
  id: string;
  sprintId: string;
  title: string;
  description?: string | null;
  priority?: "Alta" | "Média" | "Baixa" | null;
  type?: string | null; // "Front" | "Back"
  estimate?: number | null;
  status?: "ToDo" | "InProgress" | "Review" | "Done" | string | null;
};

type Props = {
  projectId: string;
  sprint: SprintComplete;
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
};

export default function SprintTasksSection({ projectId, sprint, tasks, onTasksChange }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const frontTasks = useMemo(() => tasks.filter((t) => (t.type ?? "Front") === "Front"), [tasks]);
  const backTasks = useMemo(() => tasks.filter((t) => (t.type ?? "Back") === "Back"), [tasks]);

  const calcProgress = (list: Task[]) => {
    const total = list.length;
    const done = list.filter((t) => (t.status ?? "ToDo") === "Done").length;
    return percent(done, total);
  };

  // CRUD handlers
  const handleCreate = async (payload: Omit<Task, "id" | "sprintId">) => {
    const res = await fetch(`/api/projects/${projectId}/sprint/${sprint.id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Falha ao criar task");
    const created: Task = await res.json();
    onTasksChange([...(tasks ?? []), created]);
  };

  const handleUpdate = async (taskId: string, changes: Partial<Task>) => {
    const res = await fetch(`/api/projects/${projectId}/sprint/${sprint.id}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    if (!res.ok) throw new Error("Falha ao atualizar task");
    const updated: Task = await res.json();
    onTasksChange(tasks.map((t) => (t.id === taskId ? updated : t)));
  };

  const handleDelete = async (taskId: string) => {
    const res = await fetch(`/api/projects/${projectId}/sprint/${sprint.id}/tasks/${taskId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Falha ao deletar task");
    onTasksChange(tasks.filter((t) => t.id !== taskId));
  };

  const toggleStatus = async (task: Task) => {
    const order = ["ToDo", "InProgress", "Review", "Done"];
    const current = (task.status ?? "ToDo") as string;
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];
    await handleUpdate(task.id, { status: next as any });
  };

  const TaskList = ({ list, title, badgeTone }: { list: Task[]; title: string; badgeTone: "secondary" | "outline" }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 ${badgeTone === "secondary" ? "bg-primary" : "bg-secondary"} rounded-full`} />
            {title}
            <Badge variant="secondary">{list.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{Math.round(calcProgress(list))}% concluído</span>
            <Progress value={calcProgress(list)} className="w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhuma task nesta coluna.</p>
        ) : (
          <div className="space-y-3">
            {list.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <button onClick={() => toggleStatus(task)} className="hover:scale-110 transition-transform">
                    {getStatusIcon(task.status)}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{task.title}</h4>
                      {task.priority && (
                        <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
                          {task.priority}
                        </Badge>
                      )}
                    </div>
                    {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {typeof task.estimate === "number" && <span>⏱️ {task.estimate}h</span>}
                      <Badge variant="outline" className="text-xs">
                        {task.status ?? "ToDo"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingTask(task);
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
        <Button
          onClick={() => {
            setEditingTask(null);
            setDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          Nova Task
        </Button>
      </div>

<TaskDialog2
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  initialTask={
    editingTask
      ? {
          title: editingTask.title,
          description: editingTask.description ?? undefined, // <-- normaliza null -> undefined
          priority: (editingTask.priority as "Alta" | "Média" | "Baixa") ?? "Média",
          type: (editingTask.type as "Front" | "Back") ?? "Front",
          estimate: editingTask.estimate ?? 1,
          status: (editingTask.status as "ToDo" | "InProgress" | "Review" | "Done") ?? "ToDo",
        }
      : undefined
  }
  onConfirm={async (payload) => {
    if (editingTask) {
      await handleUpdate(editingTask.id, payload);
    } else {
      await handleCreate(payload);
    }
  }}
/>


      <TaskList list={frontTasks} title="Front-end" badgeTone="secondary" />
      <TaskList list={backTasks} title="Back-end" badgeTone="outline" />
    </div>
  );
}
