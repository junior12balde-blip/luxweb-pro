import { prisma } from "@/lib/prisma";

/** Propiedad + fotos, solo si `userId` es miembro (cualquier rol). `null` si no existe o no pertenece al usuario. */
export async function findOwnedProperty(userId: string, propertyId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, memberships: { some: { userId } } },
    include: { photos: { orderBy: { position: "asc" } } },
  });
}

/** Comprobación ligera de pertenencia, sin cargar la propiedad completa. */
export async function isPropertyOwner(userId: string, propertyId: string): Promise<boolean> {
  const count = await prisma.membership.count({ where: { userId, propertyId } });
  return count > 0;
}
