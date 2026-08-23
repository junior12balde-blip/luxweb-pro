import { z } from "zod";

/** Forma exacta que se le pide al modelo — se valida tras parsear su JSON. */
export const generatedListingSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(4000),
  highlights: z.array(z.string().trim().min(1).max(120)).max(10),
  seoKeywords: z.array(z.string().trim().min(1).max(60)).max(15),
});
export type GeneratedListing = z.infer<typeof generatedListingSchema>;

export const generateListingRequestSchema = z.object({
  preferredProvider: z.string().trim().min(1).optional(),
});

export const applyListingDraftSchema = z.object({
  applyToDescription: z.boolean().optional(),
});
