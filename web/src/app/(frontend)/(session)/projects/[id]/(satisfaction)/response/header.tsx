"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  projectName?: string;
  client?: string;
  hasNPS: boolean;
};

export default function NPSHeader({ projectId, projectName, client, hasNPS }: Props) {
  const router = useRouter();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="hero"
          size="sm"
          onClick={() => router.push(`/projects/${projectId}`)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">NPS do Projeto</h1>
          {(projectName || client) && (
            <p className="text-muted-foreground">
              {projectName ? `Projeto: ${projectName}` : ""} {client ? ` • Cliente: ${client}` : ""}
            </p>
          )}
        </div>

        {!hasNPS && (
          <Button
            onClick={() => router.push(`/projects/${projectId}/nps`)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <TrendingUp className="h-4 w-4" />
            Coletar NPS
          </Button>
        )}
      </div>
    </div>
  );
}
