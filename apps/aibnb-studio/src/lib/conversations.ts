import { prisma } from "@/lib/prisma";

/** Conversación + mensajes (orden cronológico), solo si pertenece a `propertyId`. */
export async function findConversation(propertyId: string, conversationId: string) {
  return prisma.conversation.findFirst({
    where: { id: conversationId, propertyId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}
