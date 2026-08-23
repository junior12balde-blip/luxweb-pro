import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { serializeProperty } from "@/lib/serializers";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { DeletePropertyButton } from "@/components/properties/DeletePropertyButton";
import { PhotoGallery } from "@/components/properties/PhotoGallery";
import { Button } from "@/components/ui/Button";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireUser();
  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, memberships: { some: { userId: user.id } } },
    include: { photos: { orderBy: { position: "asc" } } },
  });

  if (!property) {
    notFound();
  }

  const serialized = serializeProperty(property);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Editar propiedad</h1>
        <div className="flex gap-2">
          <Link href={`/dashboard/properties/${property.id}/listing`}>
            <Button variant="secondary">✨ Generador de anuncios</Button>
          </Link>
          <Link href={`/dashboard/properties/${property.id}/videos`}>
            <Button variant="secondary">🎬 Generador de vídeos</Button>
          </Link>
          <Link href={`/dashboard/properties/${property.id}/messages`}>
            <Button variant="secondary">💬 Mensajes de huéspedes</Button>
          </Link>
          <DeletePropertyButton propertyId={property.id} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Fotos</h2>
        <PhotoGallery propertyId={property.id} photos={serialized.photos} />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <PropertyForm property={serialized} />
      </div>
    </div>
  );
}
