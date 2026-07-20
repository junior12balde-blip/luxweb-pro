"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROPERTY_TYPES } from "@/lib/validations/property";
import type { Property } from "@/types/property";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FormError } from "@/components/ui/FormError";
import { AmenitiesInput } from "@/components/properties/AmenitiesInput";

const TYPE_LABELS: Record<(typeof PROPERTY_TYPES)[number], string> = {
  APARTMENT: "Apartamento",
  HOUSE: "Casa",
  ROOM: "Habitación",
  STUDIO: "Estudio",
  VILLA: "Villa",
  OTHER: "Otro",
};

interface PropertyFormProps {
  property?: Property;
}

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [amenities, setAmenities] = useState<string[]>(property?.amenities ?? []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      type: formData.get("type"),
      address: formData.get("address"),
      city: formData.get("city"),
      country: formData.get("country"),
      maxGuests: formData.get("maxGuests"),
      bedrooms: formData.get("bedrooms"),
      bathrooms: formData.get("bathrooms"),
      nightlyPrice: formData.get("nightlyPrice"),
      currency: formData.get("currency"),
      description: formData.get("description"),
      active: formData.get("active") === "on",
      amenities,
      houseRules: formData.get("houseRules"),
      checkInTime: formData.get("checkInTime"),
      checkOutTime: formData.get("checkOutTime"),
      aiAssistantEnabled: formData.get("aiAssistantEnabled") === "on",
      aiAssistantTone: formData.get("aiAssistantTone"),
    };

    const url = property ? `/api/properties/${property.id}` : "/api/properties";
    const method = property ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Ha ocurrido un error");
      setPending(false);
      return;
    }

    router.push("/dashboard/properties");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre del alojamiento</Label>
        <Input id="name" name="name" required defaultValue={property?.name} />
      </div>

      <div>
        <Label htmlFor="type">Tipo</Label>
        <select
          id="type"
          name="type"
          defaultValue={property?.type ?? "APARTMENT"}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" name="address" required defaultValue={property?.address} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" name="city" required defaultValue={property?.city} />
        </div>
        <div>
          <Label htmlFor="country">País</Label>
          <Input id="country" name="country" required defaultValue={property?.country} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="maxGuests">Huéspedes máx.</Label>
          <Input
            id="maxGuests"
            name="maxGuests"
            type="number"
            min={1}
            required
            defaultValue={property?.maxGuests ?? 2}
          />
        </div>
        <div>
          <Label htmlFor="bedrooms">Habitaciones</Label>
          <Input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min={0}
            required
            defaultValue={property?.bedrooms ?? 1}
          />
        </div>
        <div>
          <Label htmlFor="bathrooms">Baños</Label>
          <Input
            id="bathrooms"
            name="bathrooms"
            type="number"
            min={0}
            required
            defaultValue={property?.bathrooms ?? 1}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nightlyPrice">Precio por noche</Label>
          <Input
            id="nightlyPrice"
            name="nightlyPrice"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={property?.nightlyPrice}
          />
        </div>
        <div>
          <Label htmlFor="currency">Moneda</Label>
          <Input
            id="currency"
            name="currency"
            maxLength={3}
            required
            defaultValue={property?.currency ?? "EUR"}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={property?.description ?? ""}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <AmenitiesInput value={amenities} onChange={setAmenities} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="checkInTime">Check-in</Label>
          <Input
            id="checkInTime"
            name="checkInTime"
            type="time"
            defaultValue={property?.checkInTime ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="checkOutTime">Check-out</Label>
          <Input
            id="checkOutTime"
            name="checkOutTime"
            type="time"
            defaultValue={property?.checkOutTime ?? ""}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="houseRules">Normas de la casa</Label>
        <textarea
          id="houseRules"
          name="houseRules"
          rows={3}
          defaultValue={property?.houseRules ?? ""}
          placeholder="Ej. No fiestas, no fumar, silencio a partir de las 22:00..."
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="active"
          defaultChecked={property?.active ?? true}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        Propiedad activa (visible en tus listados)
      </label>

      <div className="rounded-lg border border-slate-200 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-900">
          <input
            type="checkbox"
            name="aiAssistantEnabled"
            defaultChecked={property?.aiAssistantEnabled ?? false}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Activar asistente de IA para huéspedes
        </label>
        <p className="mt-1 text-xs text-slate-500">
          Sugiere respuestas a los mensajes de tus huéspedes. Tú siempre revisas y confirmas antes de que se registre como enviada.
        </p>
        <div className="mt-3">
          <Label htmlFor="aiAssistantTone">Tono deseado (opcional)</Label>
          <Input
            id="aiAssistantTone"
            name="aiAssistantTone"
            placeholder="Ej. cercano y profesional, con algo de humor"
            defaultValue={property?.aiAssistantTone ?? ""}
          />
        </div>
      </div>

      <FormError message={error} />

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : property ? "Guardar cambios" : "Crear propiedad"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/dashboard/properties")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
