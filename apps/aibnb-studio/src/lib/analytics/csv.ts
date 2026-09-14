import type { PropertyMetrics } from "@/types/analytics";

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HEADER = [
  "Propiedad",
  "Moneda",
  "Noches del periodo",
  "Noches reservadas",
  "Ocupación (%)",
  "Estancias",
  "Ingresos estimados",
];

export function buildAnalyticsCsv(properties: PropertyMetrics[]): string {
  const rows = properties.map((property) => [
    property.propertyName,
    property.currency,
    property.nightsInRange,
    property.nightsBooked,
    (property.occupancyRate * 100).toFixed(1),
    property.stayCount,
    property.estimatedRevenue.toFixed(2),
  ]);

  return [HEADER, ...rows].map((row) => row.map(escapeCsvField).join(",")).join("\r\n");
}
