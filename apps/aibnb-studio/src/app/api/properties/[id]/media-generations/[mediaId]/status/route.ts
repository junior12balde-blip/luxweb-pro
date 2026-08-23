import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getVideoProvider } from "@/lib/video/videoProviderManager";
import type { VideoProviderId } from "@/lib/video/types";
import { GENERATED_VIDEOS_BUCKET } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; mediaId: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: propertyId, mediaId } = await params;
  const property = await prisma.property.findFirst({
    where: { id: propertyId, memberships: { some: { userId: session.user.id } } },
  });
  if (!property) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const generation = await prisma.mediaGeneration.findFirst({ where: { id: mediaId, propertyId } });
  if (!generation) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  // Ya está en un estado terminal — no volver a consultar al proveedor.
  if (generation.status === "READY" || generation.status === "FAILED") {
    return NextResponse.json({ generation });
  }

  if (!generation.providerJobId) {
    return NextResponse.json({ generation });
  }

  const provider = getVideoProvider(generation.provider as VideoProviderId);
  const result = await provider.checkStatus({
    providerJobId: generation.providerJobId,
    model: generation.model,
  });

  if (result.status === "processing") {
    return NextResponse.json({ generation });
  }

  if (result.status === "failed") {
    const updated = await prisma.mediaGeneration.update({
      where: { id: mediaId },
      data: { status: "FAILED", errorMessage: result.errorMessage ?? "Error desconocido" },
    });
    return NextResponse.json({ generation: updated });
  }

  // result.status === "ready"
  if (!result.localFilePath) {
    const updated = await prisma.mediaGeneration.update({
      where: { id: mediaId },
      data: { status: "FAILED", errorMessage: "El vídeo se generó pero no se pudo descargar." },
    });
    return NextResponse.json({ generation: updated });
  }

  const bytes = await fs.readFile(result.localFilePath);
  await fs.unlink(result.localFilePath).catch(() => {});

  const supabase = await createClient();
  const path = `${propertyId}/${mediaId}.mp4`;
  const { error: uploadError } = await supabase.storage
    .from(GENERATED_VIDEOS_BUCKET)
    .upload(path, bytes, { contentType: result.mimeType ?? "video/mp4", upsert: true });

  if (uploadError) {
    const updated = await prisma.mediaGeneration.update({
      where: { id: mediaId },
      data: {
        status: "FAILED",
        errorMessage: `No se pudo guardar el vídeo: ${uploadError.message}`,
      },
    });
    return NextResponse.json({ generation: updated });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(GENERATED_VIDEOS_BUCKET).getPublicUrl(path);

  const updated = await prisma.mediaGeneration.update({
    where: { id: mediaId },
    data: { status: "READY", resultUrl: `${publicUrl}?v=${Date.now()}` },
  });

  return NextResponse.json({ generation: updated });
}
