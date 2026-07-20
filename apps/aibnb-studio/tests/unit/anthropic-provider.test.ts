import { afterEach, describe, expect, it, vi } from "vitest";

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: createMock },
  })),
}));

import { anthropicProvider } from "@/lib/ai/providers/anthropic";
import { AIProviderNotConfiguredError } from "@/lib/ai/errors";

afterEach(() => {
  vi.unstubAllEnvs();
  createMock.mockReset();
});

describe("anthropicProvider.generateText", () => {
  it("throws AIProviderNotConfiguredError without an API key and never calls the SDK", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");

    await expect(
      anthropicProvider.generateText({ messages: [{ role: "user", content: "hola" }] }),
    ).rejects.toBeInstanceOf(AIProviderNotConfiguredError);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("splits system messages from user/assistant turns and maps the response", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-test-key");
    createMock.mockResolvedValue({
      content: [{ type: "text", text: "El check-in es a las 15:00." }],
      model: "claude-opus-4-8",
    });

    const result = await anthropicProvider.generateText({
      messages: [
        { role: "system", content: "Eres el asistente de un anfitrión de Airbnb." },
        { role: "user", content: "¿A qué hora es el check-in?" },
      ],
      maxTokens: 500,
    });

    expect(result).toEqual({
      text: "El check-in es a las 15:00.",
      provider: "anthropic",
      model: "claude-opus-4-8",
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        system: "Eres el asistente de un anfitrión de Airbnb.",
        messages: [{ role: "user", content: "¿A qué hora es el check-in?" }],
        max_tokens: 500,
      }),
    );
  });

  it("never forwards temperature/top_p (rejected by Claude Opus 4.8)", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-test-key");
    createMock.mockResolvedValue({ content: [], model: "claude-opus-4-8" });

    await anthropicProvider.generateText({
      messages: [{ role: "user", content: "hola" }],
      temperature: 0.7,
    });

    const callArgs = createMock.mock.calls[0][0];
    expect(callArgs).not.toHaveProperty("temperature");
    expect(callArgs).not.toHaveProperty("top_p");
  });

  it("concatenates multiple text blocks and trims the result", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-test-key");
    createMock.mockResolvedValue({
      content: [
        { type: "text", text: "Primera parte." },
        { type: "text", text: "Segunda parte." },
      ],
      model: "claude-opus-4-8",
    });

    const result = await anthropicProvider.generateText({
      messages: [{ role: "user", content: "hola" }],
    });

    expect(result.text).toBe("Primera parte.\nSegunda parte.");
  });
});
