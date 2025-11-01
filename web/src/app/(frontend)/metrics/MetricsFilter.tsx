"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PeriodKey, getYearsFromData } from "./(parts)/datePeriods";
import { ProjectWithNPS } from "./(parts)/types";


type Props = {
  projects: ProjectWithNPS[];
  year: number;
  periodKey: PeriodKey;
  onChangeYear: (y: number) => void;
  onChangePeriod: (p: PeriodKey) => void;
};

export function MetricsFilters({ projects, year, periodKey, onChangeYear, onChangePeriod }: Props) {
  const years = Array.from(getYearsFromData(projects)).sort((a, b) => b - a);
  if (!years.length) years.push(new Date().getFullYear());

  return (
    <div className="flex items-center gap-3">
      {/* Ano */}
      <Select value={String(year)} onValueChange={(v) => onChangeYear(Number(v))}>
        <SelectTrigger className="w-28">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map(y => (
            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Período dentro do ano */}
      <Select value={periodKey} onValueChange={(v) => onChangePeriod(v as PeriodKey)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="YEAR">Ano todo</SelectItem>
          <SelectItem value="SEM1">Semestre 1 (Jan–Jun)</SelectItem>
          <SelectItem value="SEM2">Semestre 2 (Jul–Dez)</SelectItem>
          <SelectItem value="C1">Ciclo 1 (Jan–Mar)</SelectItem>
          <SelectItem value="C2">Ciclo 2 (Abr–Jun)</SelectItem>
          <SelectItem value="C3">Ciclo 3 (Jul–Set)</SelectItem>
          <SelectItem value="C4">Ciclo 4 (Out–Dez)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
