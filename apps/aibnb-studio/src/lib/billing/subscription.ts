import { prisma } from "@/lib/prisma";
import type { PlanId, SubscriptionInfo, SubscriptionStatus } from "@/types/billing";
import { PLAN_PROPERTY_LIMIT } from "./plans";

const ACTIVE_STATUSES: SubscriptionStatus[] = ["ACTIVE", "TRIALING"];

const FREE_SUBSCRIPTION: SubscriptionInfo = {
  plan: "FREE",
  status: "ACTIVE",
  effectivePlan: "FREE",
  stripeCustomerId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

/**
 * Un usuario sin fila en `Subscription` se trata como plan FREE activo —
 * no hace falta crear una fila hasta que se suscribe de verdad, mismo
 * patrón usado con las automatizaciones de la Fase 7 (config por defecto
 * sin persistir hasta que el usuario actúa).
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription) {
    return FREE_SUBSCRIPTION;
  }

  const effectivePlan = ACTIVE_STATUSES.includes(subscription.status)
    ? subscription.plan
    : "FREE";

  return {
    plan: subscription.plan,
    status: subscription.status,
    effectivePlan,
    stripeCustomerId: subscription.stripeCustomerId,
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

export interface PropertyLimitCheck {
  allowed: boolean;
  limit: number | null;
  current: number;
  plan: PlanId;
}

/** Cuenta solo las propiedades de las que el usuario es OWNER (co-editores no cuentan para su límite). */
export async function checkPropertyLimit(userId: string): Promise<PropertyLimitCheck> {
  const [subscription, current] = await Promise.all([
    getUserSubscription(userId),
    prisma.membership.count({ where: { userId, role: "OWNER" } }),
  ]);

  const limit = PLAN_PROPERTY_LIMIT[subscription.effectivePlan];
  return { allowed: limit === null || current < limit, limit, current, plan: subscription.effectivePlan };
}
