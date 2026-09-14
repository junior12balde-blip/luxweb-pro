import type { PaidPlanId, PlanId } from "@/types/billing";

export const PAID_PLAN_IDS = ["STARTER", "PRO", "BUSINESS"] as const satisfies readonly PaidPlanId[];

export const PLAN_IDS = ["FREE", ...PAID_PLAN_IDS] as const satisfies readonly PlanId[];

export const PLAN_LABELS: Record<PlanId, string> = {
  FREE: "Gratis",
  STARTER: "Starter",
  PRO: "Pro",
  BUSINESS: "Business",
};

/** Número máximo de propiedades en propiedad (Membership role OWNER). `null` = sin límite. */
export const PLAN_PROPERTY_LIMIT: Record<PlanId, number | null> = {
  FREE: 1,
  STARTER: 3,
  PRO: 10,
  BUSINESS: null,
};

/**
 * Variable de entorno que contiene el Price ID de Stripe de cada plan de
 * pago. Los Price ID son específicos de la cuenta de Stripe del cliente —
 * no se inventan aquí, se crean en el Dashboard de Stripe y se pegan en
 * `.env.local` / variables de entorno de despliegue. Ver PHASE-9.md.
 */
export const PLAN_PRICE_ENV_VAR: Record<PaidPlanId, string> = {
  STARTER: "STRIPE_PRICE_STARTER",
  PRO: "STRIPE_PRICE_PRO",
  BUSINESS: "STRIPE_PRICE_BUSINESS",
};

export function getPlanPriceId(plan: PaidPlanId): string | undefined {
  return process.env[PLAN_PRICE_ENV_VAR[plan]];
}

/** Busca a qué plan de pago corresponde un Price ID de Stripe (para procesar webhooks). */
export function findPlanByPriceId(priceId: string): PaidPlanId | null {
  for (const plan of PAID_PLAN_IDS) {
    if (getPlanPriceId(plan) === priceId) {
      return plan;
    }
  }
  return null;
}
