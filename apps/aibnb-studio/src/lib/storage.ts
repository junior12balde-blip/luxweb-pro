/**
 * Constantes y validación compartidas para subidas a Supabase Storage.
 * Los buckets deben crearse manualmente en el proyecto de Supabase — ver
 * PHASE-2.md para las políticas de RLS exactas.
 */
export const AVATAR_BUCKET = "avatars";
export const PROPERTY_PHOTOS_BUCKET = "property-photos";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const EXTENSION_BY_TYPE: Record<(typeof ALLOWED_IMAGE_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateImageFile(file: File): string | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Formato no soportado. Usa JPEG, PNG o WebP.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "El archivo supera el tamaño máximo de 5 MB.";
  }
  return null;
}

export function extensionForImageType(type: string): string {
  return EXTENSION_BY_TYPE[type as (typeof ALLOWED_IMAGE_TYPES)[number]] ?? "bin";
}
