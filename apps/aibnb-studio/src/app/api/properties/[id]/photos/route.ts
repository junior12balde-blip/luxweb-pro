import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isPropertyOwner } from "@/lib/properties";
import { PROPERTY_PHOTOS_BUCKET, extensionForImageType, validateImageFile } from "@/lib/storage";

export async function POST(
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

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("photo");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const photoCount = await prisma.propertyPhoto.count({ where: { propertyId } });
  if (photoCount >= 20) {
    return NextResponse.json(
      { error: "Como máximo puedes subir 20 fotos por propiedad." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const path = `${propertyId}/${crypto.randomUUID()}.${extensionForImageType(file.type)}`;
  const { error: uploadError } = await supabase.storage
    .from(PROPERTY_PHOTOS_BUCKET)
    .upload(path, await file.arrayBuffer(), { contentType: file.type });

  if (uploadError) {
    return NextResponse.json(
      { error: `No se pudo subir la imagen: ${uploadError.message}` },
      { status: 502 },
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PROPERTY_PHOTOS_BUCKET).getPublicUrl(path);

  const photo = await prisma.propertyPhoto.create({
    data: { propertyId, url: publicUrl, position: photoCount },
  });

  return NextResponse.json({ photo }, { status: 201 });
}
