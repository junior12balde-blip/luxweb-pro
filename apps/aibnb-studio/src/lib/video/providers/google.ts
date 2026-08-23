import os from "node:os";
import path from "node:path";
import { GoogleGenAI, type GenerateVideosOperation } from "@google/genai";
import type { VideoGenerationRequest, VideoJobHandle, VideoJobResult, VideoProvider } from "../types";
import { VideoProviderNotConfiguredError } from "../errors";

const ENV_VAR = "GOOGLE_AI_API_KEY";

/**
 * Modelo por defecto — el mismo que usa el ejemplo oficial del SDK
 * `@google/genai` instalado en este proyecto (ver
 * node_modules/@google/genai/dist/node/node.d.ts, JSDoc de
 * `Models.generateVideos`). Puede haber versiones más recientes de Veo
 * disponibles; se puede fijar `GEMINI_VIDEO_MODEL` sin tocar código.
 */
const DEFAULT_MODEL = "veo-2.0-generate-001";

function isConfigured(): boolean {
  return Boolean(process.env[ENV_VAR]);
}

function resolveModel(): string {
  return process.env.GEMINI_VIDEO_MODEL?.trim() || DEFAULT_MODEL;
}

function requireClient(): GoogleGenAI {
  if (!isConfigured()) {
    throw new VideoProviderNotConfiguredError("google", ENV_VAR);
  }
  return new GoogleGenAI({ apiKey: process.env[ENV_VAR] });
}

export const googleVideoProvider: VideoProvider = {
  metadata: {
    id: "google",
    label: "Google (Veo)",
    envVar: ENV_VAR,
    consoleUrl: "https://aistudio.google.com/apikey",
  },

  isConfigured,

  async startGeneration(request: VideoGenerationRequest): Promise<VideoJobHandle> {
    const ai = requireClient();
    const model = resolveModel();

    const operation = await ai.models.generateVideos({
      model,
      source: { prompt: request.prompt },
      config: {
        numberOfVideos: 1,
        aspectRatio: request.aspectRatio,
        durationSeconds: request.durationSeconds,
        negativePrompt: request.negativePrompt,
      },
    });

    if (!operation.name) {
      throw new Error("Google no devolvió un identificador de operación para la generación de vídeo.");
    }

    return { providerJobId: operation.name, model };
  },

  async checkStatus(job: VideoJobHandle): Promise<VideoJobResult> {
    const ai = requireClient();

    // La operación solo se referencia por su `name` al consultar el estado
    // (convención estándar de Long-Running Operations de Google) — no
    // tenemos el objeto original entre peticiones HTTP separadas, así que
    // reconstruimos uno mínimo que cumple la forma que exige el SDK.
    // `_fromAPIResponse` nunca se invoca sobre el parámetro de entrada (el
    // SDK lo usa para construir la respuesta, no para leer la petición).
    const pending: GenerateVideosOperation = {
      name: job.providerJobId,
      _fromAPIResponse: () => {
        throw new Error("No se debe llamar a _fromAPIResponse sobre una operación de entrada.");
      },
    };
    const operation = await ai.operations.getVideosOperation({ operation: pending });

    if (!operation.done) {
      return { status: "processing" };
    }

    if (operation.error) {
      const message =
        typeof operation.error.message === "string" ? operation.error.message : "Error desconocido";
      return { status: "failed", errorMessage: message };
    }

    const video = operation.response?.generatedVideos?.[0]?.video;
    if (!video) {
      return { status: "failed", errorMessage: "El proveedor no devolvió ningún vídeo generado." };
    }

    const localFilePath = path.join(os.tmpdir(), `${crypto.randomUUID()}.mp4`);
    await ai.files.download({ file: video, downloadPath: localFilePath });

    return {
      status: "ready",
      localFilePath,
      mimeType: video.mimeType ?? "video/mp4",
    };
  },
};
