import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSiteUrl } from "@/lib/url";
import { getStripeClient } from "@/lib/billing/stripeClient";
import { getPlanPriceId } from "@/lib/billing/plans";
import { StripeNotConfiguredError, PlanNotConfiguredError } from "@/lib/billing/errors";
import { PLAN_PRICE_ENV_VAR } from "@/lib/billing/plans";
import { createCheckoutSchema } from "@/lib/validations/billing";

export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  const { plan } = parsed.data;
  const priceId = getPlanPriceId(plan);
  if (!priceId) {
    const error = new PlanNotConfiguredError(plan, PLAN_PRICE_ENV_VAR[plan]);
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  try {
    const stripe = getStripeClient();
    const siteUrl = await getSiteUrl();

    const existing = await prisma.subscription.findUnique({ where: { userId: session.user.id } });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: session.user.id,
      customer: existing?.stripeCustomerId ?? undefined,
      customer_email: existing?.stripeCustomerId ? undefined : session.user.email,
      success_url: `${siteUrl}/dashboard/settings/billing?checkout=success`,
      cancel_url: `${siteUrl}/dashboard/settings/billing?checkout=cancel`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe no devolvió una URL de checkout." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    if (error instanceof StripeNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    throw error;
  }
}
