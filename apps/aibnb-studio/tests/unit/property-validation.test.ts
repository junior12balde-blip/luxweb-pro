import { describe, expect, it } from "vitest";
import {
  propertySchema,
  propertyUpdateSchema,
  reorderPhotosSchema,
} from "@/lib/validations/property";

const validInput = {
  name: "Loft Cornavin",
  type: "APARTMENT",
  address: "Rue du Léman 12",
  city: "Ginebra",
  country: "Suiza",
  maxGuests: 4,
  bedrooms: 2,
  bathrooms: 1,
  nightlyPrice: 145,
  currency: "eur",
  description: "Loft luminoso cerca de la estación.",
};

describe("propertySchema", () => {
  it("accepts a valid property and uppercases the currency", () => {
    const result = propertySchema.parse(validInput);
    expect(result.currency).toBe("EUR");
    expect(result.name).toBe("Loft Cornavin");
  });

  it("rejects a name that is too short", () => {
    const result = propertySchema.safeParse({ ...validInput, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid property type", () => {
    const result = propertySchema.safeParse({ ...validInput, type: "CASTLE" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative nightly price", () => {
    const result = propertySchema.safeParse({ ...validInput, nightlyPrice: -10 });
    expect(result.success).toBe(false);
  });

  it("rejects a currency code that isn't 3 letters", () => {
    const result = propertySchema.safeParse({ ...validInput, currency: "US" });
    expect(result.success).toBe(false);
  });

  it("coerces numeric strings from form data", () => {
    const result = propertySchema.parse({
      ...validInput,
      maxGuests: "4",
      bedrooms: "2",
      bathrooms: "1",
      nightlyPrice: "145.50",
    });
    expect(result.maxGuests).toBe(4);
    expect(result.nightlyPrice).toBe(145.5);
  });

  it("allows an empty description", () => {
    const result = propertySchema.safeParse({ ...validInput, description: "" });
    expect(result.success).toBe(true);
  });

  it("defaults active to true and amenities to an empty array", () => {
    const result = propertySchema.parse(validInput);
    expect(result.active).toBe(true);
    expect(result.amenities).toEqual([]);
  });

  it("accepts a valid HH:mm check-in/check-out time", () => {
    const result = propertySchema.safeParse({
      ...validInput,
      checkInTime: "15:00",
      checkOutTime: "11:00",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed check-in time", () => {
    const result = propertySchema.safeParse({ ...validInput, checkInTime: "3pm" });
    expect(result.success).toBe(false);
  });

  it("rejects more than 40 amenities", () => {
    const amenities = Array.from({ length: 41 }, (_, i) => `Amenity ${i}`);
    const result = propertySchema.safeParse({ ...validInput, amenities });
    expect(result.success).toBe(false);
  });
});

describe("propertyUpdateSchema", () => {
  it("accepts a partial update", () => {
    const result = propertyUpdateSchema.safeParse({ name: "Nuevo nombre" });
    expect(result.success).toBe(true);
  });

  it("still validates fields that are present", () => {
    const result = propertyUpdateSchema.safeParse({ nightlyPrice: -5 });
    expect(result.success).toBe(false);
  });
});

describe("reorderPhotosSchema", () => {
  it("accepts a non-empty list of photo ids", () => {
    const result = reorderPhotosSchema.safeParse({ photoIds: ["a", "b", "c"] });
    expect(result.success).toBe(true);
  });

  it("rejects an empty list", () => {
    const result = reorderPhotosSchema.safeParse({ photoIds: [] });
    expect(result.success).toBe(false);
  });
});
