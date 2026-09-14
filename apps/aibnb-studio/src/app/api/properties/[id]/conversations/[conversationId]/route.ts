import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isPropertyOwner } from "@/lib/properties";
import { findConversation } from "@/lib/conversations";
import { serializeConversation } from "@/lib/serializers";
import { updateConversationSchema } from "@/lib/validations/conversation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; conversationId: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: propertyId, conversationId } = await params;
  if (!(await isPropertyOwner(session.user.id, propertyId))) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const existing = await findConversation(propertyId, conversationId);
  if (!existing) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateConversationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      checkInDate: parsed.data.checkInDate ? new Date(parsed.data.checkInDate) : null,
      checkOutDate: parsed.data.checkOutDate ? new Date(parsed.data.checkOutDate) : null,
    },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ conversation: serializeConversation(updated) });
}
