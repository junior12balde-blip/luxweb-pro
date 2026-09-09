import type { MediaGeneration } from "@/types/media";
import { Card } from "@/components/ui/Card";

const STATUS_LABELS: Record<MediaGeneration["status"], string> = {
  PENDING: "En cola...",
  PROCESSING: "Generando...",
  READY: "Listo",
  FAILED: "Error",
};

/**
 * A diferencia de `VideoGenerationCard`, no hay sondeo: la generación de
 * imágenes (Imagen) es síncrona, así que `generation` ya llega en su
 * estado final (`READY` o `FAILED`) desde la respuesta del POST.
 */
export function ImageGenerationCard({ generation }: { generation: MediaGeneration }) {
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
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={generation.resultUrl}
          alt="Imagen generada por IA"
          className="mt-3 w-full rounded-lg"
        />
      )}

      {generation.status === "FAILED" && generation.errorMessage && (
        <p className="mt-2 text-sm text-red-600">{generation.errorMessage}</p>
      )}
    </Card>
  );
}
