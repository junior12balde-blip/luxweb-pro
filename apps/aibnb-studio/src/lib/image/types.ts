/**
 * Contrato para proveedores de generación de imágenes por IA. A diferencia
 * de `src/lib/video/types.ts`, la generación de imágenes con Imagen es una
 * llamada síncrona que devuelve el resultado directamente — no hay trabajo
 * asíncrono ni consulta de estado posterior.
 */

export type ImageProviderId = "google";

export interface ImageProviderMetadata {
  id: ImageProviderId;
  label: string;
  /** Variable de entorno que debe existir para considerar el proveedor configurado. */
  envVar: string;
  /** Dónde crear la clave — se muestra en la UI. */
  consoleUrl: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  /** Relaciones de aspecto soportadas por Imagen: cuadrada, foto clásica o panorámica. */
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  negativePrompt?: string;
}

export interface ImageGenerationResult {
  imageBytes: Buffer;
  mimeType: string;
  model: string;
}

export interface ImageProvider {
  readonly metadata: ImageProviderMetadata;
  isConfigured(): boolean;
  generate(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
}
