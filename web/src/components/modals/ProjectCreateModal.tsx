import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Project, MemberRole } from "@/types";
import { saveProjects, loadProjects } from "@/utils/storage";
import { Calendar } from "../ui/calendar";

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

interface ProjectFormData {
  name: string;
  client: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  price: string;
  sprintCount: string;
  analysts: Array<{ name: string; role: MemberRole }>;
}

export function ProjectCreateModal({ isOpen, onClose, onProjectCreated }: ProjectCreateModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    client: "",
    description: "",
    startDate: undefined,
    endDate: undefined,
    price: "",
    sprintCount: "",
    analysts: [{ name: "", role: "Front" }]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.client || !formData.startDate || !formData.endDate) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: formData.name,
      client: formData.client,
      shortDescription: formData.description,
      startDate: formData.startDate,
      plannedEndDate: formData.endDate,
      status: "Normal",
      isFrozen: false,
      price: formData.price ? parseFloat(formData.price) : undefined,
      isContracted: true,
      analysts: formData.analysts
        .filter(analyst => analyst.name.trim())
        .map((analyst, index) => ({
          id: `analyst-${Date.now()}-${index}`,
          name: analyst.name,
          role: analyst.role
        })),
      delayDays: 0,
      csatCollectionRate: 0,
      averageCSAT: 0,
      isENBCandidate: false,
      isENB: false,
      sprints: []
    };

    const projects = loadProjects();
    projects.push(newProject);
    saveProjects(projects);

    // Reset form
    setFormData({
      name: "",
      client: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      price: "",
      sprintCount: "",
      analysts: [{ name: "", role: "Front" }]
    });

    onProjectCreated();
    onClose();
  };

  const addAnalyst = () => {
    setFormData({
      ...formData,
      analysts: [...formData.analysts, { name: "", role: "Front" }]
    });
  };

  const removeAnalyst = (index: number) => {
    if (formData.analysts.length > 1) {
      setFormData({
        ...formData,
        analysts: formData.analysts.filter((_, i) => i !== index)
      });
    }
  };

  const updateAnalyst = (index: number, field: keyof typeof formData.analysts[0], value: string) => {
    const updatedAnalysts = [...formData.analysts];
    updatedAnalysts[index] = { ...updatedAnalysts[index], [field]: value };
    setFormData({ ...formData, analysts: updatedAnalysts });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Projeto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do projeto"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Nome do cliente"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do projeto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData({ ...formData, startDate: date })}
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
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData({ ...formData, endDate: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Valor (R$)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, sprintCount: e.target.value })}
                placeholder="4"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Analistas</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAnalyst}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Analista
              </Button>
            </div>
            
            {formData.analysts.map((analyst, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    placeholder="Nome do analista"
                    value={analyst.name}
                    onChange={(e) => updateAnalyst(index, "name", e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <select
                    className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm"
                    value={analyst.role}
                    onChange={(e) => updateAnalyst(index, "role", e.target.value as MemberRole)}
                  >
                    <option value="Front">Front</option>
                    <option value="Back">Back</option>
                    <option value="PM">PM</option>
                    <option value="Coord">Coord</option>
                  </select>
                </div>
                {formData.analysts.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAnalyst(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button variant="hero" type="submit" className="flex-1">
              Criar Projeto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}