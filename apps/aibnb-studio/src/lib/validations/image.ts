import { z } from "zod";

export const IMAGE_STYLES = ["promotional", "social", "banner"] as const;

export const generateImageRequestSchema = z.object({
  style: z.enum(IMAGE_STYLES).default("promotional"),
});
export type GenerateImageRequest = z.infer<typeof generateImageRequestSchema>;
