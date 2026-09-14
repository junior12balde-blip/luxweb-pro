import type {
  Property as PrismaProperty,
  PropertyPhoto as PrismaPropertyPhoto,
  Conversation as PrismaConversation,
  Message as PrismaMessage,
  ListingDraft as PrismaListingDraft,
  MediaGeneration as PrismaMediaGeneration,
  Automation as PrismaAutomation,
  AutomationRun as PrismaAutomationRun,
} from "@prisma/client";
import type { Property } from "@/types/property";
import type { Conversation } from "@/types/conversation";
import type { ListingDraft } from "@/types/listing";
import type { MediaGeneration } from "@/types/media";
import type { AutomationConfig, AutomationRun } from "@/types/automation";

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
    checkInDate: conversation.checkInDate?.toISOString() ?? null,
    checkOutDate: conversation.checkOutDate?.toISOString() ?? null,
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

export function serializeAutomation(automation: PrismaAutomation): AutomationConfig {
  return {
    id: automation.id,
    type: automation.type,
    enabled: automation.enabled,
    offsetHours: automation.offsetHours,
    messageTemplate: automation.messageTemplate,
  };
}

type PrismaAutomationRunWithRelations = PrismaAutomationRun & {
  automation: PrismaAutomation;
  conversation: { guestName: string | null };
};

export function serializeAutomationRun(run: PrismaAutomationRunWithRelations): AutomationRun {
  return {
    id: run.id,
    type: run.automation.type,
    status: run.status,
    scheduledFor: run.scheduledFor.toISOString(),
    message: run.message,
    conversationId: run.conversationId,
    guestName: run.conversation.guestName,
    createdAt: run.createdAt.toISOString(),
  };
}
