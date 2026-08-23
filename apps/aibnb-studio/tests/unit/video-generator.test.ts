import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildPropertyVideoPrompt,
  startPropertyVideoGeneration,
  type VideoPropertyContext,
} from "@/lib/video/propertyVideoGenerator";
import * as videoProviderManager from "@/lib/video/videoProviderManager";
import { googleVideoProvider } from "@/lib/video/providers/google";
import { VideoProviderNotConfiguredError } from "@/lib/video/errors";

const property: VideoPropertyContext = {
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

describe("buildPropertyVideoPrompt", () => {
  it("includes name, type and location for the cinematic style", () => {
    const prompt = buildPropertyVideoPrompt(property, "cinematic");
    expect(prompt).toContain("cinematográfico");
    expect(prompt).toContain("Loft Cornavin");
    expect(prompt).toContain("Ginebra, Suiza");
  });

  it("asks for a vertical video for the vertical style", () => {
    const prompt = buildPropertyVideoPrompt(property, "vertical");
    expect(prompt).toContain("vertical");
    expect(prompt).toContain("TikTok/Reels/Shorts");
  });

  it("includes amenities and description when present", () => {
    const prompt = buildPropertyVideoPrompt(property, "cinematic");
    expect(prompt).toContain("WiFi, Cocina, Piscina");
    expect(prompt).toContain("Loft luminoso cerca de la estación");
  });

  it("omits the description sentence when there is none", () => {
    const prompt = buildPropertyVideoPrompt({ ...property, description: null }, "cinematic");
    expect(prompt).not.toContain("Ambiente a transmitir");
  });
});

describe("startPropertyVideoGeneration", () => {
  it("resolves the video provider and forwards the built prompt with the right aspect ratio", async () => {
    const startGeneration = vi.fn().mockResolvedValue({ providerJobId: "operations/abc123", model: "veo-2.0-generate-001" });
    vi.spyOn(videoProviderManager, "resolveVideoProvider").mockReturnValue({
      metadata: { id: "google", label: "Google (Veo)", envVar: "GOOGLE_AI_API_KEY", consoleUrl: "https://x" },
      isConfigured: () => true,
      startGeneration,
      checkStatus: vi.fn(),
    });

    const result = await startPropertyVideoGeneration(property, "vertical");

    expect(result.provider).toBe("google");
    expect(result.job.providerJobId).toBe("operations/abc123");
    expect(startGeneration).toHaveBeenCalledWith(
      expect.objectContaining({ aspectRatio: "9:16", prompt: expect.stringContaining("Loft Cornavin") }),
    );
  });
});

describe("googleVideoProvider (no real network calls)", () => {
  it("isConfigured() is false and startGeneration throws without an API key", async () => {
    vi.stubEnv("GOOGLE_AI_API_KEY", "");
    expect(googleVideoProvider.isConfigured()).toBe(false);
    await expect(googleVideoProvider.startGeneration({ prompt: "hola" })).rejects.toBeInstanceOf(
      VideoProviderNotConfiguredError,
    );
  });

  it("checkStatus throws without an API key", async () => {
    vi.stubEnv("GOOGLE_AI_API_KEY", "");
    await expect(
      googleVideoProvider.checkStatus({ providerJobId: "operations/abc", model: "veo-2.0-generate-001" }),
    ).rejects.toBeInstanceOf(VideoProviderNotConfiguredError);
  });
});
