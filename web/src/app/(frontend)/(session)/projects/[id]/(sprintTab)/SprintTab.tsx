"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Project, Sprint, TaskPriority, TaskType } from "@/types";
import SprintList from "./SprintList";
import SprintDialog, { SprintInput } from "./SprintDialog";
import TaskDialog, { TaskInput } from "./TaskDialog";

export default function SprintsTab({ project }: { project: Project }) {
  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  const handleCreateSprint = () => setIsSprintDialogOpen(true);
  const handleCreateTask = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setIsTaskDialogOpen(true);
  };

   const onSubmitSprint = (data: SprintInput) => {

    console.log("Sprint criada:", data);
  };

  const onSubmitTask = (data: TaskInput) => {
    if (!selectedSprint) return;

    console.log(`Task criada na sprint ${selectedSprint.number}:`, data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sprints</h2>
        <Button className="cursor-pointer" onClick={handleCreateSprint} variant="hero">
          <Plus className="h-4 w-4 mr-2" />
          Nova Sprint
        </Button>
      </div>

      <SprintList project={project} onCreateTask={handleCreateTask} />

            <SprintDialog
        open={isSprintDialogOpen}
        onOpenChange={setIsSprintDialogOpen}
        onSubmit={onSubmitSprint}
      />

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        onSubmit={onSubmitTask}
        project={project}
        sprint={selectedSprint}
      />
    </div>
  );
}
