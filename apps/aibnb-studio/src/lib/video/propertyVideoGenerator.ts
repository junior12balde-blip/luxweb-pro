import type { VideoJobHandle, VideoProviderId } from "./types";
import { resolveVideoProvider } from "./videoProviderManager";

export interface VideoPropertyContext {
  name: string;
  type: string;
  city: string;
  country: string;
  amenities: string[];
  description: string | null;
}

export type VideoStyle = "cinematic" | "vertical";

/** Construye el prompt de vídeo a partir de los datos de la propiedad. No inventa nada que no esté en `property`. */
export function buildPropertyVideoPrompt(property: VideoPropertyContext, style: VideoStyle): string {
  const lines = [
    style === "vertical"
      ? "Vídeo promocional vertical, estilo TikTok/Reels/Shorts, de un alojamiento tipo Airbnb."
      : "Vídeo promocional cinematográfico de un alojamiento tipo Airbnb.",
    `Propiedad: "${property.name}" (${property.type}) en ${property.city}, ${property.country}.`,
  ];

  if (property.amenities.length > 0) {
    lines.push(`Destaca visualmente: ${property.amenities.slice(0, 5).join(", ")}.`);
  }
  if (property.description) {
    lines.push(`Ambiente a transmitir: ${property.description}`);
  }

  lines.push(
    "Iluminación cálida y acogedora, tomas fluidas de interior y exterior, sin texto en pantalla, sin personas identificables.",
  );

  return lines.join(" ");
}

export interface StartPropertyVideoResult {
  job: VideoJobHandle;
  provider: VideoProviderId;
}

export async function startPropertyVideoGeneration(
  property: VideoPropertyContext,
  style: VideoStyle,
): Promise<StartPropertyVideoResult> {
  const provider = resolveVideoProvider();
  const job = await provider.startGeneration({
    prompt: buildPropertyVideoPrompt(property, style),
    aspectRatio: style === "vertical" ? "9:16" : "16:9",
  });

  return { job, provider: provider.metadata.id };
}
