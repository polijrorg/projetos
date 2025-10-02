import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ProjectComplete } from "@/types";
import { AlertTriangle, BarChart3, Clock, Star, Snowflake, CheckCircle2 } from "lucide-react";
import { getStatusVariant } from "@/utils/projects/ui-helpers";

interface ProjectStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: ProjectComplete["status"];
  onStatusChange: (status: ProjectComplete["status"]) => void;
}

const statusOptions: { status: ProjectComplete["status"]; icon: React.ReactNode; variant: string }[] = [
  { status: 'Crítica', icon: <AlertTriangle className="h-4 w-4" />, variant: 'critical' },
  { status: 'Ruim', icon: <BarChart3 className="h-4 w-4" />, variant: 'bad' },
  { status: 'Normal', icon: <Clock className="h-4 w-4" />, variant: 'normal' },
  { status: 'Possível ENB', icon: <Star className="h-4 w-4" />, variant: 'enb' },
  { status: 'Congelado', icon: <Snowflake className="h-4 w-4" />, variant: 'frozen' },
  { status: 'Finalizado', icon: <CheckCircle2 className="h-4 w-4" />, variant: 'done' }
];

export function ProjectStatusModal({ isOpen, onClose, currentStatus, onStatusChange }: ProjectStatusModalProps) {
  const handleStatusSelect = (status: ProjectComplete["status"]) => {
    onStatusChange(status);
    onClose();
  };


  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Situação do Projeto</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Selecione o novo status para o projeto:
          </p>
          
          <div className="grid gap-2">
            {statusOptions.map(({ status, icon}) => (
              <Button
                key={status}
                variant={currentStatus === status ? "default" : "outline"}
                className="justify-start h-auto p-3 cursor-pointer"
                onClick={() => handleStatusSelect(status)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Badge variant={getStatusVariant(status)} className="flex items-center gap-1">
                    {icon}
                    {status}
                  </Badge>
                  {currentStatus === status && (
                    <span className="text-xs text-muted-foreground ml-auto text-white">
                      Atual
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}