import { afterEach, describe, expect, it, vi } from "vitest";
import { computeNightsOverlap, getDefaultRange } from "@/lib/analytics/metrics";
import { buildAnalyticsCsv } from "@/lib/analytics/csv";
import type { PropertyMetrics } from "@/types/analytics";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: { findMany: vi.fn() },
  },
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getDefaultRange", () => {
  it("spans exactly `days` calendar days ending today", () => {
    const range = getDefaultRange(30);
    const nights = Math.round((range.to.getTime() - range.from.getTime()) / (24 * 60 * 60 * 1000));
    expect(nights).toBe(30);
  });
});

describe("computeNightsOverlap", () => {
  const range = { from: new Date("2026-06-01T00:00:00.000Z"), to: new Date("2026-06-30T23:59:59.999Z") };

  it("returns the full stay when it's entirely inside the range", () => {
    const nights = computeNightsOverlap(
      new Date("2026-06-10T00:00:00.000Z"),
      new Date("2026-06-15T00:00:00.000Z"),
      range,
    );
    expect(nights).toBe(5);
  });

  it("clips a stay that starts before the range", () => {
    const nights = computeNightsOverlap(
      new Date("2026-05-28T00:00:00.000Z"),
      new Date("2026-06-03T00:00:00.000Z"),
      range,
    );
    expect(nights).toBe(2);
  });

  it("returns 0 when the stay doesn't overlap the range at all", () => {
    const nights = computeNightsOverlap(
      new Date("2026-07-01T00:00:00.000Z"),
      new Date("2026-07-05T00:00:00.000Z"),
      range,
    );
    expect(nights).toBe(0);
  });
});

describe("computeUserMetrics", () => {
  async function getMockedPrisma() {
    const { prisma } = await import("@/lib/prisma");
    return prisma as unknown as { property: { findMany: ReturnType<typeof vi.fn> } };
  }

  it("groups estimated revenue by currency and never sums different currencies together", async () => {
    const prisma = await getMockedPrisma();
    const range = { from: new Date("2026-06-01T00:00:00.000Z"), to: new Date("2026-06-30T23:59:59.999Z") };

    prisma.property.findMany.mockResolvedValue([
      {
        id: "prop_eur",
        name: "Loft Ginebra",
        currency: "EUR",
        nightlyPrice: { toString: () => "100" },
        conversations: [
          { checkInDate: new Date("2026-06-10T00:00:00.000Z"), checkOutDate: new Date("2026-06-15T00:00:00.000Z") },
        ],
      },
      {
        id: "prop_usd",
        name: "Cabin Denver",
        currency: "USD",
        nightlyPrice: { toString: () => "80" },
        conversations: [
          { checkInDate: new Date("2026-06-05T00:00:00.000Z"), checkOutDate: new Date("2026-06-08T00:00:00.000Z") },
        ],
      },
    ]);

    const { computeUserMetrics } = await import("@/lib/analytics/metrics");
    const result = await computeUserMetrics("user_1", range);

    expect(result.revenueByCurrency).toEqual({ EUR: 500, USD: 240 });
    expect(result.properties).toHaveLength(2);
  });

  it("caps occupancyRate at 1 even if overlapping bookings exceed the range's nights", async () => {
    const prisma = await getMockedPrisma();
    const range = { from: new Date("2026-06-01T00:00:00.000Z"), to: new Date("2026-06-02T23:59:59.999Z") };

    prisma.property.findMany.mockResolvedValue([
      {
        id: "prop_1",
        name: "Overbooked",
        currency: "EUR",
        nightlyPrice: { toString: () => "100" },
        conversations: [
          { checkInDate: new Date("2026-06-01T00:00:00.000Z"), checkOutDate: new Date("2026-06-03T00:00:00.000Z") },
          { checkInDate: new Date("2026-06-01T00:00:00.000Z"), checkOutDate: new Date("2026-06-03T00:00:00.000Z") },
        ],
      },
    ]);

    const { computeUserMetrics } = await import("@/lib/analytics/metrics");
    const result = await computeUserMetrics("user_1", range);

    expect(result.properties[0].occupancyRate).toBe(1);
  });

  it("returns zeroed metrics when the user has no properties", async () => {
    const prisma = await getMockedPrisma();
    prisma.property.findMany.mockResolvedValue([]);

    const { computeUserMetrics } = await import("@/lib/analytics/metrics");
    const result = await computeUserMetrics("user_1", { from: new Date(), to: new Date() });

    expect(result.properties).toEqual([]);
    expect(result.overallOccupancyRate).toBe(0);
    expect(result.revenueByCurrency).toEqual({});
  });
});

describe("buildAnalyticsCsv", () => {
  it("builds a header row plus one row per property, formatted and escaped", () => {
    const properties: PropertyMetrics[] = [
      {
        propertyId: "prop_1",
        propertyName: 'Loft "Centro", Ginebra',
        currency: "EUR",
        nightsInRange: 30,
        nightsBooked: 9,
        occupancyRate: 0.3,
        stayCount: 2,
        estimatedRevenue: 900,
      },
    ];

    const csv = buildAnalyticsCsv(properties);
    const lines = csv.split("\r\n");

    expect(lines[0]).toBe(
      "Propiedad,Moneda,Noches del periodo,Noches reservadas,Ocupación (%),Estancias,Ingresos estimados",
    );
    expect(lines[1]).toBe('"Loft ""Centro"", Ginebra",EUR,30,9,30.0,2,900.00');
  });
});
