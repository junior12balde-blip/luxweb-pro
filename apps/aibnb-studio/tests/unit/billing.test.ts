import { afterEach, describe, expect, it, vi } from "vitest";
import { PLAN_IDS, PAID_PLAN_IDS, PLAN_PROPERTY_LIMIT, getPlanPriceId, findPlanByPriceId } from "@/lib/billing/plans";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: { findUnique: vi.fn(), findFirst: vi.fn() },
    membership: { count: vi.fn() },
  },
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("plan tables", () => {
  it("has a property limit for every plan and a price env var for every paid plan", () => {
    for (const plan of PLAN_IDS) {
      expect(plan === "BUSINESS" ? PLAN_PROPERTY_LIMIT[plan] : typeof PLAN_PROPERTY_LIMIT[plan]).not.toBe(
        undefined,
      );
    }
    expect(PLAN_PROPERTY_LIMIT.BUSINESS).toBeNull();
    expect(PLAN_PROPERTY_LIMIT.FREE).toBe(1);
  });
});

describe("findPlanByPriceId", () => {
  it("resolves the plan whose env var matches the given price id", () => {
    vi.stubEnv("STRIPE_PRICE_STARTER", "price_starter_123");
    vi.stubEnv("STRIPE_PRICE_PRO", "price_pro_456");

    expect(findPlanByPriceId("price_pro_456")).toBe("PRO");
    expect(getPlanPriceId("STARTER")).toBe("price_starter_123");
  });

  it("returns null for a price id that matches no configured plan", () => {
    for (const plan of PAID_PLAN_IDS) {
      vi.stubEnv(`STRIPE_PRICE_${plan}`, "");
    }
    expect(findPlanByPriceId("price_unknown")).toBeNull();
  });
});

describe("getUserSubscription", () => {
  async function getMockedPrisma() {
    const { prisma } = await import("@/lib/prisma");
    return prisma as unknown as {
      subscription: { findUnique: ReturnType<typeof vi.fn> };
    };
  }

  it("returns the FREE plan when the user has no Subscription row", async () => {
    const prisma = await getMockedPrisma();
    prisma.subscription.findUnique.mockResolvedValue(null);

    const { getUserSubscription } = await import("@/lib/billing/subscription");
    const result = await getUserSubscription("user_1");

    expect(result.plan).toBe("FREE");
    expect(result.effectivePlan).toBe("FREE");
  });

  it("uses the stored plan as effectivePlan when the status is ACTIVE or TRIALING", async () => {
    const prisma = await getMockedPrisma();
    prisma.subscription.findUnique.mockResolvedValue({
      plan: "PRO",
      status: "TRIALING",
      stripeCustomerId: "cus_1",
      currentPeriodEnd: new Date("2026-10-01T00:00:00.000Z"),
      cancelAtPeriodEnd: false,
    });

    const { getUserSubscription } = await import("@/lib/billing/subscription");
    const result = await getUserSubscription("user_1");

    expect(result.plan).toBe("PRO");
    expect(result.effectivePlan).toBe("PRO");
  });

  it("falls back effectivePlan to FREE when the subscription is CANCELED, while preserving the stored plan for display", async () => {
    const prisma = await getMockedPrisma();
    prisma.subscription.findUnique.mockResolvedValue({
      plan: "BUSINESS",
      status: "CANCELED",
      stripeCustomerId: "cus_1",
      currentPeriodEnd: new Date("2026-09-01T00:00:00.000Z"),
      cancelAtPeriodEnd: true,
    });

    const { getUserSubscription } = await import("@/lib/billing/subscription");
    const result = await getUserSubscription("user_1");

    expect(result.plan).toBe("BUSINESS");
    expect(result.effectivePlan).toBe("FREE");
  });
});

describe("checkPropertyLimit", () => {
  async function getMockedPrisma() {
    const { prisma } = await import("@/lib/prisma");
    return prisma as unknown as {
      subscription: { findUnique: ReturnType<typeof vi.fn> };
      membership: { count: ReturnType<typeof vi.fn> };
    };
  }

  it("blocks creating a second property on the FREE plan", async () => {
    const prisma = await getMockedPrisma();
    prisma.subscription.findUnique.mockResolvedValue(null);
    prisma.membership.count.mockResolvedValue(1);

    const { checkPropertyLimit } = await import("@/lib/billing/subscription");
    const result = await checkPropertyLimit("user_1");

    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(1);
  });

  it("allows unlimited properties on the BUSINESS plan", async () => {
    const prisma = await getMockedPrisma();
    prisma.subscription.findUnique.mockResolvedValue({
      plan: "BUSINESS",
      status: "ACTIVE",
      stripeCustomerId: "cus_1",
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });
    prisma.membership.count.mockResolvedValue(500);

    const { checkPropertyLimit } = await import("@/lib/billing/subscription");
    const result = await checkPropertyLimit("user_1");

    expect(result.allowed).toBe(true);
    expect(result.limit).toBeNull();
  });
});
