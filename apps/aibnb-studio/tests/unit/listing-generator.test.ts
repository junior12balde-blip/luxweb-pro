import { describe, expect, it, vi } from "vitest";
import {
  buildListingPrompt,
  generateListing,
  parseGeneratedListing,
  type ListingPropertyContext,
} from "@/lib/ai/listingGenerator";
import * as providerManager from "@/lib/ai/providerManager";

const property: ListingPropertyContext = {
  name: "Loft Cornavin",
  type: "APARTMENT",
  city: "Ginebra",
  country: "Suiza",
  maxGuests: 4,
  bedrooms: 2,
  bathrooms: 1,
  amenities: ["WiFi", "Cocina"],
  houseRules: "No fiestas.",
  currentDescription: "Loft luminoso cerca de la estación.",
};

describe("buildListingPrompt", () => {
  it("includes name, location, capacity and amenities", () => {
    const [message] = buildListingPrompt(property);
    expect(message.role).toBe("user");
    expect(message.content).toContain("Loft Cornavin");
    expect(message.content).toContain("Ginebra, Suiza");
    expect(message.content).toContain("4 huéspedes");
    expect(message.content).toContain("WiFi, Cocina");
  });

  it("instructs the model to respond with JSON only", () => {
    const [message] = buildListingPrompt(property);
    expect(message.content).toContain("ÚNICAMENTE con un objeto JSON válido");
  });

  it("omits the current-description hint when there is none", () => {
    const [message] = buildListingPrompt({ ...property, currentDescription: null });
    expect(message.content).not.toContain("Descripción actual");
  });
});

describe("parseGeneratedListing", () => {
  const validJson = JSON.stringify({
    title: "Loft luminoso junto a la estación de Ginebra",
    description: "Un espacio acogedor en el corazón de Ginebra...",
    highlights: ["WiFi de alta velocidad", "A 5 min de la estación"],
    seoKeywords: ["apartamento Ginebra", "loft Ginebra centro"],
  });

  it("parses valid JSON", () => {
    const result = parseGeneratedListing(validJson);
    expect(result.title).toContain("Loft luminoso");
    expect(result.highlights).toHaveLength(2);
  });

  it("strips a ```json code fence wrapper", () => {
    const result = parseGeneratedListing("```json\n" + validJson + "\n```");
    expect(result.title).toContain("Loft luminoso");
  });

  it("throws a clear error on malformed JSON", () => {
    expect(() => parseGeneratedListing("esto no es json")).toThrow(
      "La IA no devolvió un formato válido",
    );
  });

  it("throws a clear error when the shape doesn't match", () => {
    expect(() => parseGeneratedListing(JSON.stringify({ title: "Solo título" }))).toThrow(
      "La IA no devolvió un formato válido",
    );
  });
});

describe("generateListing", () => {
  it("resolves the provider, sends the prompt and returns the parsed listing", async () => {
    const generateText = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        title: "Título generado",
        description: "Descripción generada.",
        highlights: ["Punto 1"],
        seoKeywords: ["palabra clave"],
      }),
      provider: "anthropic",
      model: "claude-opus-4-8",
    });
    vi.spyOn(providerManager, "resolveProvider").mockReturnValue({
      metadata: { id: "anthropic", label: "Anthropic", envVar: "ANTHROPIC_API_KEY", consoleUrl: "https://x" },
      isConfigured: () => true,
      generateText,
    });

    const result = await generateListing(property, "anthropic");

    expect(providerManager.resolveProvider).toHaveBeenCalledWith("anthropic");
    expect(result.provider).toBe("anthropic");
    expect(result.model).toBe("claude-opus-4-8");
    expect(result.listing.title).toBe("Título generado");
  });
});
