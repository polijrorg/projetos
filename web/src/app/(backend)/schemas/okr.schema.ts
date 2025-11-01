import z from "zod";

export const patchOkrDTO = z.object({
  goalDescription: z.string().optional(),
  period: z.string().optional(),
  keyResult: {
    name: z.string().optional(),
    metric: z.string().optional(),
    actionPlan: z.string().optional(),
  },
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export const createOkrSchema= z.object({
  goalDescription: z.string({error: (issue) => issue.input === undefined ? "Objetivo é obrigatório" : "Objetivo deve ser um texto"}),
  period: z.string({error: (issue) => issue.input === undefined ? "Período é obrigatório" : "Período deve ser um texto"}),
  keyResult: z.array(z.object({
    name: z.string({error: (issue) => issue.input === undefined ? "Nome é obrigatório" : "Nome deve ser um texto"}),
    metric: z.string().optional().default(""),
    actionPlan: z.string().optional().default(""),
  })),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
})

export const patchOkrSchema = patchOkrDTO
  .partial()                               
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Pelo menos um campo precisa ser fornecido para atualização",
  });

