"use client";

import { useState } from "react";
import { SUGGESTED_AMENITIES } from "@/lib/validations/property";
import { Label } from "@/components/ui/Label";

interface AmenitiesInputProps {
  value: string[];
  onChange: (amenities: string[]) => void;
}

export function AmenitiesInput({ value, onChange }: AmenitiesInputProps) {
  const [draft, setDraft] = useState("");

  function addAmenity(raw: string) {
    const amenity = raw.trim();
    if (!amenity || value.includes(amenity)) return;
    onChange([...value, amenity]);
    setDraft("");
  }

  function removeAmenity(amenity: string) {
    onChange(value.filter((item) => item !== amenity));
  }

  const suggestions = SUGGESTED_AMENITIES.filter((s) => !value.includes(s));

  return (
    <div>
      <Label>Servicios (amenities)</Label>

      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {value.map((amenity) => (
            <span
              key={amenity}
              className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
            >
              {amenity}
              <button
                type="button"
                onClick={() => removeAmenity(amenity)}
                aria-label={`Quitar ${amenity}`}
                className="text-brand-500 hover:text-brand-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addAmenity(draft);
          }
        }}
        placeholder="Escribe un servicio y pulsa Enter"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addAmenity(suggestion)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-700"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
