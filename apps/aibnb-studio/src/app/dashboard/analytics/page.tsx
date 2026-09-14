import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { computeUserMetrics, getDefaultRange, VALID_RANGE_DAYS, type RangeDays } from "@/lib/analytics/metrics";
import { formatCurrency, formatPercent } from "@/lib/analytics/format";
import { Card } from "@/components/ui/Card";

function parseDays(value: string | undefined): RangeDays {
  const parsed = Number(value);
  return (VALID_RANGE_DAYS as readonly number[]).includes(parsed) ? (parsed as RangeDays) : 30;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { user } = await requireUser();
  const { days: daysParam } = await searchParams;
  const days = parseDays(daysParam);

  const metrics = await computeUserMetrics(user.id, getDefaultRange(days));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Analítica</h1>
        <a
          href={`/api/analytics/export?days=${days}`}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Descargar CSV
        </a>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Ocupación e ingresos estimados a partir de las fechas de check-in/check-out que registras
        en cada conversación (Automatizaciones, Fase 7). Los ingresos son una estimación (noches
        reservadas × precio/noche actual) — no un registro contable real.
      </p>

      <div className="mt-4 flex gap-2">
        {VALID_RANGE_DAYS.map((option) => (
          <Link
            key={option}
            href={`/dashboard/analytics?days=${option}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              option === days
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {option} días
          </Link>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm font-medium text-slate-500">Ocupación global</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatPercent(metrics.overallOccupancyRate)}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Ingresos estimados</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {Object.keys(metrics.revenueByCurrency).length === 0 ? (
              "—"
            ) : (
              <>
                {Object.entries(metrics.revenueByCurrency).map(([currency, amount], index) => (
                  <span key={currency}>
                    {index > 0 && " + "}
                    {formatCurrency(amount, currency)}
                  </span>
                ))}
              </>
            )}
          </p>
        </Card>
      </div>

      {metrics.properties.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Todavía no tienes ninguna propiedad.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Propiedad</th>
                <th className="px-4 py-3">Ocupación</th>
                <th className="px-4 py-3">Noches reservadas</th>
                <th className="px-4 py-3">Estancias</th>
                <th className="px-4 py-3">Ingresos estimados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.properties.map((property) => (
                <tr key={property.propertyId}>
                  <td className="px-4 py-3 font-medium text-slate-900">{property.propertyName}</td>
                  <td className="px-4 py-3">{formatPercent(property.occupancyRate)}</td>
                  <td className="px-4 py-3">
                    {property.nightsBooked} / {property.nightsInRange}
                  </td>
                  <td className="px-4 py-3">{property.stayCount}</td>
                  <td className="px-4 py-3">
                    {formatCurrency(property.estimatedRevenue, property.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
