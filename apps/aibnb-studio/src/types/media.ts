export type MediaType = "VIDEO" | "IMAGE";
export type MediaGenerationStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export interface MediaGeneration {
  id: string;
  type: MediaType;
  status: MediaGenerationStatus;
  prompt: string;
  provider: string;
  model: string;
  resultUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
}
