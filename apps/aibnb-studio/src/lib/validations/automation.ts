import { z } from "zod";
import { AUTOMATION_TYPES } from "@/lib/automations/types";

export const automationConfigInputSchema = z.object({
  type: z.enum(AUTOMATION_TYPES),
  enabled: z.boolean(),
  offsetHours: z.number().int().min(-720).max(720),
  messageTemplate: z.string().trim().min(1, "La plantilla no puede estar vacía").max(1000),
});
export type AutomationConfigInput = z.infer<typeof automationConfigInputSchema>;

export const updateAutomationsSchema = z.array(automationConfigInputSchema).max(AUTOMATION_TYPES.length);

export const updateAutomationRunSchema = z.object({
  status: z.enum(["DONE", "DISMISSED"]),
});
export type UpdateAutomationRunInput = z.infer<typeof updateAutomationRunSchema>;
