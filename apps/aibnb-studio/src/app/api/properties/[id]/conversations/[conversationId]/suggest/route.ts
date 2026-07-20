import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { findConversation } from "@/lib/conversations";
import { suggestReply } from "@/lib/ai/guestAssistant";
import { AIProviderNotConfiguredError, AIProviderNotImplementedError } from "@/lib/ai/errors";
import type { AIPreferences } from "@/lib/ai/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; conversationId: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: propertyId, conversationId } = await params;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, memberships: { some: { userId: session.user.id } } },
  });
  if (!property) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  if (!property.aiAssistantEnabled) {
    return NextResponse.json(
      { error: "El asistente de IA no está activado para esta propiedad." },
      { status: 400 },
    );
  }

  const conversation = await findConversation(propertyId, conversationId);
  if (!conversation) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
  }

  const lastMessage = conversation.messages.at(-1);
  if (!lastMessage || lastMessage.sender !== "GUEST") {
    return NextResponse.json(
      { error: "No hay ningún mensaje nuevo del huésped que responder." },
      { status: 400 },
    );
  }

  const styleExampleRows = await prisma.message.findMany({
    where: {
      isStyleExample: true,
      sender: "HOST",
      conversation: { propertyId },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const aiPreferences = session.user.aiPreferences as AIPreferences | null;

  try {
    const result = await suggestReply({
      property: {
        name: property.name,
        city: property.city,
        country: property.country,
        houseRules: property.houseRules,
        checkInTime: property.checkInTime,
        checkOutTime: property.checkOutTime,
        amenities: property.amenities,
        aiAssistantTone: property.aiAssistantTone,
      },
      styleExamples: styleExampleRows.map((row) => ({ content: row.content })),
      conversationHistory: conversation.messages
        .slice(0, -1)
        .map((message) => ({ sender: message.sender, content: message.content })),
      guestMessage: lastMessage.content,
      preferredProvider: aiPreferences?.defaultProvider ?? null,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof AIProviderNotConfiguredError ||
      error instanceof AIProviderNotImplementedError
    ) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}
