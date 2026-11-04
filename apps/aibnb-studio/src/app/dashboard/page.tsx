import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { StatCard } from "@/components/dashboard/StatCard";

export default async function DashboardOverviewPage() {
  const { user } = await requireUser();

  const propertyCount = await prisma.membership.count({
    where: { userId: user.id },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Resumen</h1>
      <p className="mt-1 text-sm text-slate-500">
        Bienvenido de nuevo{user.fullName ? `, ${user.fullName}` : ""}.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Propiedades" value={String(propertyCount)} />
        <StatCard
          label="Ocupación (30 días)"
          value="—"
          hint="Disponible en la Fase 7 (Analítica)"
        />
        <StatCard
          label="Ingresos (30 días)"
          value="—"
          hint="Disponible en la Fase 7 (Analítica)"
        />
        <StatCard
          label="Mensajes automatizados"
          value="—"
          hint="Disponible en la Fase 2 (Asistente de IA)"
        />
      </div>
    </div>
  );
}
