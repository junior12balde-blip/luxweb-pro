import type { AIProvider, AIProviderId } from "./types";
import { AI_PROVIDER_IDS } from "./types";
import { anthropicProvider } from "./providers/anthropic";
import { openaiProvider } from "./providers/openai";
import { googleProvider } from "./providers/google";

/**
 * Registro central de proveedores de IA. Añadir un proveedor nuevo consiste
 * en crear su módulo en `providers/` (implementando `AIProvider`) y
 * registrarlo aquí — el resto de la aplicación (páginas, API routes,
 * futuras Fases 3+) solo debe importar desde este archivo, nunca un
 * proveedor concreto directamente.
 */
const registry: Record<AIProviderId, AIProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  google: googleProvider,
};

const FALLBACK_PROVIDER: AIProviderId = "anthropic";

export function getProvider(id: AIProviderId): AIProvider {
  return registry[id];
}

export function listProviders(): AIProvider[] {
  return AI_PROVIDER_IDS.map((id) => registry[id]);
}

/**
 * Proveedor por defecto de la instancia: `AI_DEFAULT_PROVIDER` (variable de
 * entorno, no secreta) si está definida y es válida, si no `anthropic`.
 */
export function getDefaultProviderId(): AIProviderId {
  const envDefault = process.env.AI_DEFAULT_PROVIDER;
  if (isAIProviderId(envDefault)) {
    return envDefault;
  }
  return FALLBACK_PROVIDER;
}

/** Resuelve qué proveedor usar: la preferencia dada (p. ej. la del usuario) o el de la instancia. */
export function resolveProvider(preferred?: AIProviderId | null): AIProvider {
  const id = preferred ?? getDefaultProviderId();
  return getProvider(id);
}

export function isAIProviderId(value: unknown): value is AIProviderId {
  return typeof value === "string" && (AI_PROVIDER_IDS as string[]).includes(value);
}
