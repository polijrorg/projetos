/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { ProjectComplete } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import type { Analyst } from "@/generated/prisma";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectComplete;
  onProjectUpdated: (p: ProjectComplete) => void;
};

type FormData = {
  name: string;
  client: string;
  description: string;
  startDate: Date | undefined;
  plannedEndDate: Date | undefined;
  saleDate: Date | undefined;
  endDate: Date | null | undefined; // null = limpar, undefined = não mexer
  price: string;
  sprintCount: string; // para espelhar o create visualmente
  analysts: (Pick<Analyst, "id" | "name" | "role"> | { name: string; role: Analyst["role"] })[];
};

export function ProjectEditModal({ isOpen, onClose, project, onProjectUpdated }: Props) {
  const initial: FormData = useMemo(() => ({
    name: project.name ?? "",
    client: project.client ?? "",
    description: project.shortDescription ?? "",
    startDate: project.startDate ? new Date(project.startDate as any) : undefined,
    plannedEndDate: project.plannedEndDate ? new Date(project.plannedEndDate as any) : undefined,
    saleDate: project.saleDate ? new Date(project.saleDate as any) : undefined,
    endDate: project.endDate ? new Date(project.endDate as any) : null,
    price: project.price != null ? String(project.price) : "",
    sprintCount: project.sprintNumber != null ? String(project.sprintNumber) : "",
    analysts: (project.analysts ?? []).map(a => ({ id: a.id, name: a.name, role: a.role })),
  }), [project]);

  const [formData, setFormData] = useState<FormData>(initial);
  const [saving, setSaving] = useState(false);

  // --- Analistas (igual ao create, com add/remove) ---
  const addAnalyst = () => {
    setFormData(prev => ({
      ...prev,
      analysts: [...prev.analysts, { name: "", role: "Front" }],
    }));
  };

  const removeAnalyst = (index: number) => {
    setFormData(prev => ({
      ...prev,
      analysts: prev.analysts.filter((_, i) => i !== index),
    }));
  };

  const updateAnalyst = (
    index: number,
    field: "name" | "role",
    value: string
  ) => {
    const next = [...formData.analysts];
    const current = next[index] as any;
    next[index] = { ...current, [field]: value };
    setFormData(prev => ({ ...prev, analysts: next }));
  };

  // --- Submit (PATCH) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: Record<string, any> = {
        name: formData.name.trim(),
        client: formData.client.trim(),
        shortDescription: formData.description.trim(),
        startDate: formData.startDate ?? undefined,
        plannedEndDate: formData.plannedEndDate ?? undefined,
        saleDate: formData.saleDate ?? undefined,
        // Se o usuário clicou em "limpar", endDate = null; se não mexer, undefined; se selecionar, a Date.
        endDate: formData.endDate === null ? null : (formData.endDate ?? undefined),
        price: formData.price !== "" ? Number(formData.price) : undefined,
        sprintNumber: formData.sprintCount !== "" ? Number(formData.sprintCount) : undefined,
        // IMPORTANTÍSSIMO:
        // - novos analistas SEM id => create
        // - existentes COM id => update
        // - quem não vier => delete (o serviço faz o diff)
        analysts: formData.analysts
          .filter(a => (a as any).name?.trim())
          .map((a: any) => ({
            ...(a.id ? { id: a.id } : {}), // mantém id se existir
            name: a.name,
            role: a.role,
          })),
      };

      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Falha ao atualizar (${res.status}) ${txt}`);
      }

      const updated: ProjectComplete = await res.json();
      onProjectUpdated(updated);
      onClose();
    } catch (err) {
      console.error("[ProjectEditModal] PATCH error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
        </DialogHeader>

        {/* Mesmo layout do Create */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome / Cliente */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(s => ({ ...s, name: e.target.value }))}
                placeholder="Nome do projeto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData(s => ({ ...s, client: e.target.value }))}
                placeholder="Nome do cliente"
                required
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(s => ({ ...s, description: e.target.value }))}
              placeholder="Descrição do projeto"
              rows={3}
            />
          </div>

          {/* Início / Fim planejado */}
          <div className="grid grid-cols-2 gap-4">
            {/* Início */}
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
                    onSelect={(date) => setFormData(s => ({ ...s, startDate: date ?? undefined }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Fim planejado */}
            <div className="space-y-2">
              <Label>Data de Fim *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.plannedEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.plannedEndDate
                      ? format(formData.plannedEndDate, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.plannedEndDate}
                    onSelect={(date) => setFormData(s => ({ ...s, plannedEndDate: date ?? undefined }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Venda / Finalização (endDate) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Venda */}
            <div className="space-y-2">
              <Label>Data de Venda *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.saleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.saleDate
                      ? format(formData.saleDate, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.saleDate}
                    onSelect={(date) => setFormData(s => ({ ...s, saleDate: date ?? undefined }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Finalização (endDate) */}
            <div className="space-y-2">
              <Label>Data de Finalização</Label>
              <div className="flex gap-2">
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
                      selected={formData.endDate ?? undefined}
                      onSelect={(date) => setFormData(s => ({ ...s, endDate: date ?? null }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {/* Limpar endDate -> envia null */}
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setFormData(s => ({ ...s, endDate: null }))}
                  title="Limpar data"
                  aria-label="Limpar data de finalização"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Deixe vazio se não estiver finalizado. Clique no “X” para salvar como <code>null</code>.
              </p>
            </div>
          </div>

          {/* Valor / Nº Sprints (mesmo visual do create) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Valor (R$)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(s => ({ ...s, price: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sprintCount">Número de Sprints</Label>
              <Input
                id="sprintCount"
                type="number"
                value={formData.sprintCount}
                onChange={(e) => setFormData(s => ({ ...s, sprintCount: e.target.value }))}
                placeholder="4"
                min="1"
              />
            </div>
          </div>

          {/* Analistas (id opcional) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Analistas</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAnalyst}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Analista
              </Button>
            </div>

            {formData.analysts.map((analyst, index) => (
              <div key={(analyst as any).id ?? `new-${index}`} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    placeholder="Nome do analista"
                    value={(analyst as any).name}
                    onChange={(e) => updateAnalyst(index, "name", e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <select
                    className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm"
                    value={(analyst as any).role}
                    onChange={(e) => updateAnalyst(index, "role", e.target.value)}
                  >
                    <option value="Front">Front</option>
                    <option value="Back">Back</option>
                    <option value="PM">PM</option>
                    <option value="Coord">Coord</option>
                  </select>
                </div>
                {formData.analysts.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAnalyst(index)}
                    title="Remover analista"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="cancel" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button variant="hero" type="submit" className="flex-1" disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
