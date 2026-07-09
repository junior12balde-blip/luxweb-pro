import type { Property as PrismaProperty, PropertyPhoto as PrismaPropertyPhoto } from "@prisma/client";
import type { Property } from "@/types/property";

type PrismaPropertyWithPhotos = PrismaProperty & { photos?: PrismaPropertyPhoto[] };

/** Convierte una fila de Prisma (Decimal/Date, fotos opcionales) a un objeto serializable en JSON. */
export function serializeProperty(property: PrismaPropertyWithPhotos): Property {
  return {
    ...property,
    nightlyPrice: Number(property.nightlyPrice),
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
    photos: (property.photos ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((photo) => ({
        id: photo.id,
        url: photo.url,
        alt: photo.alt,
        position: photo.position,
      })),
  };
}
