import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildPropertyImagePrompt,
  generatePropertyImage,
  type ImagePropertyContext,
} from "@/lib/image/propertyImageGenerator";
import * as imageProviderManager from "@/lib/image/imageProviderManager";
import { googleImageProvider } from "@/lib/image/providers/google";
import { ImageProviderNotConfiguredError } from "@/lib/image/errors";

const property: ImagePropertyContext = {
  name: "Loft Cornavin",
  type: "APARTMENT",
  city: "Ginebra",
  country: "Suiza",
  amenities: ["WiFi", "Cocina", "Piscina"],
  description: "Loft luminoso cerca de la estación.",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("buildPropertyImagePrompt", () => {
  it("includes name, type and location for the promotional style", () => {
    const prompt = buildPropertyImagePrompt(property, "promotional");
    expect(prompt).toContain("promocional");
    expect(prompt).toContain("Loft Cornavin");
    expect(prompt).toContain("Ginebra, Suiza");
  });

  it("asks for a square photo for the social style", () => {
    const prompt = buildPropertyImagePrompt(property, "social");
    expect(prompt).toContain("cuadrada");
    expect(prompt).toContain("redes sociales");
  });

  it("asks for a panoramic photo for the banner style", () => {
    const prompt = buildPropertyImagePrompt(property, "banner");
    expect(prompt).toContain("panorámica");
  });

  it("includes amenities and description when present", () => {
    const prompt = buildPropertyImagePrompt(property, "promotional");
    expect(prompt).toContain("WiFi, Cocina, Piscina");
    expect(prompt).toContain("Loft luminoso cerca de la estación");
  });

  it("omits the description sentence when there is none", () => {
    const prompt = buildPropertyImagePrompt({ ...property, description: null }, "promotional");
    expect(prompt).not.toContain("Ambiente a transmitir");
  });
});

describe("generatePropertyImage", () => {
  it("resolves the image provider and forwards the built prompt with the right aspect ratio", async () => {
    const generate = vi
      .fn()
      .mockResolvedValue({ imageBytes: Buffer.from("fake"), mimeType: "image/png", model: "imagen-4.0-generate-001" });
    vi.spyOn(imageProviderManager, "resolveImageProvider").mockReturnValue({
      metadata: { id: "google", label: "Google (Imagen)", envVar: "GOOGLE_AI_API_KEY", consoleUrl: "https://x" },
      isConfigured: () => true,
      generate,
    });

    const result = await generatePropertyImage(property, "social");

    expect(result.provider).toBe("google");
    expect(result.result.mimeType).toBe("image/png");
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({ aspectRatio: "1:1", prompt: expect.stringContaining("Loft Cornavin") }),
    );
  });
});

describe("googleImageProvider (no real network calls)", () => {
  it("isConfigured() is false and generate() throws without an API key", async () => {
    vi.stubEnv("GOOGLE_AI_API_KEY", "");
    expect(googleImageProvider.isConfigured()).toBe(false);
    await expect(googleImageProvider.generate({ prompt: "hola" })).rejects.toBeInstanceOf(
      ImageProviderNotConfiguredError,
    );
  });
});
