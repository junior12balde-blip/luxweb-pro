import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { propertySchema } from "@/lib/validations/property";
import { serializeProperty } from "@/lib/serializers";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const properties = await prisma.property.findMany({
    where: { memberships: { some: { userId: session.user.id } } },
    orderBy: { createdAt: "desc" },
    include: { photos: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json({ properties: properties.map(serializeProperty) });
}

export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  const property = await prisma.property.create({
    data: {
      ...parsed.data,
      description: parsed.data.description || null,
      houseRules: parsed.data.houseRules || null,
      checkInTime: parsed.data.checkInTime || null,
      checkOutTime: parsed.data.checkOutTime || null,
      aiAssistantTone: parsed.data.aiAssistantTone || null,
      memberships: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
    include: { photos: true },
  });

  return NextResponse.json({ property: serializeProperty(property) }, { status: 201 });
}
