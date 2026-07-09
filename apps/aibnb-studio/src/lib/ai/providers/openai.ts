import type { AIProvider, GenerateTextParams, GenerateTextResult } from "../types";
import { AIProviderNotConfiguredError, AIProviderNotImplementedError } from "../errors";

const ENV_VAR = "OPENAI_API_KEY";

export const openaiProvider: AIProvider = {
  metadata: {
    id: "openai",
    label: "OpenAI (GPT)",
    envVar: ENV_VAR,
    consoleUrl: "https://platform.openai.com/api-keys",
  },

  isConfigured() {
    return Boolean(process.env[ENV_VAR]);
  },

  async generateText(_params: GenerateTextParams): Promise<GenerateTextResult> {
    if (!this.isConfigured()) {
      throw new AIProviderNotConfiguredError("openai", ENV_VAR);
    }
    throw new AIProviderNotImplementedError("openai");
  },
};
