export interface ListingDraft {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  seoKeywords: string[];
  provider: string;
  model: string;
  isApplied: boolean;
  createdAt: string;
}
