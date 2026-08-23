import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { serializeListingDraft } from "@/lib/serializers";
import { ListingGenerator } from "@/components/listing/ListingGenerator";

export default async function ListingGeneratorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireUser();
  const { id: propertyId } = await params;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, memberships: { some: { userId: user.id } } },
  });
  if (!property) {
    notFound();
  }

  const drafts = await prisma.listingDraft.findMany({
    where: { propertyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl">
      <Link
        href={`/dashboard/properties/${propertyId}`}
        className="text-sm font-medium text-brand-600 hover:underline"
      >
        ← Volver a la propiedad
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        Generador de anuncios — {property.name}
      </h1>

      <div className="mt-4">
        <ListingGenerator propertyId={propertyId} drafts={drafts.map(serializeListingDraft)} />
      </div>
    </div>
  );
}
