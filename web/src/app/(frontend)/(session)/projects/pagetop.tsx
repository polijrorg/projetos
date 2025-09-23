"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type PageTopProps = {
  onNewProject: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function PageTop({
  onNewProject,
  title = "Projetos",
  subtitle = "Gerencie todos os projetos da Poli Júnior e acompanhe o progresso",
  className,
}: PageTopProps) {
  return (
    <div className={cn("flex items-center justify-between mb-8", className)}>
      <div>
        <h1 className="font-poppins text-3xl font-bold text-foreground mb-2 pl-8">
          {title}
        </h1>
        <p className="text-muted-foreground font-poppins pl-8">
          {subtitle}
        </p>
      </div>

      <Button onClick={onNewProject} variant="hero">
        <Plus className="h-4 w-4 mr-2" />
        Novo Projeto
      </Button>
    </div>
  );
}
