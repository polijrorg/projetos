"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { ProjectComplete, SprintComplete } from "@/types";
import { SprintCreateModal } from "./SprintDialog";

export default function SprintsTab({ project }: { project: ProjectComplete }) {
  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<SprintComplete | null>(null);

  // dispara refetch no SprintList quando muda
  const [refreshToken, setRefreshToken] = useState(0);

  const handleCreateSprint = () => setIsSprintDialogOpen(true);

  const onSprintCreated = () => {
    // fecha o modal e força o SprintList a buscar novamente
    setIsSprintDialogOpen(false);
    setRefreshToken((t) => t + 1);
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


      <SprintCreateModal
        projectId={project.id}
        isOpen={isSprintDialogOpen}
        onClose={() => setIsSprintDialogOpen(false)}
        onSprintCreated={onSprintCreated}
        title="Nova Sprint"
      />
    </div>
  );
}
