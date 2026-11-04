import { requireUser } from "@/lib/auth";
import { PropertyForm } from "@/components/properties/PropertyForm";

export default async function NewPropertyPage() {
  await requireUser();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Nueva propiedad</h1>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <PropertyForm />
      </div>
    </div>
  );
}
