/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import NPSEmptyState from "./empty";
import NPSHeader from "./header";
import NPSResponseCard, { NPSResponseLite } from "./responseCard";

type ProjectLite = {
  id: string;
  name: string;
  client: string;
};

export default function SatisfactionResponsesPage() {
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectLite | null>(null);
  const [nps, setNps] = useState<NPSResponseLite | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        // Projeto
        const projRes = await fetch(`/api/projects/${projectId}`);
        if (!projRes.ok) throw new Error("Falha ao carregar projeto");
        const projData: ProjectLite = await projRes.json();
        if (!mounted) return;
        setProject(projData);

        // NPS do projeto
        const npsRes = await fetch(`/api/projects/${projectId}/nps`);
        if (npsRes.ok) {
          const npsData = (await npsRes.json()) as NPSResponseLite;
          if (!mounted) return;
          setNps(npsData);
        } else if (npsRes.status === 404) {
          if (!mounted) return;
          setNps(null);
        } else {
          const errJson = await npsRes.json().catch(() => ({}));
          throw new Error(errJson?.message || "Falha ao carregar NPS");
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

  const hasNPS = typeof nps?.npsScore === "number";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Projeto não encontrado</h1>
          {/* Se quiser, coloque um botão pra voltar ao dashboard */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <NPSHeader
          projectId={project.id}
          projectName={project.name}
          client={project.client}
          hasNPS={hasNPS}
        />

        {hasNPS && nps ? <NPSResponseCard response={nps} /> : <NPSEmptyState />}
      </div>
    </div>
  );
}
