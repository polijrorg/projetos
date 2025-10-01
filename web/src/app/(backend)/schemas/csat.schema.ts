import { z } from "zod";

export const createCSATSchema = z.object({
  responseDate: z.coerce.date().optional(),

  teamCommunicationScore: z.coerce.number().int().min(1).max(5),
  teamCommunicationFeedback: z.string().trim().default(""),

  qualityScore: z.coerce.number().int().min(1).max(5),
  qualityFeedback: z.string().trim().default(""),

  overallSatisfactionScore: z.coerce.number().int().min(1).max(5),

}).strict();
