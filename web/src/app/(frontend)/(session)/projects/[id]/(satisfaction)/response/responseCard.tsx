"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getNPSVariant, getScoreVariant5 } from "@/utils/projects/ui-helpers";

export type NPSResponseLite = {
  id: string;
  projectId: string;
  clientName: string;
  clientNumber: string;
  responseDate: string; // ISO
  accordanceScore?: number | null;
  accordanceFeedback?: string | null;
  expectationsScore?: number | null;
  expectationsFeedback?: string | null;
  qualityScore?: number | null;
  qualityFeedback?: string | null;
  missingFeatures?: string | null;
  improvementSuggestions?: string | null;
  npsScore?: number | null;
  pmNotes?: string | null;
};

export default function NPSResponseCard({ response }: { response: NPSResponseLite }) {
  const npsVariant = getNPSVariant(response.npsScore ?? null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Pesquisa NPS
          </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={npsVariant} className="text-sm h-12 w-24">
              NPS: {typeof response.npsScore === "number" ? `${response.npsScore}/10` : "—"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {response.responseDate
                ? format(new Date(response.responseDate), "dd/MM/yyyy", { locale: ptBR })
                : "—"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Acordo Comercial</span>
                <Badge variant={getScoreVariant5(response.accordanceScore ?? null)}>
                  {response.accordanceScore ?? "—"}/5
                </Badge>
              </div>
              {response.accordanceFeedback && (
                <p className="text-sm text-muted-foreground">{response.accordanceFeedback}</p>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Expectativas</span>
                <Badge variant={getScoreVariant5(response.expectationsScore ?? null)}>
                  {response.expectationsScore ?? "—"}/5
                </Badge>
              </div>
              {response.expectationsFeedback && (
                <p className="text-sm text-muted-foreground">{response.expectationsFeedback}</p>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Qualidade</span>
                <Badge variant={getScoreVariant5(response.qualityScore ?? null)}>
                  {response.qualityScore ?? "—"}/5
                </Badge>
              </div>
              {response.qualityFeedback && (
                <p className="text-sm text-muted-foreground">{response.qualityFeedback}</p>
              )}
            </div>
          </div>

          {(response.missingFeatures || response.improvementSuggestions || response.pmNotes) && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Feedbacks adicionais</h4>
              <div className="space-y-3">
                {response.missingFeatures && (
                  <div>
                    <span className="text-sm font-medium">Recursos em falta:</span>
                    <p className="text-sm text-muted-foreground mt-1">{response.missingFeatures}</p>
                  </div>
                )}
                {response.improvementSuggestions && (
                  <div>
                    <span className="text-sm font-medium">Sugestões de melhoria:</span>
                    <p className="text-sm text-muted-foreground mt-1">{response.improvementSuggestions}</p>
                  </div>
                )}
                {response.pmNotes && (
                  <div>
                    <span className="text-sm font-medium">Notas PM:</span>
                    <p className="text-sm text-muted-foreground mt-1">{response.pmNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
