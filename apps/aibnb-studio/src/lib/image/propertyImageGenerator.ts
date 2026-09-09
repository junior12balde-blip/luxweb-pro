import type { ImageGenerationResult, ImageProviderId } from "./types";
import { resolveImageProvider } from "./imageProviderManager";

export interface ImagePropertyContext {
  name: string;
  type: string;
  city: string;
  country: string;
  amenities: string[];
  description: string | null;
}

export type ImageStyle = "promotional" | "social" | "banner";

const ASPECT_RATIO_BY_STYLE: Record<ImageStyle, "4:3" | "1:1" | "16:9"> = {
  promotional: "4:3",
  social: "1:1",
  banner: "16:9",
};

/** Construye el prompt de imagen a partir de los datos de la propiedad. No inventa nada que no esté en `property`. */
export function buildPropertyImagePrompt(property: ImagePropertyContext, style: ImageStyle): string {
  const lines = [
    style === "social"
      ? "Fotografía cuadrada para redes sociales de un alojamiento tipo Airbnb."
      : style === "banner"
        ? "Fotografía panorámica tipo banner de un alojamiento tipo Airbnb."
        : "Fotografía promocional de un alojamiento tipo Airbnb.",
    `Propiedad: "${property.name}" (${property.type}) en ${property.city}, ${property.country}.`,
  ];

  if (property.amenities.length > 0) {
    lines.push(`Destaca visualmente: ${property.amenities.slice(0, 5).join(", ")}.`);
  }
  if (property.description) {
    lines.push(`Ambiente a transmitir: ${property.description}`);
  }

  lines.push(
    "Fotografía realista, iluminación natural y acogedora, sin texto en pantalla, sin personas.",
  );

  return lines.join(" ");
}

export interface GeneratePropertyImageResult {
  result: ImageGenerationResult;
  provider: ImageProviderId;
}

export async function generatePropertyImage(
  property: ImagePropertyContext,
  style: ImageStyle,
): Promise<GeneratePropertyImageResult> {
  const provider = resolveImageProvider();
  const result = await provider.generate({
    prompt: buildPropertyImagePrompt(property, style),
    aspectRatio: ASPECT_RATIO_BY_STYLE[style],
  });

  return { result, provider: provider.metadata.id };
}
