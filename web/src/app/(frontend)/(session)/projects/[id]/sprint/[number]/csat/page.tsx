/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

// --- UI helpers ---
const ScoreButton = ({
  score,
  selected,
  onClick,
}: { score: number; selected: boolean; onClick: () => void }) => (
  <Button
    type="button"
    variant={selected ? "hero" : "outline"}
    size="lg"
    onClick={onClick}
    className={`cursor-pointer w-16 h-16 text-lg font-bold ${selected ? "shadow-lg" : ""}`}
  >
    {score}
  </Button>
);

// --- Tipagens mínimas ---
type ProjectLite = { id: string; name: string; client: string };
type SprintLite = { id: string; number: number };
type CSATLite = { id: string };

export default function CSATForm() {
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const sprintNumber = Number(Array.isArray(params.number) ? params.number[0] : (params.number as string));
  const router = useRouter();

  const [project, setProject] = useState<ProjectLite | null>(null);
  const [sprint, setSprint] = useState<SprintLite | null>(null);

  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [hasCSAT, setHasCSAT] = useState(false);
  const [csat, setCsat] = useState<CSATLite | null>(null);

  const [form, setForm] = useState({
    clientName: "", // só para copy/roteiro, não vai para o backend
    teamCommunicationScore: 0,
    teamCommunicationFeedback: "",
    qualityScore: 0,
    qualityFeedback: "",
    overallSatisfactionScore: 0,
    suggestions: "", // só para copy/roteiro, não vai para o backend
  });

  // Carrega projeto + sprint e verifica se já existe CSAT para a sprint
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingProject(true);

        // Projeto
        const projRes = await fetch(`/api/projects/${projectId}`, { method: "GET" });
        if (!projRes.ok) throw new Error("Falha ao carregar projeto");
        const projData: ProjectLite = await projRes.json();
        if (!mounted) return;
        setProject(projData);

        // Sprint
        const sprintRes = await fetch(`/api/projects/${projectId}/sprint/${sprintNumber}`, { method: "GET" });
        if (!sprintRes.ok) throw new Error("Falha ao carregar sprint");
        const sprintData: SprintLite = await sprintRes.json();
        if (!mounted) return;
        setSprint(sprintData);

        // CSAT existente
        const csatRes = await fetch(`/api/projects/${projectId}/sprint/${sprintNumber}/csat`, { method: "GET" });
        if (csatRes.ok) {
          const csatData: CSATLite = await csatRes.json();
          if (!mounted) return;
          setHasCSAT(true);
          setCsat(csatData);
        } else if (csatRes.status !== 404) {
          const errJson = await csatRes.json().catch(() => ({}));
          toast.error("Erro ao verificar CSAT", { description: errJson?.message ?? "Tente novamente." });
        }
      } catch (err: any) {
        toast.error("Erro ao carregar dados", { description: err?.message ?? "Tente novamente." });
      } finally {
        if (mounted) setLoadingProject(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [projectId, sprintNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasCSAT) {
      // Se já existe, navega para a página da sprint (ou para uma página de "ver CSAT" caso tenha)
      router.push(`/projects/${projectId}/sprint/${sprintNumber}`);
      return;
    }

    if (
      form.teamCommunicationScore === 0 ||
      form.qualityScore === 0 ||
      form.overallSatisfactionScore === 0
    ) {
      toast.error("Erro", { description: "Preencha todas as avaliações obrigatórias (1 a 5)." });
      return;
    }

    try {
      setLoadingSubmit(true);

      const payload = {
        // responseDate é opcional no backend; mandar ISO por consistência
        responseDate: new Date().toISOString(),
        teamCommunicationScore: form.teamCommunicationScore,
        teamCommunicationFeedback: form.teamCommunicationFeedback || "",
        qualityScore: form.qualityScore,
        qualityFeedback: form.qualityFeedback || "",
        overallSatisfactionScore: form.overallSatisfactionScore,
      };

      const res = await fetch(`/api/projects/${projectId}/sprint/${sprintNumber}/csat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.message || "Falha ao enviar a pesquisa");
      }

      const created: CSATLite = await res.json();
      setHasCSAT(true);
      setCsat(created);

      toast.success("CSAT coletado", { description: "Avaliação registrada com sucesso!" });
      // Não redireciona agora; botão muda para "Ver CSAT" (vai para a página da sprint)
    } catch (err: any) {
      toast.error("Erro ao enviar CSAT", { description: err?.message ?? "Tente novamente." });
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  if (!project || !sprint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Projeto/Sprint não encontrados</h1>
          <Button onClick={() => router.push("/")} className="cursor-pointer">Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6 pt-10">
          <Button
            variant="hero"
            size="sm"
            onClick={() => router.push(`/projects/${projectId}/sprint/${sprintNumber}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              {hasCSAT ? "CSAT já coletado" : `Coleta de CSAT — Sprint ${sprint.number}`}
            </CardTitle>
            <p className="text-muted-foreground">
              Projeto: {project.name} • Cliente: {project.client}
            </p>
            {hasCSAT && (
              <p className="text-sm text-muted-foreground">
                Já existe uma resposta de CSAT para esta sprint.
              </p>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Roteiro (opcional) */}
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Introdução</h3>
                <p className="text-muted-foreground mb-4">
                  Olá {form.clientName || project.client}! Tudo bem? Gostaríamos de registrar rapidamente sua satisfação
                  com a sprint atual em 3 critérios (1 = pior, 5 = melhor).
                </p>
              </div>

              {/* Nome do cliente (apenas para roteiro) */}
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente (opcional)</Label>
                <Input
                  id="clientName"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  placeholder="Nome do contato"
                  disabled={hasCSAT}
                />
              </div>

              {/* Bloco 1 */}
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold mb-4">
                  1. Em uma escala de 1 a 5, qual o grau de satisfação com a equipe e a comunicação no projeto?
                </h4>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <ScoreButton
                      key={score}
                      score={score}
                      selected={form.teamCommunicationScore === score}
                      onClick={() => !hasCSAT && setForm({ ...form, teamCommunicationScore: score })}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamFeedback">Por que? (opcional)</Label>
                  <Textarea
                    id="teamFeedback"
                    value={form.teamCommunicationFeedback}
                    onChange={(e) => setForm({ ...form, teamCommunicationFeedback: e.target.value })}
                    placeholder="Descreva sua experiência com a equipe e comunicação..."
                    rows={3}
                    disabled={hasCSAT}
                  />
                </div>
              </div>

              {/* Bloco 2 */}
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold mb-4">
                  2. De 1 a 5, como você avaliaria a qualidade das entregas até então?
                </h4>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <ScoreButton
                      key={score}
                      score={score}
                      selected={form.qualityScore === score}
                      onClick={() => !hasCSAT && setForm({ ...form, qualityScore: score })}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualityFeedback">Por que? (opcional)</Label>
                  <Textarea
                    id="qualityFeedback"
                    value={form.qualityFeedback}
                    onChange={(e) => setForm({ ...form, qualityFeedback: e.target.value })}
                    placeholder="Descreva sua experiência com a qualidade das entregas..."
                    rows={3}
                    disabled={hasCSAT}
                  />
                </div>
              </div>

              {/* Bloco 3 */}
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold mb-4">
                  3. Como você avaliaria a sua satisfação geral com o trabalho da equipe?
                </h4>
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <ScoreButton
                      key={score}
                      score={score}
                      selected={form.overallSatisfactionScore === score}
                      onClick={() => !hasCSAT && setForm({ ...form, overallSatisfactionScore: score })}
                    />
                  ))}
                </div>
              </div>

              {/* Sugestões (não persiste, só para roteiro) */}
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold mb-4">4. Sugestões para a equipe (opcional)</h4>
                <Textarea
                  value={form.suggestions}
                  onChange={(e) => setForm({ ...form, suggestions: e.target.value })}
                  placeholder="Sugestões de melhoria ou comentários adicionais..."
                  rows={4}
                  disabled={hasCSAT}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="cancel"
                  onClick={() => router.push(`/projects/${projectId}/sprint/${sprintNumber}`)}
                  className="cursor-pointer"
                  disabled={loadingSubmit}
                >
                  Cancelar
                </Button>

                {hasCSAT ? (
                  <Button
                    type="button"
                    className="cursor-pointer"
                    variant="hero"
                    onClick={() => router.push(`/projects/${projectId}/sprint/${sprintNumber}`)}
                  >
                    Ver CSAT
                  </Button>
                ) : (
                  <Button type="submit" className="cursor-pointer" variant="hero" disabled={loadingSubmit}>
                    {loadingSubmit ? "Enviando..." : "Enviar Avaliação CSAT"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
