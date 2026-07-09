"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PropertyPhoto } from "@/types/property";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

export function PhotoGallery({
  propertyId,
  photos,
}: {
  propertyId: string;
  photos: PropertyPhoto[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch(`/api/properties/${propertyId}/photos`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "No se pudo subir la foto");
      setPending(false);
      return;
    }

    if (inputRef.current) inputRef.current.value = "";
    setPending(false);
    router.refresh();
  }

  async function handleRemove(photoId: string) {
    setPending(true);
    setError(null);
    await fetch(`/api/properties/${propertyId}/photos/${photoId}`, { method: "DELETE" });
    setPending(false);
    router.refresh();
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const reordered = photos.map((p) => p.id);
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    setPending(true);
    await fetch(`/api/properties/${propertyId}/photos/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoIds: reordered }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div>
      {photos.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element -- foto viene de Supabase Storage, dominio dinámico por proyecto */}
              <img src={photo.url} alt={photo.alt ?? ""} className="h-28 w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-1 py-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  disabled={pending || index === 0}
                  onClick={() => handleMove(index, -1)}
                  className="px-1 text-xs text-white disabled:opacity-30"
                  aria-label="Mover a la izquierda"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleRemove(photo.id)}
                  className="px-1 text-xs text-white"
                  aria-label="Eliminar foto"
                >
                  🗑
                </button>
                <button
                  type="button"
                  disabled={pending || index === photos.length - 1}
                  onClick={() => handleMove(index, 1)}
                  className="px-1 text-xs text-white disabled:opacity-30"
                  aria-label="Mover a la derecha"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleUpload}
      />
      <Button
        type="button"
        variant="secondary"
        disabled={pending || photos.length >= 20}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? "Subiendo..." : "Añadir foto"}
      </Button>
      {photos.length >= 20 && (
        <p className="mt-1 text-xs text-slate-400">Límite de 20 fotos alcanzado.</p>
      )}
      <FormError message={error} />
    </div>
  );
}
