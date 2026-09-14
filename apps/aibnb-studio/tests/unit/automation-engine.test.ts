import { afterEach, describe, expect, it, vi } from "vitest";
import { renderTemplate, DEFAULT_MESSAGE_TEMPLATE } from "@/lib/automations/templates";
import { AUTOMATION_TYPES, ANCHOR_FIELD, DEFAULT_OFFSET_HOURS } from "@/lib/automations/types";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    automation: { findMany: vi.fn() },
    automationRun: { findUnique: vi.fn(), create: vi.fn() },
  },
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("renderTemplate", () => {
  it("substitutes guestName and propertyName", () => {
    const result = renderTemplate("Hola {{guestName}}, bienvenido a {{propertyName}}.", {
      guestName: "María",
      propertyName: "Loft Cornavin",
    });
    expect(result).toBe("Hola María, bienvenido a Loft Cornavin.");
  });
});

describe("automation type tables are complete", () => {
  it("every AutomationType has an anchor field, default offset and default template", () => {
    for (const type of AUTOMATION_TYPES) {
      expect(ANCHOR_FIELD[type]).toMatch(/^(checkInDate|checkOutDate)$/);
      expect(typeof DEFAULT_OFFSET_HOURS[type]).toBe("number");
      expect(DEFAULT_MESSAGE_TEMPLATE[type]).toContain("{{guestName}}");
    }
  });
});

describe("runDueAutomations", () => {
  async function importEngine() {
    return import("@/lib/automations/engine");
  }

  async function getMockedPrisma() {
    const { prisma } = await import("@/lib/prisma");
    return prisma as unknown as {
      automation: { findMany: ReturnType<typeof vi.fn> };
      automationRun: { findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
    };
  }

  it("creates a run when the anchor date + offset has already passed", async () => {
    const prisma = await getMockedPrisma();
    const now = new Date("2026-06-10T12:00:00.000Z");
    const checkInDate = new Date("2026-06-09T12:00:00.000Z"); // 24h before now

    prisma.automation.findMany.mockResolvedValue([
      {
        id: "auto_1",
        type: "WELCOME_MESSAGE",
        offsetHours: -24,
        messageTemplate: "Hola {{guestName}}, bienvenido a {{propertyName}}.",
        property: {
          name: "Loft Cornavin",
          conversations: [{ id: "conv_1", guestName: "María", checkInDate, checkOutDate: null }],
        },
      },
    ]);
    prisma.automationRun.findUnique.mockResolvedValue(null);
    prisma.automationRun.create.mockImplementation(({ data }) => Promise.resolve({ id: "run_1", ...data }));

    const { runDueAutomations } = await importEngine();
    const created = await runDueAutomations(now);

    expect(created).toHaveLength(1);
    expect(created[0].message).toBe("Hola María, bienvenido a Loft Cornavin.");
    expect(prisma.automationRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ automationId: "auto_1", conversationId: "conv_1", status: "DUE" }),
      }),
    );
  });

  it("skips a conversation without the relevant anchor date set", async () => {
    const prisma = await getMockedPrisma();

    prisma.automation.findMany.mockResolvedValue([
      {
        id: "auto_1",
        type: "WELCOME_MESSAGE",
        offsetHours: -24,
        messageTemplate: "x",
        property: {
          name: "Loft Cornavin",
          conversations: [{ id: "conv_1", guestName: "María", checkInDate: null, checkOutDate: null }],
        },
      },
    ]);

    const { runDueAutomations } = await importEngine();
    const created = await runDueAutomations(new Date());

    expect(created).toHaveLength(0);
    expect(prisma.automationRun.create).not.toHaveBeenCalled();
  });

  it("skips when the due time has not arrived yet", async () => {
    const prisma = await getMockedPrisma();
    const now = new Date("2026-06-10T12:00:00.000Z");
    // offset is -24h (fires 24h before check-in) — checkInDate 5 days out means the
    // due time (checkInDate - 24h) is still days away.
    const checkInDate = new Date("2026-06-15T12:00:00.000Z");

    prisma.automation.findMany.mockResolvedValue([
      {
        id: "auto_1",
        type: "WELCOME_MESSAGE",
        offsetHours: -24,
        messageTemplate: "x",
        property: {
          name: "Loft Cornavin",
          conversations: [{ id: "conv_1", guestName: "María", checkInDate, checkOutDate: null }],
        },
      },
    ]);

    const { runDueAutomations } = await importEngine();
    const created = await runDueAutomations(now);

    expect(created).toHaveLength(0);
    expect(prisma.automationRun.create).not.toHaveBeenCalled();
  });

  it("does not create a duplicate run when one already exists (idempotency)", async () => {
    const prisma = await getMockedPrisma();
    const now = new Date("2026-06-10T12:00:00.000Z");
    const checkInDate = new Date("2026-06-01T00:00:00.000Z");

    prisma.automation.findMany.mockResolvedValue([
      {
        id: "auto_1",
        type: "WELCOME_MESSAGE",
        offsetHours: -24,
        messageTemplate: "x",
        property: {
          name: "Loft Cornavin",
          conversations: [{ id: "conv_1", guestName: "María", checkInDate, checkOutDate: null }],
        },
      },
    ]);
    prisma.automationRun.findUnique.mockResolvedValue({ id: "existing_run" });

    const { runDueAutomations } = await importEngine();
    const created = await runDueAutomations(now);

    expect(created).toHaveLength(0);
    expect(prisma.automationRun.create).not.toHaveBeenCalled();
  });
});
