import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { NewConversationForm } from "@/components/messages/NewConversationForm";

const SENDER_LABELS: Record<string, string> = {
  GUEST: "Huésped",
  HOST: "Tú",
  ASSISTANT: "Sugerencia IA",
};

export default async function ConversationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireUser();
  const { id: propertyId } = await params;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, memberships: { some: { userId: user.id } } },
  });
  if (!property) {
    notFound();
  }

  const conversations = await prisma.conversation.findMany({
    where: { propertyId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Mensajes de huéspedes — {property.name}
        </h1>
        {!property.aiAssistantEnabled && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            El asistente de IA está desactivado para esta propiedad. Puedes registrar
            conversaciones igualmente, pero no podrás generar sugerencias hasta que lo actives en{" "}
            <Link href={`/dashboard/properties/${propertyId}`} className="underline">
              la configuración de la propiedad
            </Link>
            .
          </p>
        )}
      </div>

      <NewConversationForm propertyId={propertyId} />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Conversaciones</h2>
        {conversations.length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no hay conversaciones registradas.</p>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => {
              const lastMessage = conversation.messages[0];
              return (
                <Link
                  key={conversation.id}
                  href={`/dashboard/properties/${propertyId}/messages/${conversation.id}`}
                >
                  <Card className="hover:border-brand-300">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">
                        {conversation.guestName || "Huésped sin nombre"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(conversation.updatedAt).toLocaleString("es-ES")}
                      </span>
                    </div>
                    {lastMessage && (
                      <p className="mt-1 truncate text-sm text-slate-500">
                        <strong>{SENDER_LABELS[lastMessage.sender]}:</strong> {lastMessage.content}
                      </p>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
