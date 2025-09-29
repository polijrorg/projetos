"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { mockProjects } from "@/data/mockData";
import { NPSResponse } from "@/types";
import { useRouter, useParams } from "next/navigation";
import { loadProjects, saveNPSResponse } from ";
import { toast } from "sonner";

const ScoreButton = ({ score, selected, onClick }: { score: number; selected: boolean; onClick: () => void }) => (
  <Button
    type="button"
    variant={selected ? "hero" : "outline"}
    size="lg"
    onClick={onClick}
    className={` cursor-pointer w-16 h-16 text-lg font-bold ${selected ? 'shadow-lg' : ''}`}
  >
    {score}
  </Button>
);

const NPSButton = ({ score, selected, onClick }: { score: number; selected: boolean; onClick: () => void }) => {
  const getColor = (score: number) => {
    if (score <= 6) return "destructive"; // Detractors
    if (score <= 8) return "npsNeutral"; // Neutrals
    return "success"; // Promoters
  };

  return (
    <Button
      type="button"
      variant={selected ? getColor(score) : "outline"}
      size="lg"
      onClick={onClick}
      className={` cursor-pointer w-12 h-12 text-sm font-bold ${selected ? 'shadow-lg' : ''}`}
    >
      {score}
    </Button>
  );
};

export default function NPSForm() {
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const router = useRouter();
  
  const [form, setForm] = useState({
    clientName: "",
    clientNumber: "",
    accordanceScore: 0,
    accordanceFeedback: "",
    expectationsScore: 0,
    expectationsFeedback: "", 
    qualityScore: 0,
    qualityFeedback: "",
    missingFeatures: "",
    improvementSuggestions: "",
    npsScore: 0,
    pmNotes: ""
  });

  // Get project info
  const storedProjects = loadProjects();
  let project = storedProjects.find(p => p.id === projectId);
  if (!project) {
    project = mockProjects.find(p => p.id === projectId);
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Projeto não encontrado</h1>
          <Button onClick={() => router.push("/")}>Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (
    form.accordanceScore === 0 ||
    form.expectationsScore === 0 ||
    form.qualityScore === 0 ||
    form.npsScore === 0
  ) {
    toast.error("Erro", {
      description: "Por favor, preencha todas as avaliações obrigatórias.",
    });
    return;
  }

  const now = Date.now();

  const npsResponse: NPSResponse = {
    id: `nps-${now}`,
    projectId: project.id,
    responseDate: new Date(),
    accordanceScore: form.accordanceScore,
    accordanceFeedback: form.accordanceFeedback,
    expectationsScore: form.expectationsScore,
    expectationsFeedback: form.expectationsFeedback,
    qualityScore: form.qualityScore,
    qualityFeedback: form.qualityFeedback,
    missingFeatures: form.missingFeatures,
    improvementSuggestions: form.improvementSuggestions,
    npsScore: form.npsScore,
    pmNotes: form.pmNotes,
    uniqueToken: `nps-${now}-${Math.random().toString(36).slice(2, 11)}`
  };

  saveNPSResponse(npsResponse);

  toast.success("NPS Coletado", {
    description: "Pesquisa de satisfação registrada com sucesso!",
  });

  router.push(`/projects/${projectId}`);
};

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6 pt-10">
          <Button
            variant="hero"
            size="sm"
            onClick={() => router.push(`/projects/${projectId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Coleta de NPS
            </CardTitle>
            <p className="text-muted-foreground">
              Projeto: {project.name} • Cliente: {project.client}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Roteiro de Coleta</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Boa tarde, {form.clientName || project.client}! Sou o representante da área de satisfação do cliente na Poli Júnior.
                  </p>
                  <p>
                    Estou entrando em contato para coletar percepções a respeito da sua experiência com o {project.name}. Você teria 2 minutos agora para conversar?
                  </p>
                  <p>
                    Perfeito! Em primeiro lugar gostaria de ouvir suas percepções em relação ao projeto.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input
                  id="clientName"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  placeholder="Nome do contato"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Número do cliente</Label>
                <Input
                  id="clientNumber"
                  value={form.clientNumber}
                  onChange={(e) => setForm({ ...form, clientNumber: e.target.value })}
                  placeholder="Número do contato"
                />
              </div>

              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold mb-4">
                    1. Em uma escala de 1 a 5, o quanto a equipe do projeto atendeu o que foi acordado no processo comercial?
                  </h4>
                  
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <ScoreButton
                        key={score}
                        score={score}
                        selected={form.accordanceScore === score}
                        onClick={() => setForm({ ...form, accordanceScore: score })}
                      />
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accordanceFeedback">Por que? (opcional)</Label>
                    <Textarea
                      id="accordanceFeedback"
                      value={form.accordanceFeedback}
                      onChange={(e) => setForm({ ...form, accordanceFeedback: e.target.value })}
                      placeholder="Descreva como foi o atendimento ao acordado..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold mb-4">
                    2. De 1 a 5, o quanto a equipe da Poli Júnior atendeu suas expectativas e necessidades?
                  </h4>
                  
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <ScoreButton
                        key={score}
                        score={score}
                        selected={form.expectationsScore === score}
                        onClick={() => setForm({ ...form, expectationsScore: score })}
                      />
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expectationsFeedback">Por que? (opcional)</Label>
                    <Textarea
                      id="expectationsFeedback"
                      value={form.expectationsFeedback}
                      onChange={(e) => setForm({ ...form, expectationsFeedback: e.target.value })}
                      placeholder="Descreva como suas expectativas foram atendidas..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold mb-4">
                    3. De 1 a 5, como você avalia a qualidade das entregas feitas no projeto?
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
                      placeholder="Descreva a qualidade das entregas..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold mb-4">
                    4. Você sentiu falta de algo no projeto? Como você acredita que podemos melhorar nossa entrega de valor?
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="missingFeatures">O que sentiu falta?</Label>
                      <Textarea
                        id="missingFeatures"
                        value={form.missingFeatures}
                        onChange={(e) => setForm({ ...form, missingFeatures: e.target.value })}
                        placeholder="Descreva o que sentiu falta no projeto..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="improvementSuggestions">Sugestões de melhoria</Label>
                      <Textarea
                        id="improvementSuggestions"
                        value={form.improvementSuggestions}
                        onChange={(e) => setForm({ ...form, improvementSuggestions: e.target.value })}
                        placeholder="Como podemos melhorar nossa entrega de valor..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold mb-4">
                    5. Em uma escala de 0 a 10, o quanto você indicaria nossa empresa para um amigo ou colega?
                  </h4>
                  
                  <div className="grid grid-cols-11 gap-1 mb-4">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <NPSButton
                        key={score}
                        score={score}
                        selected={form.npsScore === score}
                        onClick={() => setForm({ ...form, npsScore: score })}
                      />
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground mb-4">
                    <span>Muito improvável</span>
                    <span>Muito provável</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pmNotes">Anotações PM (opcional)</Label>
                    <Textarea
                      id="pmNotes"
                      value={form.pmNotes}
                      onChange={(e) => setForm({ ...form, pmNotes: e.target.value })}
                      placeholder="Há alguma dificuldade que você está passando na sua empresa com a qual conseguimos auxiliar? Gostaria de conhecer nossa carta de serviços?"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Ótimo, muito obrigado pela atenção, {form.clientName || project.client}, vamos encaminhar em breve o Termo de Encerramento de Projeto, qualquer dúvida estamos à disposição!
                </p>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="cancel"
                  onClick={() => router.push(`/projects/${projectId}`)}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="cursor-pointer" variant="hero">
                  Enviar Pesquisa NPS
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}