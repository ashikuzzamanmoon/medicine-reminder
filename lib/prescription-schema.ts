import { z } from "zod";

export const PrescriptionMedicineDraftSchema = z.object({
  name: z.string().min(1, "ওষুধের নাম প্রয়োজন"),
  dose: z.string().default("১টি ট্যাবলেট"),
  foodTiming: z.enum(["BEFORE", "AFTER", "ANY"]).default("AFTER"),
  times: z.array(z.string()).default(["08:00", "20:00"]),
  durationDays: z.number().int().optional(),
  confidence: z.enum(["high", "medium", "low"]).default("medium"),
});

export const PrescriptionDraftSchema = z.object({
  medicines: z.array(PrescriptionMedicineDraftSchema),
  rawSummary: z.string(),
  warnings: z.array(z.string()),
});

export type PrescriptionDraft = z.infer<typeof PrescriptionDraftSchema>;
export type PrescriptionMedicineDraft = z.infer<typeof PrescriptionMedicineDraftSchema>;
