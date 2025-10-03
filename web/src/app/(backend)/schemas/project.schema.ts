import { id } from "date-fns/locale";
import z from "zod";

export const patchProjectDTO = z.object({
  name: z.string().optional(),
  client: z.string().optional(),
  shortDescription: z.string().optional(),
  plannedEndDate: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  status: z.string().optional(),
  price: z.number().optional().nullable(),
  sprintNumber: z.number().optional(),
  endDate: z.union([z.coerce.date(), z.null()]).optional(),
  analysts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.enum(["Front", "Back", "PM", "Coord"], {error: (issue) => issue.input === undefined ? "Cargo é obrigatório" : "Cargo deve ser Front, Back, PM ou Coord"})
  })).optional(),
  saleDate: z.coerce.date().optional(), 
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
  saleDate: z.coerce.date(),
})

export const patchProjectSchema = patchProjectDTO
  .partial()                               
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Pelo menos um campo precisa ser fornecido para atualização",
  });

