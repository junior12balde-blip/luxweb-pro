"use client";

import { useState } from "react";
import type { SubscriptionInfo } from "@/types/billing";
import type { PropertyLimitCheck } from "@/lib/billing/subscription";
import { PLAN_IDS, PLAN_LABELS, PLAN_PROPERTY_LIMIT, PAID_PLAN_IDS } from "@/lib/billing/plans";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

const STATUS_LABELS: Record<SubscriptionInfo["status"], string> = {
  ACTIVE: "Activa",
  TRIALING: "En prueba",
  PAST_DUE: "Pago pendiente",
  CANCELED: "Cancelada",
  INCOMPLETE: "Incompleta",
  INCOMPLETE_EXPIRED: "Incompleta (caducada)",
  UNPAID: "Impagada",
  PAUSED: "Pausada",
};

export function BillingPlans({
  subscription,
  propertyLimit,
}: {
  subscription: SubscriptionInfo;
  propertyLimit: PropertyLimitCheck;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [pendingPortal, setPendingPortal] = useState(false);

  async function handleSubscribe(plan: (typeof PAID_PLAN_IDS)[number]) {
    setPendingPlan(plan);
    setError(null);

    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "No se pudo iniciar el pago");
      setPendingPlan(null);
      return;
    }

    window.location.href = data.url;
  }

  async function handleManage() {
    setPendingPortal(true);
    setError(null);

    const response = await fetch("/api/billing/portal", { method: "POST" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? "No se pudo abrir el portal de facturación");
      setPendingPortal(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-slate-700">
          Plan actual: <span className="font-semibold">{PLAN_LABELS[subscription.plan]}</span>{" "}
          <span className="text-xs text-slate-500">({STATUS_LABELS[subscription.status]})</span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Propiedades: {propertyLimit.current} / {propertyLimit.limit ?? "sin límite"}
        </p>
        {subscription.currentPeriodEnd && (
          <p className="mt-1 text-xs text-slate-500">
            {subscription.cancelAtPeriodEnd ? "Se cancela el " : "Se renueva el "}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString("es-ES")}
          </p>
        )}
        {subscription.stripeCustomerId && (
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            disabled={pendingPortal}
            onClick={handleManage}
          >
            {pendingPortal ? "Abriendo..." : "Gestionar facturación"}
          </Button>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_IDS.map((plan) => {
          const isCurrent = subscription.effectivePlan === plan;
          const limit = PLAN_PROPERTY_LIMIT[plan];

          return (
            <Card key={plan} className="flex flex-col gap-2">
              <h3 className="font-semibold text-slate-900">{PLAN_LABELS[plan]}</h3>
              <p className="text-xs text-slate-500">
                {limit === null ? "Propiedades ilimitadas" : `Hasta ${limit} propiedad${limit === 1 ? "" : "es"}`}
              </p>
              {isCurrent ? (
                <span className="mt-auto rounded-full bg-green-50 px-2 py-1 text-center text-xs font-medium text-green-700">
                  Plan actual
                </span>
              ) : plan === "FREE" ? (
                <span className="mt-auto text-xs text-slate-400">Plan por defecto</span>
              ) : (
                <Button
                  type="button"
                  className="mt-auto"
                  disabled={pendingPlan !== null}
                  onClick={() => handleSubscribe(plan as (typeof PAID_PLAN_IDS)[number])}
                >
                  {pendingPlan === plan ? "Redirigiendo..." : "Suscribirse"}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      <FormError message={error} />
    </div>
  );
}
