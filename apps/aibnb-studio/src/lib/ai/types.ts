/**
 * Contrato común que debe implementar cualquier proveedor de IA de texto
 * (Anthropic, OpenAI, Google AI, u otros futuros). Todo el código de
 * dominio (asistente de huéspedes, generador de anuncios, etc. — Fases
 * 3+) debe programarse contra esta interfaz, nunca contra el SDK de un
 * proveedor concreto, para poder cambiar o combinar proveedores sin tocar
 * el resto de la aplicación.
 */

export type AIProviderId = "anthropic" | "openai" | "google";

export const AI_PROVIDER_IDS: AIProviderId[] = ["anthropic", "openai", "google"];

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface GenerateTextParams {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateTextResult {
  text: string;
  provider: AIProviderId;
  model: string;
}

export interface AIProviderMetadata {
  id: AIProviderId;
  label: string;
  /** Variable de entorno que debe existir para considerar el proveedor configurado. */
  envVar: string;
  /** Dónde crear la clave — se muestra en la UI de integraciones. */
  consoleUrl: string;
}

export interface AIProvider {
  readonly metadata: AIProviderMetadata;
  /** true si la variable de entorno requerida está presente. No valida que la clave sea correcta. */
  isConfigured(): boolean;
  /**
   * Genera texto a partir de una conversación. En la Fase 2 esto NUNCA
   * realiza una llamada de red real: lanza `AIProviderNotConfiguredError`
   * si falta la clave, o `AIProviderNotImplementedError` si está
   * configurada pero la integración real aún no existe (llega en la Fase 3).
   */
  generateText(params: GenerateTextParams): Promise<GenerateTextResult>;
}

/**
 * Preferencias de IA de un anfitrión, persistidas en `User.aiPreferences`
 * (columna JSON). Solo se usan para recordar la elección del anfitrión —
 * ninguna llamada real a IA depende todavía de este valor.
 */
export interface AIPreferences {
  defaultProvider: AIProviderId | null;
}

export const DEFAULT_AI_PREFERENCES: AIPreferences = {
  defaultProvider: null,
};
