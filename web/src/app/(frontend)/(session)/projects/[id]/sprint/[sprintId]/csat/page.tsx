"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star } from "lucide-react";
import { mockProjects } from "@/data/mockData";
import { CSATResponse } from "@/types";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { loadProjects, saveCSATResponse } from "@/utils/storage/storage";
import { toast } from "sonner";


const ScoreButton = ({ score, selected, onClick }: { score: number; selected: boolean; onClick: () => void }) => (
  <Button
    type="button"
    variant={selected ? "hero" : "outline"}
    size="lg"
    onClick={onClick}
    className={`cursor-pointer w-16 h-16 text-lg font-bold ${selected ? 'shadow-lg' : ''}`}
  >
    {score}
  </Button>
);

export default function CSATForm() {
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const sprintNumber = Array.isArray(params.sprintId) ? params.sprintId[0] : (params.sprintId as string);
  const router = useRouter();
  
  const [form, setForm] = useState({
    clientName: "",
    teamCommunicationScore: 0,
    teamCommunicationFeedback: "",
    qualityScore: 0,
    qualityFeedback: "",
    overallSatisfactionScore: 0,
    suggestions: ""
  });

  // Get project and sprint info
  const storedProjects = loadProjects();
  let project = storedProjects.find(p => p.id === projectId);
  if (!project) {
    project = mockProjects.find(p => p.id === projectId);
  }
  const sprint = project?.sprints?.find(s => s.number === Number(sprintNumber));

  if (!project || !sprint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sprint não encontrada</h1>
          <Button onClick={() => router.push("/")}>Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.teamCommunicationScore === 0 || form.qualityScore === 0 || form.overallSatisfactionScore === 0) {
    toast.error("Erro", {
      description: "Por favor, preencha todas as avaliações obrigatórias.",
    });
      return;
    }

    const csatResponse: CSATResponse = {
      id: `csat-${Date.now()}`,
      sprintId: sprint.id,
      projectId: project.id,
      responseDate: new Date(),
      teamCommunicationScore: form.teamCommunicationScore,
      teamCommunicationFeedback: form.teamCommunicationFeedback,
      qualityScore: form.qualityScore,
      qualityFeedback: form.qualityFeedback,
      overallSatisfactionScore: form.overallSatisfactionScore,
      averageScore: (form.teamCommunicationScore + form.qualityScore + form.overallSatisfactionScore) / 3,
      uniqueToken: `csat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    saveCSATResponse(csatResponse);
    
    toast.success("CSAT Coletado", {
      description: "Avaliação registrada com sucesso!",
    });

    router.push(`/projeto/${projectId}/sprint/${sprintNumber}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6  pt-10">
          <Button
            variant="hero"
            size="sm"
            onClick={() => router.push(`/projeto/${projectId}/sprint/${sprintNumber}`)}
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
              Coleta de CSAT - Sprint {sprint.number}
            </CardTitle>
            <p className="text-muted-foreground">
              Projeto: {project.name} • Cliente: {project.client}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Introdução</h3>
                <p className="text-muted-foreground mb-4">
                  "Olá {form.clientName || project.client}! Boa tarde!
                </p>
                <p className="text-muted-foreground mb-4">
                  Sou o validador do projeto que estamos realizando com vocês. Venho aqui hoje para fazer uma coleta da sua avaliação em relação à nossa execução até agora."
                </p>
                <p className="text-muted-foreground">
                  "Para isso, peço por favor que nos avalie com uma nota de 1 (pior) a 5 (melhor) em 3 critérios:"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente (opcional)</Label>
                <Input
                  id="clientName"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  placeholder="Nome do contato"
                />
              </div>

              <div className="space-y-6">
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
                        onClick={() => setForm({ ...form, teamCommunicationScore: score })}
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
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold mb-4">
                    2. De 1 a 5, como você avaliaria a sua satisfação com a qualidade da entrega da Poli Júnior até então?
                  </h4>
                  
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <ScoreButton
                        key={score}
                        score={score}
                        selected={form.qualityScore === score}
                        onClick={() => setForm({ ...form, qualityScore: score })}
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
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold mb-4">
                    3. Como você avaliaria a sua satisfação com o trabalho da Poli Júnior como um todo?
                  </h4>
                  
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <ScoreButton
                        key={score}
                        score={score}
                        selected={form.overallSatisfactionScore === score}
                        onClick={() => setForm({ ...form, overallSatisfactionScore: score })}
                      />
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold mb-4">
                    4. Você possui alguma sugestão para a nossa equipe?
                  </h4>
                  
                  <Textarea
                    value={form.suggestions}
                    onChange={(e) => setForm({ ...form, suggestions: e.target.value })}
                    placeholder="Sugestões de melhoria ou comentários adicionais..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="cancel"
                  onClick={() => router.push(`/projeto/${projectId}/sprint/${sprintNumber}`)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="hero">
                  Enviar Avaliação CSAT
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}