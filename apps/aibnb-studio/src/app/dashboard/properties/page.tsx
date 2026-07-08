import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { serializeProperty } from "@/lib/serializers";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { Button } from "@/components/ui/Button";

export default async function PropertiesPage() {
  const { user } = await requireUser();

  const properties = await prisma.property.findMany({
    where: { memberships: { some: { userId: user.id } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Propiedades</h1>
        <Link href="/dashboard/properties/new">
          <Button>+ Nueva propiedad</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">Todavía no has añadido ninguna propiedad.</p>
          <Link
            href="/dashboard/properties/new"
            className="mt-3 inline-block font-medium text-brand-600 hover:underline"
          >
            Añade tu primera propiedad
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={serializeProperty(property)} />
          ))}
        </div>
      )}
    </div>
  );
}
