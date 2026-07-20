import { describe, expect, it, vi } from "vitest";
import {
  buildSystemPrompt,
  suggestReply,
  toChatHistory,
  type GuestAssistantPropertyContext,
} from "@/lib/ai/guestAssistant";
import * as providerManager from "@/lib/ai/providerManager";

const property: GuestAssistantPropertyContext = {
  name: "Loft Cornavin",
  city: "Ginebra",
  country: "Suiza",
  houseRules: "No fiestas. No fumar.",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  amenities: ["WiFi", "Cocina"],
  aiAssistantTone: "cercano y profesional",
};

describe("buildSystemPrompt", () => {
  it("includes property name, location and check-in/out", () => {
    const prompt = buildSystemPrompt(property, []);
    expect(prompt).toContain("Loft Cornavin");
    expect(prompt).toContain("Ginebra, Suiza");
    expect(prompt).toContain("Check-in: 15:00");
    expect(prompt).toContain("Check-out: 11:00");
  });

  it("includes house rules, amenities and tone when present", () => {
    const prompt = buildSystemPrompt(property, []);
    expect(prompt).toContain("No fiestas");
    expect(prompt).toContain("WiFi, Cocina");
    expect(prompt).toContain("cercano y profesional");
  });

  it("omits optional sections when absent", () => {
    const prompt = buildSystemPrompt(
      { ...property, houseRules: null, checkInTime: null, checkOutTime: null, amenities: [], aiAssistantTone: null },
      [],
    );
    expect(prompt).not.toContain("Normas de la casa");
    expect(prompt).not.toContain("Servicios disponibles");
    expect(prompt).not.toContain("Tono deseado");
  });

  it("includes at most 5 style examples", () => {
    const examples = Array.from({ length: 8 }, (_, i) => ({ content: `Ejemplo ${i}` }));
    const prompt = buildSystemPrompt(property, examples);
    for (let i = 0; i < 5; i++) expect(prompt).toContain(`Ejemplo ${i}`);
    expect(prompt).not.toContain("Ejemplo 5");
  });
});

describe("toChatHistory", () => {
  it("maps GUEST to user and HOST/ASSISTANT to assistant", () => {
    const result = toChatHistory([
      { sender: "GUEST", content: "Hola" },
      { sender: "HOST", content: "Hola, bienvenido" },
      { sender: "ASSISTANT", content: "Sugerencia previa" },
    ]);
    expect(result).toEqual([
      { role: "user", content: "Hola" },
      { role: "assistant", content: "Hola, bienvenido" },
      { role: "assistant", content: "Sugerencia previa" },
    ]);
  });
});

describe("suggestReply", () => {
  it("resolves the provider with the preferred id and forwards system + history + guest message", async () => {
    const generateText = vi.fn().mockResolvedValue({
      text: "El check-in es a las 15:00.",
      provider: "anthropic",
      model: "claude-opus-4-8",
    });
    vi.spyOn(providerManager, "resolveProvider").mockReturnValue({
      metadata: { id: "anthropic", label: "Anthropic", envVar: "ANTHROPIC_API_KEY", consoleUrl: "https://x" },
      isConfigured: () => true,
      generateText,
    });

    const result = await suggestReply({
      property,
      styleExamples: [],
      conversationHistory: [{ sender: "GUEST", content: "Hola" }],
      guestMessage: "¿A qué hora es el check-in?",
      preferredProvider: "anthropic",
    });

    expect(result.text).toBe("El check-in es a las 15:00.");
    expect(providerManager.resolveProvider).toHaveBeenCalledWith("anthropic");

    const callArg = generateText.mock.calls[0][0];
    expect(callArg.messages[0]).toEqual({ role: "system", content: expect.stringContaining("Loft Cornavin") });
    expect(callArg.messages[1]).toEqual({ role: "user", content: "Hola" });
    expect(callArg.messages[2]).toEqual({ role: "user", content: "¿A qué hora es el check-in?" });
  });
});
