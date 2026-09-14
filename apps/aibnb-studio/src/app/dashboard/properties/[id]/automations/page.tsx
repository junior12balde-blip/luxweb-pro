import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { serializeAutomation, serializeAutomationRun } from "@/lib/serializers";
import { AUTOMATION_TYPES, DEFAULT_OFFSET_HOURS } from "@/lib/automations/types";
import { DEFAULT_MESSAGE_TEMPLATE } from "@/lib/automations/templates";
import type { AutomationConfig } from "@/types/automation";
import { AutomationSettings } from "@/components/automations/AutomationSettings";
import { AutomationRunList } from "@/components/automations/AutomationRunList";

export default async function AutomationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireUser();
  const { id: propertyId } = await params;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, memberships: { some: { userId: user.id } } },
  });
  if (!property) {
    notFound();
  }

  const [saved, runs] = await Promise.all([
    prisma.automation.findMany({ where: { propertyId } }),
    prisma.automationRun.findMany({
      where: { automation: { propertyId } },
      include: { automation: true, conversation: { select: { guestName: true } } },
      orderBy: { scheduledFor: "desc" },
      take: 50,
    }),
  ]);

  const savedByType = new Map(saved.map((automation) => [automation.type, automation]));
  const automations: AutomationConfig[] = AUTOMATION_TYPES.map((type) => {
    const existing = savedByType.get(type);
    if (existing) {
      return serializeAutomation(existing);
    }
    return {
      id: null,
      type,
      enabled: false,
      offsetHours: DEFAULT_OFFSET_HOURS[type],
      messageTemplate: DEFAULT_MESSAGE_TEMPLATE[type],
    };
  });

  return (
    <div className="max-w-2xl">
      <Link
        href={`/dashboard/properties/${propertyId}`}
        className="text-sm font-medium text-brand-600 hover:underline"
      >
        ← Volver a la propiedad
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        Automatizaciones — {property.name}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Recordatorios para ti (no se envían solos a ningún canal externo) calculados a partir de
        las fechas de check-in/check-out que registres en cada conversación.
      </p>

      <div className="mt-6">
        <AutomationSettings propertyId={propertyId} automations={automations} />
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Pendientes y recientes</h2>
      <div className="mt-3">
        <AutomationRunList propertyId={propertyId} runs={runs.map(serializeAutomationRun)} />
      </div>
    </div>
  );
}
