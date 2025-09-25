"use client";

import { useState } from "react";
import type { Project, Sprint, TaskPriority, TaskType } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BacklogTab from "./(backlog)/BacklogTab";
import MetricsTab from "./(metrics)/MetricsTab";
import OverviewTab from "./(overview)/OverviewTab";
import SatisfactionTab from "./(satisfaction)/SatisfactionTab";
import SprintsTab from "./(sprint)/SprintTab";
import TeamTab from "./(team)/TeamTab";
import HandoffTab from "./(handoff)/HandoffTab";

type Props = { project: Project };

export default function PageContent({ project }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="sprints">Sprints & Tasks</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="handoff">Handoff</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab project={project} />
        </TabsContent>

        <TabsContent value="backlog">
          <BacklogTab project={project} />
        </TabsContent>

        <TabsContent value="sprints">
          <SprintsTab project={project} />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab project={project} />
        </TabsContent>

        <TabsContent value="handoff">
          <HandoffTab project={project} />
        </TabsContent>

        <TabsContent value="metrics">
          <MetricsTab project={project} />
        </TabsContent>

        <TabsContent value="satisfaction">
          <SatisfactionTab project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
