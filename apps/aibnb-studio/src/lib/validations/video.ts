import { z } from "zod";

export const VIDEO_STYLES = ["cinematic", "vertical"] as const;

export const generateVideoRequestSchema = z.object({
  style: z.enum(VIDEO_STYLES).default("cinematic"),
});
export type GenerateVideoRequest = z.infer<typeof generateVideoRequestSchema>;
