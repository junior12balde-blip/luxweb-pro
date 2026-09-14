import { z } from "zod";
import { PAID_PLAN_IDS } from "@/lib/billing/plans";

export const createCheckoutSchema = z.object({
  plan: z.enum(PAID_PLAN_IDS),
});
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
