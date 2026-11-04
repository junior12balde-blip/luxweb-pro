import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { serializeProperty } from "@/lib/serializers";

describe("serializeProperty", () => {
  it("converts Decimal and Date fields into JSON-safe primitives", () => {
    const property = {
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
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    };

    const result = serializeProperty(property);

    expect(result.nightlyPrice).toBe(145.5);
    expect(typeof result.nightlyPrice).toBe("number");
    expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(result.updatedAt).toBe("2026-01-02T00:00:00.000Z");
  });
});
