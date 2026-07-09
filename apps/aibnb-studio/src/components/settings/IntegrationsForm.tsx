"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AIProviderId } from "@/lib/ai/types";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { FormError } from "@/components/ui/FormError";

interface IntegrationsFormProps {
  providers: { id: AIProviderId; label: string }[];
  defaultProvider: AIProviderId | null;
}

export function IntegrationsForm({ providers, defaultProvider }: IntegrationsFormProps) {
  const router = useRouter();
  const [value, setValue] = useState<string>(defaultProvider ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);

    const response = await fetch("/api/settings/ai-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultProvider: value || null }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Ha ocurrido un error");
      setPending(false);
      return;
    }

    setSaved(true);
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-3 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <Label htmlFor="defaultProvider">Proveedor de IA preferido</Label>
        <select
          id="defaultProvider"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          <option value="">Usar el predeterminado de la plataforma</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.label}
            </option>
          ))}
        </select>
      </div>
      <FormError message={error} />
      {saved && !error && (
        <p className="text-sm text-green-700">Preferencia guardada.</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar preferencia"}
      </Button>
    </form>
  );
}
