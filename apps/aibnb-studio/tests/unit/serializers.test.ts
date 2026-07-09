import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { serializeProperty } from "@/lib/serializers";

const baseProperty = {
  id: "prop_1",
  name: "Loft Cornavin",
  type: "APARTMENT" as const,
  address: "Rue du Léman 12",
  city: "Ginebra",
  country: "Suiza",
  maxGuests: 4,
  bedrooms: 2,
  bathrooms: 1,
  nightlyPrice: new Prisma.Decimal("145.50"),
  currency: "CHF",
  description: null,
  active: true,
  amenities: ["WiFi", "Cocina"],
  houseRules: null,
  checkInTime: "15:00",
  checkOutTime: "11:00",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
};

describe("serializeProperty", () => {
  it("converts Decimal and Date fields into JSON-safe primitives", () => {
    const result = serializeProperty(baseProperty);

    expect(result.nightlyPrice).toBe(145.5);
    expect(typeof result.nightlyPrice).toBe("number");
    expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(result.updatedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("defaults photos to an empty array when not included", () => {
    const result = serializeProperty(baseProperty);
    expect(result.photos).toEqual([]);
  });

  it("sorts photos by position and maps to the public shape", () => {
    const result = serializeProperty({
      ...baseProperty,
      photos: [
        {
          id: "photo_2",
          url: "https://example.com/2.jpg",
          alt: null,
          position: 1,
          propertyId: "prop_1",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
        },
        {
          id: "photo_1",
          url: "https://example.com/1.jpg",
          alt: "Salón",
          position: 0,
          propertyId: "prop_1",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ],
    });

    expect(result.photos.map((p) => p.id)).toEqual(["photo_1", "photo_2"]);
    expect(result.photos[0]).toEqual({
      id: "photo_1",
      url: "https://example.com/1.jpg",
      alt: "Salón",
      position: 0,
    });
  });
});
