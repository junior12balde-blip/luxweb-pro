import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isPropertyOwner } from "@/lib/properties";
import { serializeAutomationRun } from "@/lib/serializers";
import { updateAutomationRunSchema } from "@/lib/validations/automation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; runId: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: propertyId, runId } = await params;
  if (!(await isPropertyOwner(session.user.id, propertyId))) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateAutomationRunSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  const existing = await prisma.automationRun.findFirst({
    where: { id: runId, automation: { propertyId } },
  });
  if (!existing) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const updated = await prisma.automationRun.update({
    where: { id: runId },
    data: { status: parsed.data.status },
    include: { automation: true, conversation: { select: { guestName: true } } },
  });

  return NextResponse.json({ run: serializeAutomationRun(updated) });
}
