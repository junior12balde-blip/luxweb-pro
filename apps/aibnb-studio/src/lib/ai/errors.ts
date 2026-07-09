import type { AIProviderId } from "./types";

/** Falta la variable de entorno requerida por el proveedor. */
export class AIProviderNotConfiguredError extends Error {
  constructor(
    public readonly providerId: AIProviderId,
    public readonly envVar: string,
  ) {
    super(
      `El proveedor de IA "${providerId}" no está configurado: falta la variable de entorno ${envVar}.`,
    );
    this.name = "AIProviderNotConfiguredError";
  }
}

/**
 * El proveedor está configurado (la clave existe) pero la Fase 2 todavía
 * no implementa llamadas reales a esta API — llega en la Fase 3.
 */
export class AIProviderNotImplementedError extends Error {
  constructor(public readonly providerId: AIProviderId) {
    super(
      `El proveedor de IA "${providerId}" está configurado, pero las llamadas reales se implementarán en la Fase 3 (Asistente de IA para huéspedes).`,
    );
    this.name = "AIProviderNotImplementedError";
  }
}
