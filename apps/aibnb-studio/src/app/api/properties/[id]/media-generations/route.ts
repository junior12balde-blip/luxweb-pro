import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { startPropertyVideoGeneration } from "@/lib/video/propertyVideoGenerator";
import { VideoProviderNotConfiguredError } from "@/lib/video/errors";
import { generateVideoRequestSchema } from "@/lib/validations/video";

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
    where: { propertyId, type: "VIDEO" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ generations });
}

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
  const parsed = generateVideoRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  try {
    const { job, provider } = await startPropertyVideoGeneration(
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

    const generation = await prisma.mediaGeneration.create({
      data: {
        propertyId,
        type: "VIDEO",
        status: "PROCESSING",
        prompt: `style=${parsed.data.style}`,
        provider,
        model: job.model,
        providerJobId: job.providerJobId,
      },
    });

    return NextResponse.json({ generation }, { status: 201 });
  } catch (error) {
    if (error instanceof VideoProviderNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    throw error;
  }
}
