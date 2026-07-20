import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, ChatMessage, GenerateTextParams, GenerateTextResult } from "../types";
import { AIProviderNotConfiguredError } from "../errors";

const ENV_VAR = "ANTHROPIC_API_KEY";

/**
 * Modelo por defecto para el asistente de huéspedes. Se mantiene en Opus
 * (el más capaz) siguiendo la recomendación de Anthropic de no degradar de
 * modelo por coste sin que sea una decisión explícita del anfitrión/equipo.
 */
const DEFAULT_MODEL = "claude-opus-4-8";

function isConfigured(): boolean {
  return Boolean(process.env[ENV_VAR]);
}

/**
 * La API de Mensajes de Anthropic separa el prompt de sistema (`system`) de
 * la lista de turnos user/assistant — a diferencia de nuestro `ChatMessage[]`
 * genérico, que admite un rol "system" mezclado con el resto.
 */
function splitSystemPrompt(messages: ChatMessage[]): {
  system: string | undefined;
  turns: { role: "user" | "assistant"; content: string }[];
} {
  const systemParts: string[] = [];
  const turns: { role: "user" | "assistant"; content: string }[] = [];

  for (const message of messages) {
    if (message.role === "system") {
      systemParts.push(message.content);
    } else {
      turns.push({ role: message.role, content: message.content });
    }
  }

  return {
    system: systemParts.length > 0 ? systemParts.join("\n\n") : undefined,
    turns,
  };
}

export const anthropicProvider: AIProvider = {
  metadata: {
    id: "anthropic",
    label: "Anthropic (Claude)",
    envVar: ENV_VAR,
    consoleUrl: "https://console.anthropic.com/",
  },

  isConfigured,

  async generateText(params: GenerateTextParams): Promise<GenerateTextResult> {
    if (!isConfigured()) {
      throw new AIProviderNotConfiguredError("anthropic", ENV_VAR);
    }

    // Lee ANTHROPIC_API_KEY del entorno automáticamente.
    const client = new Anthropic();
    const { system, turns } = splitSystemPrompt(params.messages);

    // Claude Opus 4.8 no acepta temperature/top_p/top_k — no se reenvía
    // aunque el llamador lo indique; se dirige el estilo por prompt.
    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: params.maxTokens ?? 1024,
      system,
      messages: turns,
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return { text, provider: "anthropic", model: response.model };
  },
};
