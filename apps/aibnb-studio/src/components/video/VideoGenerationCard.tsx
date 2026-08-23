"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaGeneration } from "@/types/media";
import { Card } from "@/components/ui/Card";

const POLL_INTERVAL_MS = 10_000;

const STATUS_LABELS: Record<MediaGeneration["status"], string> = {
  PENDING: "En cola...",
  PROCESSING: "Generando... puede tardar varios minutos",
  READY: "Listo",
  FAILED: "Error",
};

export function VideoGenerationCard({
  propertyId,
  initialGeneration,
}: {
  propertyId: string;
  initialGeneration: MediaGeneration;
}) {
  const [generation, setGeneration] = useState(initialGeneration);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const isTerminal = generation.status === "READY" || generation.status === "FAILED";
    if (isTerminal) return;

    timeoutRef.current = setTimeout(async () => {
      const response = await fetch(
        `/api/properties/${propertyId}/media-generations/${generation.id}/status`,
      );
      if (response.ok) {
        const data = await response.json();
        setGeneration(data.generation);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [propertyId, generation]);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {new Date(generation.createdAt).toLocaleString("es-ES")} · {generation.provider}/
          {generation.model}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            generation.status === "READY"
              ? "bg-green-50 text-green-700"
              : generation.status === "FAILED"
                ? "bg-red-50 text-red-700"
                : "bg-slate-100 text-slate-500"
          }`}
        >
          {STATUS_LABELS[generation.status]}
        </span>
      </div>

      {generation.status === "READY" && generation.resultUrl && (
        <video controls className="mt-3 w-full rounded-lg" src={generation.resultUrl} />
      )}

      {generation.status === "FAILED" && generation.errorMessage && (
        <p className="mt-2 text-sm text-red-600">{generation.errorMessage}</p>
      )}

      {(generation.status === "PENDING" || generation.status === "PROCESSING") && (
        <p className="mt-2 text-sm text-slate-500">
          Esto puede tardar varios minutos. Esta página comprobará el estado automáticamente.
        </p>
      )}
    </Card>
  );
}
