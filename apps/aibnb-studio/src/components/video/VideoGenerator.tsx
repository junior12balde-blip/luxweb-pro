"use client";

import { useState } from "react";
import type { MediaGeneration } from "@/types/media";
import { VIDEO_STYLES } from "@/lib/validations/video";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { FormError } from "@/components/ui/FormError";
import { VideoGenerationCard } from "@/components/video/VideoGenerationCard";

const STYLE_LABELS: Record<(typeof VIDEO_STYLES)[number], string> = {
  cinematic: "Cinematográfico (16:9)",
  vertical: "Vertical — TikTok/Reels/Shorts (9:16)",
};

export function VideoGenerator({
  propertyId,
  generations: initialGenerations,
}: {
  propertyId: string;
  generations: MediaGeneration[];
}) {
  const [generations, setGenerations] = useState(initialGenerations);
  const [style, setStyle] = useState<(typeof VIDEO_STYLES)[number]>("cinematic");
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    const response = await fetch(`/api/properties/${propertyId}/media-generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ style }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "No se pudo iniciar la generación del vídeo");
      setGenerating(false);
      return;
    }

    const { generation } = await response.json();
    setGenerations((prev) => [generation, ...prev]);
    setGenerating(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Generar vídeo</h2>
        <p className="mt-1 text-xs text-slate-500">
          Vídeo promocional generado por IA a partir de los datos de la propiedad. La generación
          tarda varios minutos.
        </p>

        <div className="mt-3 flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="style">Formato</Label>
            <select
              id="style"
              value={style}
              onChange={(event) => setStyle(event.target.value as (typeof VIDEO_STYLES)[number])}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {VIDEO_STYLES.map((value) => (
                <option key={value} value={value}>
                  {STYLE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" disabled={generating} onClick={handleGenerate}>
            {generating ? "Iniciando..." : "🎬 Generar vídeo"}
          </Button>
        </div>
        <FormError message={error} />
      </div>

      {generations.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no has generado ningún vídeo.</p>
      ) : (
        <div className="space-y-3">
          {generations.map((generation) => (
            <VideoGenerationCard
              key={generation.id}
              propertyId={propertyId}
              initialGeneration={generation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
