import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isPropertyOwner } from "@/lib/properties";
import { serializeAutomation } from "@/lib/serializers";
import { updateAutomationsSchema } from "@/lib/validations/automation";
import { AUTOMATION_TYPES, DEFAULT_OFFSET_HOURS } from "@/lib/automations/types";
import { DEFAULT_MESSAGE_TEMPLATE } from "@/lib/automations/templates";
import type { AutomationConfig } from "@/types/automation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: propertyId } = await params;
  if (!(await isPropertyOwner(session.user.id, propertyId))) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const saved = await prisma.automation.findMany({ where: { propertyId } });
  const savedByType = new Map(saved.map((automation) => [automation.type, automation]));

  // Siempre se devuelven las 5 automatizaciones, aunque el anfitrión nunca
  // las haya guardado — con valores por defecto (`id: null`) para que el
  // formulario tenga algo sensato que mostrar la primera vez.
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

  return NextResponse.json({ automations });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: propertyId } = await params;
  if (!(await isPropertyOwner(session.user.id, propertyId))) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateAutomationsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  const saved = await Promise.all(
    parsed.data.map((config) =>
      prisma.automation.upsert({
        where: { propertyId_type: { propertyId, type: config.type } },
        create: {
          propertyId,
          type: config.type,
          enabled: config.enabled,
          offsetHours: config.offsetHours,
          messageTemplate: config.messageTemplate,
        },
        update: {
          enabled: config.enabled,
          offsetHours: config.offsetHours,
          messageTemplate: config.messageTemplate,
        },
      }),
    ),
  );

  return NextResponse.json({ automations: saved.map(serializeAutomation) });
}
