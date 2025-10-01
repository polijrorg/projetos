"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function NPSEmptyState() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">NPS não coletado.</p>
      </CardContent>
    </Card>
  );
}
