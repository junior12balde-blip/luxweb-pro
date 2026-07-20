"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FormError } from "@/components/ui/FormError";

export function NewConversationForm({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/properties/${propertyId}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: formData.get("guestName"),
        guestMessage: formData.get("guestMessage"),
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Ha ocurrido un error");
      setPending(false);
      return;
    }

    const { conversation } = await response.json();
    router.push(`/dashboard/properties/${propertyId}/messages/${conversation.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Registrar mensaje de un huésped</h2>
      <p className="text-sm text-slate-500">
        Como todavía no hay ningún canal externo conectado, registra aquí manualmente lo que te
        escribió el huésped para obtener una sugerencia de respuesta.
      </p>
      <div>
        <Label htmlFor="guestName">Nombre del huésped (opcional)</Label>
        <Input id="guestName" name="guestName" placeholder="Ej. María" />
      </div>
      <div>
        <Label htmlFor="guestMessage">Mensaje del huésped</Label>
        <textarea
          id="guestMessage"
          name="guestMessage"
          required
          rows={3}
          placeholder="Ej. Hola, ¿a qué hora podemos hacer el check-in mañana?"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <FormError message={error} />
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Iniciar conversación"}
      </Button>
    </form>
  );
}
