export type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "ROOM"
  | "STUDIO"
  | "VILLA"
  | "OTHER";

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  city: string;
  country: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  nightlyPrice: number;
  currency: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
