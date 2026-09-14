import { requireUser } from "@/lib/auth";
import { getUserSubscription, checkPropertyLimit } from "@/lib/billing/subscription";
import { isStripeConfigured } from "@/lib/billing/stripeClient";
import { BillingPlans } from "@/components/billing/BillingPlans";

export default async function BillingPage() {
  const { user } = await requireUser();
  const [subscription, propertyLimit] = await Promise.all([
    getUserSubscription(user.id),
    checkPropertyLimit(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Facturación</h2>
        <p className="mt-1 text-sm text-slate-500">
          Elige el plan según cuántas propiedades gestiones. El plan Gratis no requiere tarjeta.
        </p>
      </div>

      {!isStripeConfigured() && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Stripe todavía no está configurado en este entorno — los botones de suscripción no
          funcionarán hasta que se añadan <code>STRIPE_SECRET_KEY</code> y los Price ID de cada
          plan. Ver <code>PHASE-9.md</code>.
        </p>
      )}

      <BillingPlans subscription={subscription} propertyLimit={propertyLimit} />
    </div>
  );
}
