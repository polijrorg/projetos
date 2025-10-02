import z from "zod";

export const sprintCreateSchema = z.object({
  number: z.number().int().min(1),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  goals: z.array(z.string().trim()).default([]),
  capacityHours: z.string().trim().optional()
});

export const sprintUpdateSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  goals: z.array(z.string().trim()).optional(),
  capacityHours: z.number().int().positive().optional()
}).refine(o => Object.keys(o).length > 0, { message: "Nada para atualizar" });

export const sprintGoalSchema = z.object({
  goal: z.string().min(1, "Objetivo não pode ser vazio"),
});


export const taskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),

  priority: z.enum(["Alta", "Média", "Baixa"]).default("Média").optional(),
  type: z.enum(["Front-end", "Back-end"]).optional(),
  estimate: z.number().int().positive().default(1).optional(),
  status: z.enum(["TODO", "DOING", "DONE"]).optional()
    .or(z.string().min(1).optional()),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["Alta", "Média", "Baixa"]).optional(),
  type: z.enum(["Front-end", "Back-end"]).optional().or(z.string().min(1).optional()),
  estimate: z.number().int().positive().optional(),
  status: z.enum(["TODO", "DOING", "DONE"]).optional()
    .or(z.string().min(1).optional()),
}).refine(o => Object.keys(o).length > 0, { message: "Nada para atualizar" });
