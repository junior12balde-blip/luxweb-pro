import Link from "next/link";
import type { Property } from "@/types/property";
import { Card } from "@/components/ui/Card";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-slate-900">{property.name}</h3>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
          {property.type}
        </span>
      </div>
      <p className="text-sm text-slate-500">
        {property.city}, {property.country}
      </p>
      <p className="text-sm text-slate-500">
        {property.maxGuests} huéspedes · {property.bedrooms} hab. ·{" "}
        {property.bathrooms} baños
      </p>
      <p className="text-sm font-medium text-slate-900">
        {property.nightlyPrice} {property.currency} / noche
      </p>
      <Link
        href={`/dashboard/properties/${property.id}`}
        className="mt-2 text-sm font-medium text-brand-600 hover:underline"
      >
        Editar →
      </Link>
    </Card>
  );
}
