import { GoogleGenAI, PersonGeneration } from "@google/genai";
import type { ImageGenerationRequest, ImageGenerationResult, ImageProvider } from "../types";
import { ImageProviderNotConfiguredError } from "../errors";

const ENV_VAR = "GOOGLE_AI_API_KEY";

/**
 * Modelo por defecto — el mismo que usa el ejemplo oficial del SDK
 * `@google/genai` instalado en este proyecto (ver
 * node_modules/@google/genai/dist/node/node.d.ts, JSDoc de
 * `Models.generateImages`). Puede haber versiones más recientes de Imagen
 * disponibles; se puede fijar `GEMINI_IMAGE_MODEL` sin tocar código.
 */
const DEFAULT_MODEL = "imagen-4.0-generate-001";

function isConfigured(): boolean {
  return Boolean(process.env[ENV_VAR]);
}

function resolveModel(): string {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_MODEL;
}

function requireClient(): GoogleGenAI {
  if (!isConfigured()) {
    throw new ImageProviderNotConfiguredError("google", ENV_VAR);
  }
  return new GoogleGenAI({ apiKey: process.env[ENV_VAR] });
}

export const googleImageProvider: ImageProvider = {
  metadata: {
    id: "google",
    label: "Google (Imagen)",
    envVar: ENV_VAR,
    consoleUrl: "https://aistudio.google.com/apikey",
  },

  isConfigured,

  async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const ai = requireClient();
    const model = resolveModel();

    const response = await ai.models.generateImages({
      model,
      prompt: request.prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: request.aspectRatio,
        negativePrompt: request.negativePrompt,
        // Fotos de una propiedad — nunca deberían incluir personas generadas por IA.
        personGeneration: PersonGeneration.DONT_ALLOW,
      },
    });

    const image = response.generatedImages?.[0]?.image;
    if (!image?.imageBytes) {
      throw new Error("El proveedor no devolvió ninguna imagen generada.");
    }

    return {
      imageBytes: Buffer.from(image.imageBytes, "base64"),
      mimeType: image.mimeType ?? "image/png",
      model,
    };
  },
};
