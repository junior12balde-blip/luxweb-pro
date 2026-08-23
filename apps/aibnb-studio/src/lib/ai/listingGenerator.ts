import type { AIProviderId, ChatMessage } from "./types";
import { resolveProvider } from "./providerManager";
import { generatedListingSchema, type GeneratedListing } from "@/lib/validations/listing";

export interface ListingPropertyContext {
  name: string;
  type: string;
  city: string;
  country: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  houseRules: string | null;
  /** Descripción actual, si existe — se usa como contexto, no se copia literalmente. */
  currentDescription: string | null;
}

const RESPONSE_SHAPE_EXAMPLE = `{"title": "...", "description": "...", "highlights": ["...", "..."], "seoKeywords": ["...", "..."]}`;

/**
 * Construye el prompt que le pide al modelo un anuncio completo. Se le
 * fuerza a responder solo con JSON (sin backticks ni texto alrededor) para
 * poder parsearlo de forma fiable sin depender de "structured outputs"
 * específicos de un proveedor — así el mismo código sirve para cualquier
 * AIProvider que devuelva texto.
 */
export function buildListingPrompt(property: ListingPropertyContext): ChatMessage[] {
  const lines = [
    "Eres un copywriter experto en anuncios de alojamientos tipo Airbnb.",
    `Escribe un anuncio para: "${property.name}" (${property.type}) en ${property.city}, ${property.country}.`,
    `Admite hasta ${property.maxGuests} huéspedes, ${property.bedrooms} habitaciones, ${property.bathrooms} baños.`,
  ];

  if (property.amenities.length > 0) {
    lines.push(`Servicios disponibles: ${property.amenities.join(", ")}.`);
  }
  if (property.houseRules) {
    lines.push(`Normas de la casa (no las repitas literalmente, solo tenlas en cuenta): ${property.houseRules}`);
  }
  if (property.currentDescription) {
    lines.push(
      `Descripción actual, como referencia de qué se quiere destacar (no la copies, mejórala): "${property.currentDescription}"`,
    );
  }

  lines.push(
    "Genera: un título atractivo (máx. 100 caracteres), una descripción persuasiva y optimizada para SEO (2-4 párrafos), de 3 a 6 puntos destacados (highlights) breves, y de 5 a 10 palabras clave SEO relevantes para búsquedas de alojamiento en esa ciudad.",
    "No inventes servicios ni datos que no se te han dado.",
    `Responde ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después, sin bloques de código, con exactamente esta forma: ${RESPONSE_SHAPE_EXAMPLE}`,
  );

  return [{ role: "user", content: lines.join("\n") }];
}

/** Quita un posible envoltorio ```json ... ``` y parsea/valida el JSON del modelo. */
export function parseGeneratedListing(rawText: string): GeneratedListing {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("La IA no devolvió un formato válido. Inténtalo de nuevo.");
  }

  const result = generatedListingSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("La IA no devolvió un formato válido. Inténtalo de nuevo.");
  }
  return result.data;
}

export interface GenerateListingResult {
  listing: GeneratedListing;
  provider: AIProviderId;
  model: string;
}

export async function generateListing(
  property: ListingPropertyContext,
  preferredProvider?: AIProviderId | null,
): Promise<GenerateListingResult> {
  const provider = resolveProvider(preferredProvider);
  const result = await provider.generateText({
    messages: buildListingPrompt(property),
    maxTokens: 1200,
  });

  return {
    listing: parseGeneratedListing(result.text),
    provider: result.provider,
    model: result.model,
  };
}
