import type { AutomationRun as PrismaAutomationRun } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { renderTemplate } from "./templates";
import { ANCHOR_FIELD } from "./types";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Recorre las automatizaciones activas y crea un AutomationRun por cada
 * (automatización, conversación) cuya fecha ancla + offsetHours ya se
 * cumplió y que todavía no tiene uno — @@unique(automationId, conversationId)
 * en el esquema es la garantía real de no-duplicados; esta función además
 * comprueba antes de crear para no depender solo del error de la BD.
 *
 * Pensada para invocarse desde `/api/cron/automations`, llamado por un cron
 * de GitHub Actions (ver ARCHITECTURE.md) — no hay ningún worker en segundo
 * plano corriendo dentro de la propia app.
 */
export async function runDueAutomations(now: Date = new Date()): Promise<PrismaAutomationRun[]> {
  const automations = await prisma.automation.findMany({
    where: { enabled: true },
    include: {
      property: {
        include: { conversations: { where: { status: "OPEN" } } },
      },
    },
  });

  const created: PrismaAutomationRun[] = [];

  for (const automation of automations) {
    const anchorField = ANCHOR_FIELD[automation.type];

    for (const conversation of automation.property.conversations) {
      const anchor = conversation[anchorField];
      if (!anchor) continue;

      const dueAt = new Date(anchor.getTime() + automation.offsetHours * HOUR_MS);
      if (dueAt > now) continue;

      const existing = await prisma.automationRun.findUnique({
        where: {
          automationId_conversationId: {
            automationId: automation.id,
            conversationId: conversation.id,
          },
        },
      });
      if (existing) continue;

      const message = renderTemplate(automation.messageTemplate, {
        guestName: conversation.guestName || "el huésped",
        propertyName: automation.property.name,
      });

      const run = await prisma.automationRun.create({
        data: {
          automationId: automation.id,
          conversationId: conversation.id,
          status: "DUE",
          scheduledFor: dueAt,
          message,
        },
      });
      created.push(run);
    }
  }

  return created;
}
