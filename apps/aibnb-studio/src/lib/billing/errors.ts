/** Falta STRIPE_SECRET_KEY — no se puede hablar con la API de Stripe. */
export class StripeNotConfiguredError extends Error {
  constructor() {
    super("Stripe no está configurado: falta la variable de entorno STRIPE_SECRET_KEY.");
    this.name = "StripeNotConfiguredError";
  }
}

/** El plan de pago pedido no tiene un Price ID configurado (STRIPE_PRICE_*). */
export class PlanNotConfiguredError extends Error {
  constructor(public readonly plan: string, public readonly envVar: string) {
    super(`El plan "${plan}" no está configurado: falta la variable de entorno ${envVar}.`);
    this.name = "PlanNotConfiguredError";
  }
}
