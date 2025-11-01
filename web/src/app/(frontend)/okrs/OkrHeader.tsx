"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Select } from "react-day-picker";

type Okrs = {
  id?: string;
  objective?: string;
  keyResults?: Array<{ id?: string; title?: string; progress?: number }>;
  period?: string;
};

type Props = {
  okrs: Okrs[];
  year: number;
  period: string;
  onChangePeriod: (p: string) => void;
};

export function OkrHeader({ okrs, year, period, onChangePeriod }: Props) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="justify-between flex items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">OKRs</h1>  
            <p className="text-muted-foreground">Objectives and Key Results - Acompanhe os objetivos estratégicos</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Nova OKR
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        <div className="space-y-2">
                  <Label htmlFor="period">Período</Label>
                  <Select value={period}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                      <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                      <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                      <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                      <SelectItem value="Semestre 1">Semestre 1</SelectItem>
                      <SelectItem value="Semestre 2">Semestre 2</SelectItem>
                      <SelectItem value="Ano 2024">Ano 2024</SelectItem>
                    </SelectContent>
                  </Select>
          </div>
      </div>
    </div>
  )
}