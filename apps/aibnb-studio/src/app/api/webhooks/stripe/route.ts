import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/billing/stripeClient";
import { findPlanByPriceId } from "@/lib/billing/plans";
import type { SubscriptionStatus } from "@/types/billing";

/**
 * Next.js App Router entrega el body ya parseado salvo que se lea como
 * texto/bytes antes de tocar `.json()` — necesario para verificar la firma
 * de Stripe, que se calcula sobre el body crudo exacto que envió Stripe.
 */
export const runtime = "nodejs";

const STATUS_MAP: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
  active: "ACTIVE",
  trialing: "TRIALING",
  past_due: "PAST_DUE",
  canceled: "CANCELED",
  incomplete: "INCOMPLETE",
  incomplete_expired: "INCOMPLETE_EXPIRED",
  unpaid: "UNPAID",
  paused: "PAUSED",
};

function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  return STATUS_MAP[status] ?? "INCOMPLETE";
}

function extractCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer): string {
  return typeof customer === "string" ? customer : customer.id;
}

async function upsertFromStripeSubscription(
  stripeSubscription: Stripe.Subscription,
  userId?: string,
) {
  const customerId = extractCustomerId(stripeSubscription.customer);
  const priceId = stripeSubscription.items.data[0]?.price.id;
  const plan = priceId ? findPlanByPriceId(priceId) : null;
  const currentPeriodEndSeconds = stripeSubscription.items.data[0]?.current_period_end;
  const currentPeriodEnd = currentPeriodEndSeconds ? new Date(currentPeriodEndSeconds * 1000) : null;
  const status = mapStatus(stripeSubscription.status);

  if (userId) {
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: plan ?? "FREE",
        status,
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSubscription.id,
        currentPeriodEnd,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
      update: {
        plan: plan ?? undefined,
        status,
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSubscription.id,
        currentPeriodEnd,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    });
    return;
  }

  // Eventos que no traen el userId directamente (customer.subscription.*,
  // invoice.*): solo actualizamos una fila que ya exista (creada por
  // checkout.session.completed, que sí trae client_reference_id). Si
  // todavía no existe, se ignora — llegará el evento de checkout en breve.
  const existing = await prisma.subscription.findFirst({
    where: {
      OR: [{ stripeSubscriptionId: stripeSubscription.id }, { stripeCustomerId: customerId }],
    },
  });
  if (!existing) {
    return;
  }

  await prisma.subscription.update({
    where: { id: existing.id },
    data: {
      plan: plan ?? undefined,
      status,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscription.id,
      currentPeriodEnd,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    },
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET no está configurado en el servidor." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Falta la cabecera stripe-signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Firma no válida";
    return NextResponse.json({ error: `Webhook rechazado: ${message}` }, { status: 400 });
  }

  const stripe = getStripeClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.client_reference_id;
      if (userId && typeof session.subscription === "string") {
        const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
        await upsertFromStripeSubscription(stripeSubscription, userId);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await upsertFromStripeSubscription(event.data.object);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const subscriptionRef = invoice.parent?.subscription_details?.subscription;
      const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
      if (subscriptionId) {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertFromStripeSubscription(stripeSubscription);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
