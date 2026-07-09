import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { aiPreferencesSchema } from "@/lib/validations/ai";
import type { AIPreferences } from "@/lib/ai/types";

export async function PATCH(request: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = aiPreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  const aiPreferences: AIPreferences = {
    defaultProvider: parsed.data.defaultProvider as AIPreferences["defaultProvider"],
  };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { aiPreferences: aiPreferences as unknown as Prisma.InputJsonValue },
  });

  return NextResponse.json({ aiPreferences });
}
