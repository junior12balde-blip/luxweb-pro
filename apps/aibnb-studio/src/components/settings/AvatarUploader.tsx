"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

export function AvatarUploader({ currentAvatarUrl }: { currentAvatarUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch("/api/settings/avatar", { method: "POST", body: formData });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "No se pudo subir la imagen");
      setPending(false);
      return;
    }

    const data = await response.json();
    setPreview(data.avatarUrl);
    setPending(false);
    router.refresh();
  }

  async function handleRemove() {
    setPending(true);
    setError(null);
    await fetch("/api/settings/avatar", { method: "DELETE" });
    setPreview(null);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar viene de Supabase Storage, dominio dinámico por proyecto
          <img src={preview} alt="Foto de perfil" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-slate-400">
            👤
          </div>
        )}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {pending ? "Subiendo..." : "Cambiar foto"}
          </Button>
          {preview && (
            <Button type="button" variant="ghost" disabled={pending} onClick={handleRemove}>
              Quitar
            </Button>
          )}
        </div>
        <FormError message={error} />
      </div>
    </div>
  );
}
