import z from "zod";

const score1to5 = z
  .number({ error: (i) => (i.input === undefined ? "Pontuação é obrigatória" : "Pontuação deve ser um número") })
  .int("Pontuação deve ser inteira")
  .min(1, "Pontuação mínima é 1")
  .max(5, "Pontuação máxima é 5");

const nps0to10 = z
  .number({ error: (i) => (i.input === undefined ? "NPS é obrigatório" : "NPS deve ser um número") })
  .int("NPS deve ser inteiro")
  .min(0, "NPS mínimo é 0")
  .max(10, "NPS máximo é 10");

// Somente estes 3 continuam obrigatórios
export const createNPSSchema = z.object({
  clientName: z.string({
    error: (i) =>
      i.input === undefined ? "Nome do cliente é obrigatório" : "Nome do cliente deve ser um texto",
  }),
  clientNumber: z.string({
    error: (i) =>
      i.input === undefined ? "Número do cliente é obrigatório" : "Número do cliente deve ser um texto",
  }),
  responseDate: z.coerce.date(),

  // Tudo abaixo ficou opcional
  accordanceScore: score1to5.optional(),
  accordanceFeedback: z.string().optional(),
  expectationsScore: score1to5.optional(),
  expectationsFeedback: z.string().optional(),
  qualityScore: score1to5.optional(),
  qualityFeedback: z.string().optional(),
  missingFeatures: z.string().optional(),
  improvementSuggestions: z.string().optional(),
  npsScore: nps0to10.optional(),
  pmNotes: z.string().optional(),
});

export const patchNPSSchema = createNPSSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Pelo menos um campo precisa ser fornecido para atualização",
  });

export type CreateNPSDTO = z.infer<typeof createNPSSchema>;
export type PatchNPSDTO = z.infer<typeof patchNPSSchema>;
