"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
// use o MESMO import do modal de projetos:

interface SprintCreateModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSprintCreated: () => void;
  title?: string;
}

interface SprintFormData {
  number: string;                 // string no form; convertemos no submit
  capacityHours: string;               // idem
  startDate: Date | undefined;
  endDate: Date | undefined;
  goals: string[];
}

const EMPTY_SPRINT: SprintFormData = {
  number: "1",
  capacityHours: "40",
  startDate: undefined,
  endDate: undefined,
  goals: [""],
};

export function SprintCreateModal({
  projectId,
  isOpen,
  onClose,
  onSprintCreated,
  title = "Nova Sprint",
}: SprintCreateModalProps) {
  const [formData, setFormData] = useState<SprintFormData>(EMPTY_SPRINT);

  const addGoal = () => setFormData((f) => ({ ...f, goals: [...f.goals, ""] }));
  const removeGoal = (index: number) =>
    setFormData((f) => ({ ...f, goals: f.goals.filter((_, i) => i !== index) }));
  const updateGoal = (index: number, value: string) =>
    setFormData((f) => ({ ...f, goals: f.goals.map((g, i) => (i === index ? value : g)) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validações básicas
    if (!formData.startDate || !formData.endDate) {
      alert("Selecione as datas de início e fim da sprint.");
      return;
    }
    if (isAfter(formData.startDate, formData.endDate)) {
      alert("A data de fim deve ser posterior à data de início.");
      return;
    }
    const number = parseInt(formData.number || "0", 10);
    if (Number.isNaN(number) || number < 1) {
      alert("Informe um número de sprint válido (>= 1).");
      return;
    }

    const capacityHours = parseInt(formData.capacityHours || "0", 10) || 0;

    const payload = {
      number,
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
      goals: formData.goals.map((g) => g.trim()).filter(Boolean),
      capacityHours: (formData.capacityHours ?? "").toString().trim(), // se o backend aceitar; se não, remova este campo
    };

    await fetch(`/api/projects/${projectId}/sprint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // reset do form
    setFormData(EMPTY_SPRINT);

    onSprintCreated();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sprint-number">Número da Sprint *</Label>
              <Input
                id="sprint-number"
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sprint-capacity">Capacidade (horas)</Label>
              <Input
                id="sprint-capacity"
                type="number"
                value={formData.capacityHours}
                onChange={(e) => setFormData({ ...formData, capacityHours: e.target.value })}
                placeholder="40"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate
                      ? format(formData.startDate, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData({ ...formData, startDate: date ?? undefined })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Fim *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate
                      ? format(formData.endDate, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData({ ...formData, endDate: date ?? undefined })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Objetivos da Sprint</Label>
              <Button type="button" variant="outline" size="sm" onClick={addGoal}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Objetivo
              </Button>
            </div>

            <div className="space-y-2">
              {formData.goals.map((goal, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={goal}
                    onChange={(e) => updateGoal(index, e.target.value)}
                    placeholder={`Objetivo ${index + 1}`}
                  />
                  {formData.goals.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeGoal(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="cancel" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button variant="hero" type="submit" className="flex-1">
              Criar Sprint
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
