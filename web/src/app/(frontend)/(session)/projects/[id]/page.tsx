"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { mockProjects } from "@/data/mockData";
import Header from "./pageheader";
import PageContent from "./pagecontent";
import { loadProjects } from "@/utils/storage/storage";

export default function ProjectPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // busca projeto do storage; fallback pro mock
  const storedProjects = loadProjects();
  let project = storedProjects.find((p) => p.id === id);
  if (!project) project = mockProjects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Projeto não encontrado</h1>
          <Button onClick={() => router.push("/projetos")}>Voltar para Projetos</Button>
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
