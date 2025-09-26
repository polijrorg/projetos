"use client";

import type { Project } from "@/types";

const ProjectBacklog = ({ projectId, sprintCount }: { projectId: string; sprintCount: number }) => (
  <div className="p-4 border rounded-lg text-sm text-muted-foreground">
    Backlog do projeto {projectId} — {sprintCount} sprints (placeholder)
  </div>
);

export default function BacklogTab({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cronograma & Backlog</h2>
        <p className="text-muted-foreground">Planeje e organize as tasks por sprint</p>
      </div>
      <ProjectBacklog projectId={project.id} sprintCount={project.sprints.length || 4} />
    </div>
  );
}
