import { SprayCan } from "lucide-react";
import z from "zod";

export const patchProjectDTO = z.object({
  name: z.string(),
  client: z.string(),
  shortDescription: z.string(),
  plannedEndDate: z.date(),
  startDate: z.date(),
  status: z.string(),
  price: z.number().optional(),
  sprintNumber: z.number(),
  analysts: z.array(z.object({
    name: z.string(),
    role: z.enum(["front", "back", "pm", "coord"])
  })),
})

export const createProjectSchema= z.object({
  name: z.string({error: (issue) => issue.input === undefined ? "Nome é obrigatório" : "Nome deve ser um texto"}),
  client: z.string({error: (issue) => issue.input === undefined ? "Cliente é obrigatório" : "Cliente deve ser um texto"}),
  shortDescription: z.string({error: (issue) => issue.input === undefined ? "Descrição é obrigatória" : "Descrição deve ser um texto"}),
  plannedEndDate: z.coerce.date(),
  startDate: z.coerce.date(),
  price: z.number().optional(),
  sprintNumber: z.number({error: (issue) => issue.input === undefined ? "Número de sprints é obrigatório" : "Número de sprints deve ser um número"}),
  analysts: z.array(z.object({
    name: z.string(),
    role: z.enum(["Front", "Back", "PM", "Coord"], {error: (issue) => issue.input === undefined ? "Cargo é obrigatório" : "Cargo deve ser Front, Back, PM ou Coord"})
  })),
})

export const patchProjectSchema = patchProjectDTO
  .partial()                               
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Pelo menos um campo precisa ser fornecido para atualização",
  });

