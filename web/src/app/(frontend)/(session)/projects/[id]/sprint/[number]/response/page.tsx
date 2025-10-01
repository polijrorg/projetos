/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import CSATEmptyState from "./empty";
import CSATHeader from "./header";
import CSATResponseCard, { CSATResponseLite } from "./responseCard";

type SprintLite = {
  id: string;
  sprintNumber: number;
  projectName: string;
  projectId: string;
};

export default function SatisfactionResponsesPage() {
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const sprintNumber = Number(Array.isArray(params.number) ? params.number[0] : (params.number as string));

  const [loading, setLoading] = useState(true);
  const [sprint, setSprint] = useState<SprintLite | null>(null);
  const [csat, setCsat] = useState<CSATResponseLite | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        // Sprint
        const projRes = await fetch(`/api/projects/${projectId}/sprint/${sprintNumber}`);
        if (!projRes.ok) throw new Error("Falha ao carregar projeto");
        const projData: SprintLite = await projRes.json();
        if (!mounted) return;
        setSprint(projData);

        // CSAT do projeto
        const npsRes = await fetch(`/api/projects/${projectId}/sprint/${sprintNumber}/csat`);
        if (npsRes.ok) {
          const npsData = (await npsRes.json()) as CSATResponseLite;
          if (!mounted) return;
          setCsat(npsData);
        } else if (npsRes.status === 404) {
          if (!mounted) return;
          setCsat(null);
        } else {
          const errJson = await npsRes.json().catch(() => ({}));
          throw new Error(errJson?.message || "Falha ao carregar CSAT");
        }
      } catch (err: any) {
        toast.error("Erro ao carregar dados", { description: err?.message ?? "Tente novamente." });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  const hasCSAT = typeof csat?.overallSatisfactionScore === "number";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sprint não encontrada</h1>
          {/* Se quiser, coloque um botão pra voltar ao dashboard */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <CSATHeader
          sprintNumber={sprint.sprintNumber}
          projectName={sprint.projectName}
          projectId={sprint.projectId}
          hasCSAT={hasCSAT}
        />

        {hasCSAT && csat ? <CSATResponseCard response={csat} /> : <CSATEmptyState />}
      </div>
    </div>
  );
}
