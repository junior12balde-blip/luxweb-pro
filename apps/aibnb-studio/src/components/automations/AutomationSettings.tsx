"use client";

import { useState } from "react";
import type { AutomationConfig } from "@/types/automation";
import { AUTOMATION_TYPE_LABELS } from "@/lib/automations/types";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { FormError } from "@/components/ui/FormError";
import { Card } from "@/components/ui/Card";

export function AutomationSettings({
  propertyId,
  automations: initialAutomations,
}: {
  propertyId: string;
  automations: AutomationConfig[];
}) {
  const [automations, setAutomations] = useState(initialAutomations);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateField<K extends keyof AutomationConfig>(
    type: AutomationConfig["type"],
    field: K,
    value: AutomationConfig[K],
  ) {
    setSaved(false);
    setAutomations((prev) =>
      prev.map((automation) => (automation.type === type ? { ...automation, [field]: value } : automation)),
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const response = await fetch(`/api/properties/${propertyId}/automations`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        automations.map(({ type, enabled, offsetHours, messageTemplate }) => ({
          type,
          enabled,
          offsetHours,
          messageTemplate,
        })),
      ),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "No se pudieron guardar las automatizaciones");
      setSaving(false);
      return;
    }

    const { automations: updated } = await response.json();
    setAutomations(updated);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="space-y-3">
      {automations.map((automation) => (
        <Card key={automation.type}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {AUTOMATION_TYPE_LABELS[automation.type]}
              </h3>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={automation.enabled}
                onChange={(event) => updateField(automation.type, "enabled", event.target.checked)}
              />
              Activo
            </label>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[140px_1fr]">
            <div>
              <Label htmlFor={`offset-${automation.type}`}>Horas de desfase</Label>
              <input
                id={`offset-${automation.type}`}
                type="number"
                value={automation.offsetHours}
                onChange={(event) =>
                  updateField(automation.type, "offsetHours", Number(event.target.value))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <p className="mt-1 text-xs text-slate-400">Negativo = antes, positivo = después</p>
            </div>
            <div>
              <Label htmlFor={`template-${automation.type}`}>Mensaje</Label>
              <textarea
                id={`template-${automation.type}`}
                rows={2}
                value={automation.messageTemplate}
                onChange={(event) => updateField(automation.type, "messageTemplate", event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
        </Card>
      ))}

      <FormError message={error} />
      <div className="flex items-center gap-3">
        <Button type="button" disabled={saving} onClick={handleSave}>
          {saving ? "Guardando..." : "Guardar automatizaciones"}
        </Button>
        {saved && <span className="text-sm text-green-700">Guardado</span>}
      </div>
    </div>
  );
}
