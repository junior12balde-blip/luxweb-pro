import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validations/profile";

export async function PATCH(request: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      fullName: parsed.data.fullName,
      locale: parsed.data.locale,
      timezone: parsed.data.timezone,
      notificationPrefs: parsed.data.notificationPrefs,
    },
  });

  return NextResponse.json({
    user: {
      fullName: user.fullName,
      locale: user.locale,
      timezone: user.timezone,
      notificationPrefs: user.notificationPrefs,
    },
  });
}
