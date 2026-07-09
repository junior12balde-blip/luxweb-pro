import type { AIProvider, GenerateTextParams, GenerateTextResult } from "../types";
import { AIProviderNotConfiguredError, AIProviderNotImplementedError } from "../errors";

const ENV_VAR = "GOOGLE_AI_API_KEY";

export const googleProvider: AIProvider = {
  metadata: {
    id: "google",
    label: "Google AI (Gemini)",
    envVar: ENV_VAR,
    consoleUrl: "https://aistudio.google.com/apikey",
  },

  isConfigured() {
    return Boolean(process.env[ENV_VAR]);
  },

  async generateText(_params: GenerateTextParams): Promise<GenerateTextResult> {
    if (!this.isConfigured()) {
      throw new AIProviderNotConfiguredError("google", ENV_VAR);
    }
    throw new AIProviderNotImplementedError("google");
  },
};
