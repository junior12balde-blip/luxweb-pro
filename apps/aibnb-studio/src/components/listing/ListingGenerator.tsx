"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ListingDraft } from "@/types/listing";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";

export function ListingGenerator({
  propertyId,
  drafts,
}: {
  propertyId: string;
  drafts: ListingDraft[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const baseUrl = `/api/properties/${propertyId}/listing-drafts`;

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const response = await fetch(baseUrl, { method: "POST" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "No se pudo generar el anuncio");
      setGenerating(false);
      return;
    }
    setGenerating(false);
    router.refresh();
  }

  async function handleApply(draftId: string, applyToDescription: boolean) {
    setApplyingId(draftId);
    setError(null);
    const response = await fetch(`${baseUrl}/${draftId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applyToDescription }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "No se pudo aplicar esta versión");
      setApplyingId(null);
      return;
    }
    setApplyingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Generar anuncio</h2>
            <p className="text-xs text-slate-500">
              Título, descripción, puntos destacados y palabras clave SEO, generados a partir de
              los datos de la propiedad.
            </p>
          </div>
          <Button type="button" disabled={generating} onClick={handleGenerate}>
            {generating ? "Generando..." : "✨ Generar anuncio"}
          </Button>
        </div>
        <FormError message={error} />
      </div>

      {drafts.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no has generado ningún anuncio.</p>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <Card key={draft.id} className={draft.isApplied ? "border-brand-300" : undefined}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{draft.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(draft.createdAt).toLocaleString("es-ES")} · {draft.provider}/
                    {draft.model}
                  </p>
                </div>
                {draft.isApplied && (
                  <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    En uso
                  </span>
                )}
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {draft.description}
              </p>

              {draft.highlights.length > 0 && (
                <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                  {draft.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              )}

              {draft.seoKeywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {draft.seoKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {!draft.isApplied && (
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={applyingId === draft.id}
                    onClick={() => handleApply(draft.id, false)}
                  >
                    Marcar como versión en uso
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={applyingId === draft.id}
                    onClick={() => handleApply(draft.id, true)}
                  >
                    Usar también como descripción de la propiedad
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
