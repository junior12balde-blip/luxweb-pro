import Stripe from "stripe";
import { StripeNotConfiguredError } from "./errors";

/**
 * Versión de la API de Stripe fijada al mismo valor que exige el SDK
 * `stripe` instalado (ver node_modules/stripe/esm/apiVersion.d.ts) — no
 * inventada, es literalmente la constante que exporta el paquete.
 */
const API_VERSION: Stripe.LatestApiVersion = "2026-08-26.dahlia";

let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new StripeNotConfiguredError();
  }
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: API_VERSION });
  }
  return client;
}
