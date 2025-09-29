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
export const patchProjectSchema = patchProjectDTO
  .partial()                               
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Pelo menos um campo precisa ser fornecido para atualização",
  });