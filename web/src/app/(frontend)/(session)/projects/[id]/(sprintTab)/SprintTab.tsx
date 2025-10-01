"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { ProjectComplete, SprintComplete } from "@/types";
import SprintList from "./SprintList";
import TaskDialog, { TaskInput } from "./TaskDialog";
import { SprintCreateModal } from "./SprintDialog";

export default function SprintsTab({ project }: { project: ProjectComplete }) {
  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<SprintComplete | null>(null);

  // dispara refetch no SprintList quando muda
  const [refreshToken, setRefreshToken] = useState(0);

  const handleCreateSprint = () => setIsSprintDialogOpen(true);

  const handleCreateTask = (sprint: SprintComplete) => {
    setSelectedSprint(sprint);
    setIsTaskDialogOpen(true);
  };

  const onSprintCreated = () => {
    // fecha o modal e força o SprintList a buscar novamente
    setIsSprintDialogOpen(false);
    setRefreshToken((t) => t + 1);
  };

  const onSubmitTask = (data: TaskInput) => {
    if (!selectedSprint) return;
    console.log(`Task criada na sprint ${selectedSprint.number}:`, data);
    // aqui você chama a rota de criar task se quiser
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

      {/* Use key to force remount when refreshToken changes (no need to change SprintList props) */}
      <SprintList key={refreshToken} project={project} onCreateTask={handleCreateTask} />

      <SprintCreateModal
        projectId={project.id}
        isOpen={isSprintDialogOpen}
        onClose={() => setIsSprintDialogOpen(false)}
        onSprintCreated={onSprintCreated}
        title="Nova Sprint"
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
