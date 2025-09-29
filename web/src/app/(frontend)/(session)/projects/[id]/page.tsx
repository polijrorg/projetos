"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { mockProjects } from "@/data/mockData";
import Header from "./pageheader";
import PageContent from "./pagecontent";
import { useEffect, useState } from "react";
import { getProjectById } from "./api";

export default function ProjectPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

    const [project, setProject] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const p = await getProjectById(id);
        setProject(p); // pode ser null se 404
      } catch (e: any) {
        setError(e?.message ?? "Erro ao carregar projeto");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p>Carregando…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Projeto não encontrado</h1>
          <Button onClick={() => router.push("/projects")}>Voltar para Projetos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header project={project} onBack={() => router.push("/projetos")} />
      <PageContent project={project} />
    </div>
  );
}
