import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { serializeProperty } from "@/lib/serializers";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { DeletePropertyButton } from "@/components/properties/DeletePropertyButton";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireUser();
  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, memberships: { some: { userId: user.id } } },
  });

  if (!property) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Editar propiedad</h1>
        <DeletePropertyButton propertyId={property.id} />
      </div>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <PropertyForm property={serializeProperty(property)} />
      </div>
    </div>
  );
}
