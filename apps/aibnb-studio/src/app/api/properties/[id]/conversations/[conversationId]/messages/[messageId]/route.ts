import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isPropertyOwner } from "@/lib/properties";
import { updateMessageSchema } from "@/lib/validations/conversation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; conversationId: string; messageId: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: propertyId, conversationId, messageId } = await params;
  if (!(await isPropertyOwner(session.user.id, propertyId))) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  const existing = await prisma.message.findFirst({
    where: { id: messageId, conversationId, conversation: { propertyId } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
  }

  const message = await prisma.message.update({
    where: { id: messageId },
    data: { isStyleExample: parsed.data.isStyleExample },
  });

  return NextResponse.json({ message });
}
