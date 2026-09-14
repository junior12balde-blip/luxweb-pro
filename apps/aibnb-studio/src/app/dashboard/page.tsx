import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { StatCard } from "@/components/dashboard/StatCard";
import { computeUserMetrics, getDefaultRange } from "@/lib/analytics/metrics";
import { formatCurrency, formatPercent } from "@/lib/analytics/format";

export default async function DashboardOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ passwordUpdated?: string }>;
}) {
  const { user } = await requireUser();
  const { passwordUpdated } = await searchParams;

  const propertyCount = await prisma.membership.count({
    where: { userId: user.id },
  });

  const messageCount = await prisma.message.count({
    where: { conversation: { property: { memberships: { some: { userId: user.id } } } } },
  });

  const metrics = await computeUserMetrics(user.id, getDefaultRange(30));
  const currencies = Object.keys(metrics.revenueByCurrency);
  const revenueLabel =
    currencies.length === 0
      ? formatCurrency(0, "EUR")
      : currencies.length === 1
        ? formatCurrency(metrics.revenueByCurrency[currencies[0]], currencies[0])
        : "Varias monedas";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Resumen</h1>
      <p className="mt-1 text-sm text-slate-500">
        Bienvenido de nuevo{user.fullName ? `, ${user.fullName}` : ""}.
      </p>

      {passwordUpdated && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Contraseña actualizada correctamente.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Propiedades" value={String(propertyCount)} />
        <StatCard
          label="Ocupación (30 días)"
          value={formatPercent(metrics.overallOccupancyRate)}
          hint={
            currencies.length > 1
              ? undefined
              : "Estimada a partir de las fechas de check-in/check-out registradas"
          }
        />
        <StatCard
          label="Ingresos (30 días)"
          value={revenueLabel}
          hint={
            currencies.length > 1
              ? "Ver desglose por propiedad en Analítica"
              : "Estimado: noches reservadas × precio/noche"
          }
        />
        <StatCard label="Mensajes con huéspedes" value={String(messageCount)} />
      </div>
    </div>
  );
}
