import type {
  Property as PrismaProperty,
  PropertyPhoto as PrismaPropertyPhoto,
  Conversation as PrismaConversation,
  Message as PrismaMessage,
  ListingDraft as PrismaListingDraft,
  MediaGeneration as PrismaMediaGeneration,
} from "@prisma/client";
import type { Property } from "@/types/property";
import type { Conversation } from "@/types/conversation";
import type { ListingDraft } from "@/types/listing";
import type { MediaGeneration } from "@/types/media";

type PrismaPropertyWithPhotos = PrismaProperty & { photos?: PrismaPropertyPhoto[] };

/** Convierte una fila de Prisma (Decimal/Date, fotos opcionales) a un objeto serializable en JSON. */
export function serializeProperty(property: PrismaPropertyWithPhotos): Property {
  return {
    ...property,
    nightlyPrice: Number(property.nightlyPrice),
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
    photos: (property.photos ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((photo) => ({
        id: photo.id,
        url: photo.url,
        alt: photo.alt,
        position: photo.position,
      })),
  };
}

type PrismaConversationWithMessages = PrismaConversation & { messages: PrismaMessage[] };

export function serializeConversation(conversation: PrismaConversationWithMessages): Conversation {
  return {
    id: conversation.id,
    guestName: conversation.guestName,
    status: conversation.status,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.messages.map((message) => ({
      id: message.id,
      sender: message.sender,
      content: message.content,
      isStyleExample: message.isStyleExample,
      createdAt: message.createdAt.toISOString(),
    })),
  };
}

export function serializeListingDraft(draft: PrismaListingDraft): ListingDraft {
  return {
    id: draft.id,
    title: draft.title,
    description: draft.description,
    highlights: draft.highlights,
    seoKeywords: draft.seoKeywords,
    provider: draft.provider,
    model: draft.model,
    isApplied: draft.isApplied,
    createdAt: draft.createdAt.toISOString(),
  };
}

export function serializeMediaGeneration(generation: PrismaMediaGeneration): MediaGeneration {
  return {
    id: generation.id,
    type: generation.type,
    status: generation.status,
    prompt: generation.prompt,
    provider: generation.provider,
    model: generation.model,
    resultUrl: generation.resultUrl,
    errorMessage: generation.errorMessage,
    createdAt: generation.createdAt.toISOString(),
  };
}
