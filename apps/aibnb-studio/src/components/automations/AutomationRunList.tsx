"use client";

import { useState } from "react";
import type { AutomationRun } from "@/types/automation";
import { AUTOMATION_TYPE_LABELS } from "@/lib/automations/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STATUS_LABELS: Record<AutomationRun["status"], string> = {
  DUE: "Pendiente",
  DONE: "Hecho",
  DISMISSED: "Descartado",
};

export function AutomationRunList({
  propertyId,
  runs: initialRuns,
}: {
  propertyId: string;
  runs: AutomationRun[];
}) {
  const [runs, setRuns] = useState(initialRuns);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function updateStatus(runId: string, status: "DONE" | "DISMISSED") {
    setPendingId(runId);

    const response = await fetch(`/api/properties/${propertyId}/automations/runs/${runId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      const { run } = await response.json();
      setRuns((prev) => prev.map((existing) => (existing.id === run.id ? run : existing)));
    }
    setPendingId(null);
  }

  if (runs.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Todavía no hay ningún recordatorio pendiente. Aparecerán aquí en cuanto se cumpla su hora
        para alguna conversación con fechas de check-in/check-out.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {runs.map((run) => (
        <Card key={run.id}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">
              {AUTOMATION_TYPE_LABELS[run.type]} — {run.guestName || "Huésped sin nombre"}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                run.status === "DUE"
                  ? "bg-amber-50 text-amber-700"
                  : run.status === "DONE"
                    ? "bg-green-50 text-green-700"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {STATUS_LABELS[run.status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Previsto para {new Date(run.scheduledFor).toLocaleString("es-ES")}
          </p>
          <p className="mt-2 text-sm text-slate-700">{run.message}</p>

          {run.status === "DUE" && (
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={pendingId === run.id}
                onClick={() => updateStatus(run.id, "DONE")}
              >
                Marcar como hecho
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={pendingId === run.id}
                onClick={() => updateStatus(run.id, "DISMISSED")}
              >
                Descartar
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
