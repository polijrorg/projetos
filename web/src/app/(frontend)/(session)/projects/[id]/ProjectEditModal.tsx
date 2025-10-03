/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
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
  startDate?: Date | null;
  plannedEndDate?: Date | null;
  saleDate?: Date | null;
  endDate?: Date | null;          // NEW: endDate no form
  price?: string;
  sprintNumber?: string;
  analysts: Pick<Analyst, "id" | "name" | "role">[];
};

export function ProjectEditModal({ isOpen, onClose, project, onProjectUpdated }: Props) {
  const initial: FormData = useMemo(() => ({
    name: project.name ?? "",
    client: project.client ?? "",
    description: project.shortDescription ?? "",
    startDate: project.startDate ? new Date(project.startDate as any) : undefined,
    plannedEndDate: project.plannedEndDate ? new Date(project.plannedEndDate as any) : undefined,
    saleDate: project.saleDate ? new Date(project.saleDate as any) : undefined,
    endDate: project.endDate ? new Date(project.endDate as any) : null,       // NEW: inicializa endDate
    price: project.price != null ? String(project.price) : "",
    sprintNumber: project.sprintNumber != null ? String(project.sprintNumber) : "",
    analysts: (project.analysts ?? []).map(a => ({ id: a.id, name: a.name, role: a.role })),
  }), [project]);

  const [form, setForm] = useState<FormData>(initial);
  const [saving, setSaving] = useState(false);

  const updateAnalyst = (i: number, field: keyof FormData["analysts"][number], value: string) => {
    const next = [...form.analysts];
    next[i] = { ...next[i], [field]: value };
    setForm(prev => ({ ...prev, analysts: next }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: Record<string, any> = {
        name: form.name.trim(),
        client: form.client.trim(),
        shortDescription: form.description.trim(),
        startDate: form.startDate ?? undefined,
        plannedEndDate: form.plannedEndDate ?? undefined,
        saleDate: form.saleDate ?? undefined,
        endDate: form.endDate === null ? null : (form.endDate ?? undefined),  // NEW: envia null se limpar
        price: form.price !== "" ? Number(form.price) : undefined,
        sprintNumber: form.sprintNumber !== "" ? Number(form.sprintNumber) : undefined,
        analysts: form.analysts.map(a => ({ id: a.id, name: a.name, role: a.role })),
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

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                placeholder="Nome do projeto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Input
                id="client"
                value={form.client}
                onChange={(e) => setForm(s => ({ ...s, client: e.target.value }))}
                placeholder="Nome do cliente"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
              placeholder="Descrição do projeto"
              rows={3}
            />
          </div>

          {/* Datas principais */}
          <div className="grid grid-cols-2 gap-4">
            {/* Início */}
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.startDate ? format(form.startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.startDate ?? undefined}
                    onSelect={(date) => setForm(s => ({ ...s, startDate: date ?? null }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Fim planejado */}
            <div className="space-y-2">
              <Label>Data de Fim (planejada)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.plannedEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.plannedEndDate ? format(form.plannedEndDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.plannedEndDate ?? undefined}
                    onSelect={(date) => setForm(s => ({ ...s, plannedEndDate: date ?? null }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Linha com saleDate e endDate */}
          <div className="grid grid-cols-2 gap-4">
            {/* Data de venda */}
            <div className="space-y-2">
              <Label>Data de Venda</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.saleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.saleDate ? format(form.saleDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.saleDate ?? undefined}
                    onSelect={(date) => setForm(s => ({ ...s, saleDate: date ?? null }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* NEW: Data de Finalização (endDate) */}
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
                        !form.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.endDate ? format(form.endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.endDate ?? undefined}
                      onSelect={(date) => setForm(s => ({ ...s, endDate: date ?? null }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {/* Botão para limpar = envia null */}
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setForm(s => ({ ...s, endDate: null }))}
                  title="Limpar data"
                  aria-label="Limpar data de finalização"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Deixe em branco se o projeto não estiver finalizado. Clique em “X” para limpar (salva como <code>null</code>).
              </p>
            </div>
          </div>

          {/* Valores numéricos */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Valor (R$)</Label>
              <Input
                id="price"
                type="number"
                value={form.price ?? ""}
                onChange={(e) => setForm(s => ({ ...s, price: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sprintNumber">Nº de Sprints</Label>
              <Input
                id="sprintNumber"
                type="number"
                value={form.sprintNumber ?? ""}
                onChange={(e) => setForm(s => ({ ...s, sprintNumber: e.target.value }))}
                placeholder="4"
                min="1"
              />
            </div>
          </div>

          {/* Analistas (edição simples) */}
          <div className="space-y-3">
            <Label>Analistas (edição)</Label>
            <p className="text-xs text-muted-foreground -mt-2 mb-2">
              *Este modal edita analistas existentes (nome/cargo). Para criar/remover, adapte o backend para create/delete no PATCH.
            </p>
            {form.analysts.map((a, i) => (
              <div key={a.id} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    placeholder="Nome do analista"
                    value={a.name}
                    onChange={(e) => updateAnalyst(i, "name", e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <select
                    className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm"
                    value={a.role}
                    onChange={(e) => updateAnalyst(i, "role", e.target.value)}
                  >
                    <option value="Front">Front</option>
                    <option value="Back">Back</option>
                    <option value="PM">PM</option>
                    <option value="Coord">Coord</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

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
