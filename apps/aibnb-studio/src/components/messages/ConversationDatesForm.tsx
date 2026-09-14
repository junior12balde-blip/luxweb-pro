"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";

function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

export function ConversationDatesForm({
  propertyId,
  conversationId,
  checkInDate,
  checkOutDate,
}: {
  propertyId: string;
  conversationId: string;
  checkInDate: string | null;
  checkOutDate: string | null;
}) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(toDateInputValue(checkInDate));
  const [checkOut, setCheckOut] = useState(toDateInputValue(checkOutDate));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const response = await fetch(
      `/api/properties/${propertyId}/conversations/${conversationId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkInDate: checkIn, checkOutDate: checkOut }),
      },
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "No se pudieron guardar las fechas");
      setSaving(false);
      return;
    }

    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div>
        <Label htmlFor="conv-checkin">Check-in</Label>
        <Input
          id="conv-checkin"
          type="date"
          value={checkIn}
          onChange={(event) => setCheckIn(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="conv-checkout">Check-out</Label>
        <Input
          id="conv-checkout"
          type="date"
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
        />
      </div>
      <Button type="button" variant="secondary" disabled={saving} onClick={handleSave}>
        {saving ? "Guardando..." : "Guardar fechas"}
      </Button>
      <FormError message={error} />
    </div>
  );
}
