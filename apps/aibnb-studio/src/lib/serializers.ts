import type { Property as PrismaProperty } from "@prisma/client";
import type { Property } from "@/types/property";

/** Convierte una fila de Prisma (Decimal/Date) a un objeto serializable en JSON. */
export function serializeProperty(property: PrismaProperty): Property {
  return {
    ...property,
    nightlyPrice: Number(property.nightlyPrice),
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
  };
}
