"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Project, Sprint, TaskPriority, TaskType } from "@/types";
import SprintList from "./SprintList";

export default function SprintsTab({ project }: { project: Project }) {
  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  const handleCreateSprint = () => setIsSprintDialogOpen(true);
  const handleCreateTask = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setIsTaskDialogOpen(true);
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

      {/* Dialogs/Sheets podem ser adicionados aqui */}
    </div>
  );
}
