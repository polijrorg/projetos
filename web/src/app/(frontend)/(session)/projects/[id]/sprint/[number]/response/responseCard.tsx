"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getNPSVariant, getScoreVariant5 } from "@/utils/projects/ui-helpers";

export type CSATResponseLite = {
  id: string;
  teamCommunicationScore: number;
  teamCommunicationFeedback: string;
  qualityScore: number;
  qualityFeedback: string;
  overallSatisfactionScore: number;
  improvementSuggestions: string;
  responseDate: string;
};

export default function CSATResponseCard({ response }: { response: CSATResponseLite }) {

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Coleta de CSAT
          </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getScoreVariant5(response.overallSatisfactionScore)} className="text-sm h-12 w-24">
              CSAT: {typeof response.overallSatisfactionScore === "number" ? `${response.overallSatisfactionScore}/5` : "—"}
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
                <span className="text-sm font-medium">Comunicação da equipe</span>
                <Badge variant={getScoreVariant5(response.teamCommunicationScore ?? null)}>
                  {response.teamCommunicationScore ?? "—"}/5
                </Badge>
              </div>
              {response.teamCommunicationFeedback && (
                <p className="text-sm text-muted-foreground">{response.teamCommunicationFeedback}</p>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Qualidade da entrega</span>
                <Badge variant={getScoreVariant5(response.qualityScore ?? null)}>
                  {response.qualityScore ?? "—"}/5
                </Badge>
              </div>
              {response.qualityFeedback && (
                <p className="text-sm text-muted-foreground">{response.qualityFeedback}</p>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Satisfação como um todo</span>
                <Badge variant={getScoreVariant5(response.overallSatisfactionScore ?? null)}>
                  {response.overallSatisfactionScore ?? "—"}/5
                </Badge>
              </div>
            </div>
          </div>

          {(response.improvementSuggestions) && (
            <div className="border-t pt-4">
              <div className="space-y-3">
                {response.improvementSuggestions && (
                  <div>
                    <span className="text-sm font-medium">Sugestões de melhoria:</span>
                    <p className="text-sm text-muted-foreground mt-1">{response.improvementSuggestions}</p>
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
