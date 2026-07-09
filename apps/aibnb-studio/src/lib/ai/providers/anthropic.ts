import type { AIProvider, GenerateTextParams, GenerateTextResult } from "../types";
import { AIProviderNotConfiguredError, AIProviderNotImplementedError } from "../errors";

const ENV_VAR = "ANTHROPIC_API_KEY";

export const anthropicProvider: AIProvider = {
  metadata: {
    id: "anthropic",
    label: "Anthropic (Claude)",
    envVar: ENV_VAR,
    consoleUrl: "https://console.anthropic.com/",
  },

  isConfigured() {
    return Boolean(process.env[ENV_VAR]);
  },

  async generateText(_params: GenerateTextParams): Promise<GenerateTextResult> {
    if (!this.isConfigured()) {
      throw new AIProviderNotConfiguredError("anthropic", ENV_VAR);
    }
    throw new AIProviderNotImplementedError("anthropic");
  },
};
