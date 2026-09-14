export type PaidPlanId = "STARTER" | "PRO" | "BUSINESS";
export type PlanId = "FREE" | PaidPlanId;

export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "UNPAID"
  | "PAUSED";

export interface SubscriptionInfo {
  plan: PlanId;
  status: SubscriptionStatus;
  /** El plan que realmente cuenta para los límites — FREE si el estado no es activo/en prueba. */
  effectivePlan: PlanId;
  stripeCustomerId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}
