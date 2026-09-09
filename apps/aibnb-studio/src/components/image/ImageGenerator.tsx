"use client";

import { useState } from "react";
import type { MediaGeneration } from "@/types/media";
import { IMAGE_STYLES } from "@/lib/validations/image";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { FormError } from "@/components/ui/FormError";
import { ImageGenerationCard } from "@/components/image/ImageGenerationCard";

const STYLE_LABELS: Record<(typeof IMAGE_STYLES)[number], string> = {
  promotional: "Promocional (4:3)",
  social: "Redes sociales — cuadrada (1:1)",
  banner: "Banner panorámico (16:9)",
};

export function ImageGenerator({
  propertyId,
  generations: initialGenerations,
}: {
  propertyId: string;
  generations: MediaGeneration[];
}) {
  const [generations, setGenerations] = useState(initialGenerations);
  const [style, setStyle] = useState<(typeof IMAGE_STYLES)[number]>("promotional");
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    const response = await fetch(`/api/properties/${propertyId}/image-generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ style }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? "No se pudo generar la imagen");
      setGenerating(false);
      return;
    }

    setGenerations((prev) => [data.generation, ...prev]);
    setGenerating(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Generar imagen</h2>
        <p className="mt-1 text-xs text-slate-500">
          Imagen promocional generada por IA a partir de los datos de la propiedad. A diferencia
          del vídeo, el resultado llega en segundos.
        </p>

        <div className="mt-3 flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="style">Formato</Label>
            <select
              id="style"
              value={style}
              onChange={(event) => setStyle(event.target.value as (typeof IMAGE_STYLES)[number])}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {IMAGE_STYLES.map((value) => (
                <option key={value} value={value}>
                  {STYLE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" disabled={generating} onClick={handleGenerate}>
            {generating ? "Generando..." : "🖼️ Generar imagen"}
          </Button>
        </div>
        <FormError message={error} />
      </div>

      {generations.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no has generado ninguna imagen.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {generations.map((generation) => (
            <ImageGenerationCard key={generation.id} generation={generation} />
          ))}
        </div>
      )}
    </div>
  );
}
