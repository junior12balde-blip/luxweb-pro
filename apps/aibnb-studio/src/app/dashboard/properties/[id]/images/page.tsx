import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { serializeMediaGeneration } from "@/lib/serializers";
import { ImageGenerator } from "@/components/image/ImageGenerator";

export default async function ImageGeneratorPage({
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

  const generations = await prisma.mediaGeneration.findMany({
    where: { propertyId, type: "IMAGE" },
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
        Generador de imágenes — {property.name}
      </h1>

      <div className="mt-4">
        <ImageGenerator
          propertyId={propertyId}
          generations={generations.map(serializeMediaGeneration)}
        />
      </div>
    </div>
  );
}
