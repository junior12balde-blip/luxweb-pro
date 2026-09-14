import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSiteUrl } from "@/lib/url";
import { getStripeClient } from "@/lib/billing/stripeClient";
import { StripeNotConfiguredError } from "@/lib/billing/errors";

export async function POST() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Todavía no tienes ninguna suscripción — elige un plan primero." },
      { status: 404 },
    );
  }

  try {
    const stripe = getStripeClient();
    const siteUrl = await getSiteUrl();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${siteUrl}/dashboard/settings/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
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
