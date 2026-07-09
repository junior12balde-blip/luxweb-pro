import Link from "next/link";
import type { Property } from "@/types/property";
import { Card } from "@/components/ui/Card";

export function PropertyCard({ property }: { property: Property }) {
  const coverPhoto = property.photos[0];

  return (
    <Card className="flex flex-col gap-2">
      {coverPhoto && (
        // eslint-disable-next-line @next/next/no-img-element -- foto viene de Supabase Storage, dominio dinámico por proyecto
        <img
          src={coverPhoto.url}
          alt={coverPhoto.alt ?? property.name}
          className="-mx-6 -mt-6 mb-2 h-32 w-[calc(100%+3rem)] object-cover"
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{property.name}</h3>
        <div className="flex shrink-0 gap-1">
          {!property.active && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              Inactiva
            </span>
          )}
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            {property.type}
          </span>
        </div>
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
