"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

export type SprintInput = {
  number: number;
  capacity: number;
  startDate: string;
  endDate: string;   
  goals: string[];
};

type SprintDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SprintInput) => void;
  initialValue?: Partial<SprintInput>;
  title?: string;
};

export default function SprintDialog({
  open,
  onOpenChange,
  onSubmit,
  initialValue,
  title = "Nova Sprint",
}: SprintDialogProps) {
  const [number, setNumber] = useState<number>(initialValue?.number ?? 1);
  const [capacity, setCapacity] = useState<number>(initialValue?.capacity ?? 40);
  const [startDate, setStartDate] = useState<Date | null>(
    initialValue?.startDate ? parseISO(initialValue.startDate) : null
  );
  const [endDate,   setEndDate]   = useState<Date | null>(
    initialValue?.endDate ? parseISO(initialValue.endDate) : null
  );
  const [goals, setGoals] = useState<string[]>(initialValue?.goals ?? [""]);

  const addGoal = () => setGoals((arr) => [...arr, ""]);
  const updateGoal = (i: number, v: string) => setGoals((arr) => arr.map((g, idx) => (idx === i ? v : g)));
  const removeGoal = (i: number) => setGoals((arr) => arr.filter((_, idx) => idx !== i));

  useMemo(() => {
    if (startDate && endDate && isAfter(startDate, endDate)) {
      setEndDate(null);
    }
  }, [startDate, endDate]);

  const handleConfirm = () => {
    const payload: SprintInput = {
      number,
      capacity,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : "",
      goals: goals.length ? goals : [""],
    };
    onSubmit(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sprint-number">Número da Sprint</Label>
              <Input
                id="sprint-number"
                type="number"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <Label htmlFor="sprint-capacity">Capacidade (horas)</Label>
              <Input
                id="sprint-capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 40)}
              />
            </div>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal cursor-pointer",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate ?? undefined}
                    onSelect={(date) => setStartDate(date ?? null)}
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
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal cursor-pointer",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate ?? undefined}
                    onSelect={(date) => setEndDate(date ?? null)}
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
              <Button className="cursor-pointer" type="button" variant="outline" size="sm" onClick={addGoal}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Objetivo
              </Button>
            </div>

            <div className="space-y-2">
              {goals.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={goal}
                    onChange={(e) => updateGoal(index, e.target.value)}
                    placeholder={`Objetivo ${index + 1}`}
                  />
                  {goals.length > 1 && (
                    <Button className="cursor-pointer" 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeGoal(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Tasks da Sprint</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Após criar a sprint, você poderá adicionar tasks organizadas por Front-end e Back-end.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Front-end Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div>• Interface de usuário</div>
                  <div>• Componentes React</div>
                  <div>• Integração com APIs</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Back-end Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div>• APIs e endpoints</div>
                  <div>• Banco de dados</div>
                  <div>• Lógica de negócio</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button className="cursor-pointer" variant="cancel" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button variant="hero" onClick={handleConfirm}>Criar Sprint</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
