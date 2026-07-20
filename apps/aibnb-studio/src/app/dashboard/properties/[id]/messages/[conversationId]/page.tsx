import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findConversation } from "@/lib/conversations";
import { serializeConversation } from "@/lib/serializers";
import { MessageThread } from "@/components/messages/MessageThread";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string; conversationId: string }>;
}) {
  const { user } = await requireUser();
  const { id: propertyId, conversationId } = await params;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, memberships: { some: { userId: user.id } } },
  });
  if (!property) {
    notFound();
  }

  const conversation = await findConversation(propertyId, conversationId);
  if (!conversation) {
    notFound();
  }

  const serialized = serializeConversation(conversation);

  return (
    <div className="max-w-2xl">
      <Link
        href={`/dashboard/properties/${propertyId}/messages`}
        className="text-sm font-medium text-brand-600 hover:underline"
      >
        ← Volver a conversaciones
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        {conversation.guestName || "Huésped sin nombre"}
      </h1>

      <div className="mt-4">
        <MessageThread
          propertyId={propertyId}
          conversationId={conversationId}
          messages={serialized.messages}
          aiAssistantEnabled={property.aiAssistantEnabled}
        />
      </div>
    </div>
  );
}
