import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { generatePropertyImage } from "@/lib/image/propertyImageGenerator";
import { ImageProviderNotConfiguredError } from "@/lib/image/errors";
import { generateImageRequestSchema } from "@/lib/validations/image";
import { GENERATED_IMAGES_BUCKET } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: propertyId } = await params;
  const property = await prisma.property.findFirst({
    where: { id: propertyId, memberships: { some: { userId: session.user.id } } },
  });
  if (!property) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const generations = await prisma.mediaGeneration.findMany({
    where: { propertyId, type: "IMAGE" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ generations });
}

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: propertyId } = await params;
  const property = await prisma.property.findFirst({
    where: { id: propertyId, memberships: { some: { userId: session.user.id } } },
  });
  if (!property) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = generateImageRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  try {
    // Imagen es síncrono: la imagen ya viene lista en la misma petición, sin
    // trabajo asíncrono ni sondeo de estado (a diferencia del vídeo, Fase 5).
    const { result, provider } = await generatePropertyImage(
      {
        name: property.name,
        type: property.type,
        city: property.city,
        country: property.country,
        amenities: property.amenities,
        description: property.description,
      },
      parsed.data.style,
    );

    const supabase = await createClient();
    const extension = EXTENSION_BY_MIME_TYPE[result.mimeType] ?? "png";
    const path = `${propertyId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(GENERATED_IMAGES_BUCKET)
      .upload(path, result.imageBytes, { contentType: result.mimeType, upsert: true });

    if (uploadError) {
      return NextResponse.json(
        { error: `No se pudo guardar la imagen: ${uploadError.message}` },
        { status: 502 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(GENERATED_IMAGES_BUCKET).getPublicUrl(path);

    const generation = await prisma.mediaGeneration.create({
      data: {
        propertyId,
        type: "IMAGE",
        status: "READY",
        prompt: `style=${parsed.data.style}`,
        provider,
        model: result.model,
        resultUrl: `${publicUrl}?v=${Date.now()}`,
      },
    });

    return NextResponse.json({ generation }, { status: 201 });
  } catch (error) {
    if (error instanceof ImageProviderNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    throw error;
  }
}
