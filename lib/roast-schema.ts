import { z } from 'zod';

export const roastSchema = z.object({
  brainrotScore: z.object({
    score: z.number().min(0).max(100),
    justification: z.string(),
  }),
  personalityArchetype: z.string(),
  roastParagraphs: z.array(z.string()).min(3).max(5),
  worstOffenders: z.array(
    z.object({
      name: z.string(),
      reason: z.string(),
    }),
  ),
  redemptionArc: z.string(),
  statsHighlights: z.array(z.string()),
});

export type RoastResult = z.infer<typeof roastSchema>;
