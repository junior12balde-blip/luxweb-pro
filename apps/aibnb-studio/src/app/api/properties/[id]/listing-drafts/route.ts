import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateListing } from "@/lib/ai/listingGenerator";
import { AIProviderNotConfiguredError, AIProviderNotImplementedError } from "@/lib/ai/errors";
import { generateListingRequestSchema } from "@/lib/validations/listing";
import type { AIPreferences, AIProviderId } from "@/lib/ai/types";
import { isAIProviderId } from "@/lib/ai/providerManager";

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

  const drafts = await prisma.listingDraft.findMany({
    where: { propertyId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ drafts });
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
  const parsed = generateListingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }

  const aiPreferences = session.user.aiPreferences as AIPreferences | null;
  const requestedProvider = parsed.data.preferredProvider;
  const preferredProvider: AIProviderId | null = isAIProviderId(requestedProvider)
    ? requestedProvider
    : (aiPreferences?.defaultProvider ?? null);

  try {
    const { listing, provider, model } = await generateListing(
      {
        name: property.name,
        type: property.type,
        city: property.city,
        country: property.country,
        maxGuests: property.maxGuests,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        amenities: property.amenities,
        houseRules: property.houseRules,
        currentDescription: property.description,
      },
      preferredProvider,
    );

    const draft = await prisma.listingDraft.create({
      data: {
        propertyId,
        title: listing.title,
        description: listing.description,
        highlights: listing.highlights,
        seoKeywords: listing.seoKeywords,
        provider,
        model,
      },
    });

    return NextResponse.json({ draft }, { status: 201 });
  } catch (error) {
    if (
      error instanceof AIProviderNotConfiguredError ||
      error instanceof AIProviderNotImplementedError
    ) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    throw error;
  }
}
