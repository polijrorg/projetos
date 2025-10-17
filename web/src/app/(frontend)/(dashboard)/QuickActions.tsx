// components/dashboard/QuickActions.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Lightbulb, Target } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickActions() {
  const router = useRouter()
  const handleViewOkrs = () => {
    router.push("/okrs")
  }
  return (
    <div className="bg-gradient-secondary/10 border border-poli-yellow/20 rounded-2xl p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-poli-yellow/10 rounded-lg">
          <Lightbulb className="h-6 w-6 text-poli-yellow" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">Dicas de Produtividade</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Mantenha seus projetos atualizados e colete feedback regularmente para aumentar as chances de ENB.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleViewOkrs()}>
              <Target className="h-4 w-4 mr-2" />
              Ver OKRs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
