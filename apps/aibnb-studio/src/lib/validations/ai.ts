import { z } from "zod";
import { AI_PROVIDER_IDS } from "@/lib/ai/types";

export const aiPreferencesSchema = z.object({
  defaultProvider: z.enum(AI_PROVIDER_IDS as [string, ...string[]]).nullable(),
});
export type AIPreferencesInput = z.infer<typeof aiPreferencesSchema>;
