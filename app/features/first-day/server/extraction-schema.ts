import { z } from "zod";

const ExtractedFactProposalSchema = z
  .object({
    clientKey: z.string().regex(/^[a-z0-9-]+$/).max(80),
    kind: z.enum([
      "date",
      "location",
      "requested_item",
      "contact",
      "appointment",
      "informational_note",
    ]),
    semanticKey: z
      .string()
      .regex(/^[a-z0-9_]+\.[a-z0-9_]+$/)
      .max(100),
    label: z.string().min(1).max(120),
    originalValue: z.string().min(1).max(500),
    normalizedValue: z.string().max(500).nullable(),
    quote: z.string().min(1).max(1_500),
    location: z.string().min(1).max(120),
    confidence: z.number().min(0).max(100),
  })
  .strict();

export const FirstDayExtractionSchema = z
  .object({
    schemaVersion: z.literal("first-day-extraction-v1"),
    requestId: z.string().min(1).max(120),
    documentId: z.string().min(1).max(120),
    document: z
      .object({
        label: z.string().min(1).max(120),
        confidence: z.number().min(0).max(100),
        originalText: z.string().min(1).max(40_000),
        photoQualityNote: z.string().max(500).nullable(),
      })
      .strict(),
    facts: z.array(ExtractedFactProposalSchema).max(30),
  })
  .strict();
