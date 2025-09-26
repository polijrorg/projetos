"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProgressPanel({
  temporalProgress,
  csatProgress,
}: {
  temporalProgress: number;
  csatProgress: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso do Projeto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso Temporal</span>
              <span>{temporalProgress}%</span>
            </div>
            <Progress value={temporalProgress} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Coleta CSAT</span>
              <span>{csatProgress}%</span>
            </div>
            <Progress value={csatProgress} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
