import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { propertyUpdateSchema } from "@/lib/validations/property";
import { serializeProperty } from "@/lib/serializers";

async function findOwnedProperty(userId: string, propertyId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, memberships: { some: { userId } } },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const property = await findOwnedProperty(session.user.id, id);
  if (!property) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json({ property: serializeProperty(property) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await findOwnedProperty(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = propertyUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  const property = await prisma.property.update({
    where: { id },
    data: {
      ...parsed.data,
      description:
        parsed.data.description === undefined
          ? undefined
          : parsed.data.description || null,
    },
  });

  return NextResponse.json({ property: serializeProperty(property) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await findOwnedProperty(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  await prisma.property.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
