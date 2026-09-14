export interface PropertyMetrics {
  propertyId: string;
  propertyName: string;
  currency: string;
  /** Noches totales en el periodo consultado (mismas para todas las propiedades). */
  nightsInRange: number;
  /** Noches con estadía registrada (checkInDate/checkOutDate) que solapan el periodo. */
  nightsBooked: number;
  /** 0..1 — nightsBooked / nightsInRange, con tope en 1. */
  occupancyRate: number;
  /** Número de conversaciones con fechas que solapan el periodo. */
  stayCount: number;
  /** Estimado: nightsBooked × Property.nightlyPrice actual — no son ingresos reales registrados. */
  estimatedRevenue: number;
}

export interface UserMetrics {
  range: { from: string; to: string; days: number };
  properties: PropertyMetrics[];
  /** Ocupación agregada de todas las propiedades del usuario en el periodo. */
  overallOccupancyRate: number;
  /** Ingresos estimados agrupados por moneda — nunca se suman monedas distintas entre sí. */
  revenueByCurrency: Record<string, number>;
}
