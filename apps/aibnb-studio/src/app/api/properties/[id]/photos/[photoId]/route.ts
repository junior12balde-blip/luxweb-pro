import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isPropertyOwner } from "@/lib/properties";
import { PROPERTY_PHOTOS_BUCKET } from "@/lib/storage";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: propertyId, photoId } = await params;
  if (!(await isPropertyOwner(session.user.id, propertyId))) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const photo = await prisma.propertyPhoto.findFirst({ where: { id: photoId, propertyId } });
  if (!photo) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  const supabase = await createClient();
  const path = new URL(photo.url).pathname.split(`${PROPERTY_PHOTOS_BUCKET}/`)[1];
  if (path) {
    await supabase.storage.from(PROPERTY_PHOTOS_BUCKET).remove([path]);
  }

  await prisma.propertyPhoto.delete({ where: { id: photoId } });

  return NextResponse.json({ ok: true });
}
