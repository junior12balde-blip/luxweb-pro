import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { applyListingDraftSchema } from "@/lib/validations/listing";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; draftId: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: propertyId, draftId } = await params;
  const property = await prisma.property.findFirst({
    where: { id: propertyId, memberships: { some: { userId: session.user.id } } },
  });
  if (!property) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const draft = await prisma.listingDraft.findFirst({ where: { id: draftId, propertyId } });
  if (!draft) {
    return NextResponse.json({ error: "Versión no encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = applyListingDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  await prisma.$transaction([
    prisma.listingDraft.updateMany({ where: { propertyId }, data: { isApplied: false } }),
    prisma.listingDraft.update({ where: { id: draftId }, data: { isApplied: true } }),
    ...(parsed.data.applyToDescription
      ? [prisma.property.update({ where: { id: propertyId }, data: { description: draft.description } })]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
