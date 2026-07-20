import type { AIProviderId, ChatMessage } from "./types";
import { resolveProvider } from "./providerManager";

export interface GuestAssistantPropertyContext {
  name: string;
  city: string;
  country: string;
  houseRules: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  amenities: string[];
  aiAssistantTone: string | null;
}

export interface StyleExample {
  content: string;
}

/** Mensaje de una Conversation, en el orden en que se guardó. */
export interface ConversationMessage {
  sender: "GUEST" | "HOST" | "ASSISTANT";
  content: string;
}

const MAX_STYLE_EXAMPLES = 5;

/**
 * Construye el system prompt: información de la propiedad + ejemplos del
 * estilo de escritura del anfitrión (few-shot), para que la sugerencia suene
 * a él y no a una respuesta genérica.
 */
export function buildSystemPrompt(
  property: GuestAssistantPropertyContext,
  styleExamples: StyleExample[],
): string {
  const lines = [
    `Eres el asistente de mensajería de un anfitrión de Airbnb para la propiedad "${property.name}" en ${property.city}, ${property.country}.`,
    "Responde siempre en el mismo idioma en el que escribe el huésped, sin mencionar que eres una IA.",
    "Sé breve, cálido y profesional. No inventes información que no esté indicada a continuación.",
  ];

  if (property.aiAssistantTone) {
    lines.push(`Tono deseado por el anfitrión: ${property.aiAssistantTone}.`);
  }
  if (property.checkInTime || property.checkOutTime) {
    lines.push(
      `Check-in: ${property.checkInTime ?? "no especificado"}. Check-out: ${property.checkOutTime ?? "no especificado"}.`,
    );
  }
  if (property.amenities.length > 0) {
    lines.push(`Servicios disponibles: ${property.amenities.join(", ")}.`);
  }
  if (property.houseRules) {
    lines.push(`Normas de la casa: ${property.houseRules}`);
  }

  if (styleExamples.length > 0) {
    lines.push(
      "Ejemplos de cómo escribe normalmente este anfitrión (imita el tono y el estilo, no copies el contenido literal):",
      ...styleExamples
        .slice(0, MAX_STYLE_EXAMPLES)
        .map((example, i) => `${i + 1}. "${example.content}"`),
    );
  }

  return lines.join("\n");
}

/** GUEST → user; HOST/ASSISTANT → assistant (ambos son "la voz del anfitrión" de cara al modelo). */
export function toChatHistory(messages: ConversationMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    role: message.sender === "GUEST" ? "user" : "assistant",
    content: message.content,
  }));
}

export interface SuggestReplyParams {
  property: GuestAssistantPropertyContext;
  styleExamples: StyleExample[];
  /** Mensajes previos de la conversación, en orden cronológico (sin incluir `guestMessage`). */
  conversationHistory: ConversationMessage[];
  guestMessage: string;
  preferredProvider?: AIProviderId | null;
}

export interface SuggestReplyResult {
  text: string;
  provider: AIProviderId;
  model: string;
}

/**
 * Genera una sugerencia de respuesta para el último mensaje de un huésped.
 * No persiste nada — quien la llama decide si guardarla como mensaje del
 * anfitrión (tras revisión) o descartarla.
 */
export async function suggestReply(params: SuggestReplyParams): Promise<SuggestReplyResult> {
  const system = buildSystemPrompt(params.property, params.styleExamples);
  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...toChatHistory(params.conversationHistory),
    { role: "user", content: params.guestMessage },
  ];

  const provider = resolveProvider(params.preferredProvider);
  return provider.generateText({ messages, maxTokens: 500 });
}
