export type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "ROOM"
  | "STUDIO"
  | "VILLA"
  | "OTHER";

export interface PropertyPhoto {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

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
  active: boolean;
  amenities: string[];
  houseRules: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  photos: PropertyPhoto[];
  createdAt: string;
  updatedAt: string;
}
