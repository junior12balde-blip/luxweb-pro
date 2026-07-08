import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

/**
 * Tarjeta de estadística. En la Fase 1 muestra datos derivados de las
 * propiedades reales cuando es posible; el resto son placeholders que se
 * conectarán a datos reales en la Fase 7 (Analítica).
 */
export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </Card>
  );
}
