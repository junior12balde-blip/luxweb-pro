/**
 * Contrato para proveedores de generación de vídeo por IA. Deliberadamente
 * separado de `src/lib/ai/types.ts` (proveedores de texto): la generación
 * de vídeo es un trabajo asíncrono de larga duración (minutos) con
 * consulta de estado, no una llamada síncrona que devuelve texto.
 */

export type VideoProviderId = "google";

export interface VideoProviderMetadata {
  id: VideoProviderId;
  label: string;
  /** Variable de entorno que debe existir para considerar el proveedor configurado. */
  envVar: string;
  /** Dónde crear la clave — se muestra en la UI. */
  consoleUrl: string;
}

export interface VideoGenerationRequest {
  prompt: string;
  /** "16:9" (horizontal) o "9:16" (vertical, para TikTok/Reels/Shorts). */
  aspectRatio?: "16:9" | "9:16";
  durationSeconds?: number;
  negativePrompt?: string;
}

/** Identificador del trabajo asíncrono devuelto al iniciar una generación. */
export interface VideoJobHandle {
  /** Identificador de la operación del proveedor, usado para consultar su estado más tarde. */
  providerJobId: string;
  model: string;
}

export type VideoJobStatus = "processing" | "ready" | "failed";

export interface VideoJobResult {
  status: VideoJobStatus;
  /**
   * Ruta local temporal del vídeo ya descargado — solo presente si
   * `status === "ready"`. El llamador es responsable de subirlo a
   * almacenamiento persistente (Supabase Storage) y borrar el archivo
   * temporal después; el proveedor no conoce Supabase.
   */
  localFilePath?: string;
  mimeType?: string;
  errorMessage?: string;
}

export interface VideoProvider {
  readonly metadata: VideoProviderMetadata;
  isConfigured(): boolean;
  startGeneration(request: VideoGenerationRequest): Promise<VideoJobHandle>;
  checkStatus(job: VideoJobHandle): Promise<VideoJobResult>;
}
