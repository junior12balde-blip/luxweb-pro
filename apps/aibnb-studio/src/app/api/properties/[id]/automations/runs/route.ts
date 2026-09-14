import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isPropertyOwner } from "@/lib/properties";
import { serializeAutomationRun } from "@/lib/serializers";

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

  const runs = await prisma.automationRun.findMany({
    where: { automation: { propertyId } },
    include: { automation: true, conversation: { select: { guestName: true } } },
    orderBy: { scheduledFor: "desc" },
  });

  return NextResponse.json({ runs: runs.map(serializeAutomationRun) });
}
