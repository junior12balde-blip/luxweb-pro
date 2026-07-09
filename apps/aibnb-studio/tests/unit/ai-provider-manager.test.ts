import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getDefaultProviderId,
  getProvider,
  listProviders,
  resolveProvider,
} from "@/lib/ai/providerManager";
import {
  AIProviderNotConfiguredError,
  AIProviderNotImplementedError,
} from "@/lib/ai/errors";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("listProviders", () => {
  it("exposes exactly anthropic, openai and google", () => {
    const ids = listProviders().map((p) => p.metadata.id);
    expect(ids).toEqual(["anthropic", "openai", "google"]);
  });

  it("each provider carries a console URL to create its key", () => {
    for (const provider of listProviders()) {
      expect(provider.metadata.consoleUrl).toMatch(/^https:\/\//);
      expect(provider.metadata.envVar).toMatch(/_API_KEY$/);
    }
  });
});

describe("getDefaultProviderId", () => {
  it("falls back to anthropic when AI_DEFAULT_PROVIDER is unset", () => {
    vi.stubEnv("AI_DEFAULT_PROVIDER", "");
    expect(getDefaultProviderId()).toBe("anthropic");
  });

  it("respects a valid AI_DEFAULT_PROVIDER", () => {
    vi.stubEnv("AI_DEFAULT_PROVIDER", "openai");
    expect(getDefaultProviderId()).toBe("openai");
  });

  it("ignores an invalid AI_DEFAULT_PROVIDER value", () => {
    vi.stubEnv("AI_DEFAULT_PROVIDER", "not-a-real-provider");
    expect(getDefaultProviderId()).toBe("anthropic");
  });
});

describe("resolveProvider", () => {
  it("uses the explicit preference when given", () => {
    expect(resolveProvider("google").metadata.id).toBe("google");
  });

  it("falls back to the instance default when no preference is given", () => {
    vi.stubEnv("AI_DEFAULT_PROVIDER", "openai");
    expect(resolveProvider(null).metadata.id).toBe("openai");
  });
});

describe("provider.isConfigured / generateText", () => {
  it("reports not configured and throws AIProviderNotConfiguredError without an API key", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const provider = getProvider("anthropic");

    expect(provider.isConfigured()).toBe(false);
    await expect(
      provider.generateText({ messages: [{ role: "user", content: "hola" }] }),
    ).rejects.toBeInstanceOf(AIProviderNotConfiguredError);
  });

  it("reports configured but throws AIProviderNotImplementedError when a key is present", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test-key");
    const provider = getProvider("openai");

    expect(provider.isConfigured()).toBe(true);
    await expect(
      provider.generateText({ messages: [{ role: "user", content: "hola" }] }),
    ).rejects.toBeInstanceOf(AIProviderNotImplementedError);
  });
});
