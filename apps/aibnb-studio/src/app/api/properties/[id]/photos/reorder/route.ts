import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isPropertyOwner } from "@/lib/properties";
import { reorderPhotosSchema } from "@/lib/validations/property";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: propertyId } = await params;
  if (!(await isPropertyOwner(session.user.id, propertyId))) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reorderPhotosSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  const photos = await prisma.propertyPhoto.findMany({ where: { propertyId } });
  const ownedIds = new Set(photos.map((p) => p.id));
  const validIds = parsed.data.photoIds.filter((id) => ownedIds.has(id));

  await prisma.$transaction(
    validIds.map((photoId, index) =>
      prisma.propertyPhoto.update({ where: { id: photoId }, data: { position: index } }),
    ),
  );

  return NextResponse.json({ ok: true });
}
