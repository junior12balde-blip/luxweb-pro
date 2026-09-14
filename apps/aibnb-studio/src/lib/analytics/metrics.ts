import { prisma } from "@/lib/prisma";
import type { PropertyMetrics, UserMetrics } from "@/types/analytics";

export const VALID_RANGE_DAYS = [7, 30, 90] as const;
export type RangeDays = (typeof VALID_RANGE_DAYS)[number];

const MS_PER_NIGHT = 24 * 60 * 60 * 1000;

export interface DateRange {
  from: Date;
  to: Date;
}

/** Últimos `days` días, terminando hoy (inclusive), en horas locales del servidor. */
export function getDefaultRange(days: RangeDays = 30): DateRange {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date(to);
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);
  return { from, to };
}

/** Noches de una estadía (checkIn/checkOut) que caen dentro de `range` — 0 si no solapan. */
export function computeNightsOverlap(checkIn: Date, checkOut: Date, range: DateRange): number {
  const start = Math.max(checkIn.getTime(), range.from.getTime());
  const end = Math.min(checkOut.getTime(), range.to.getTime());
  if (end <= start) {
    return 0;
  }
  return Math.round((end - start) / MS_PER_NIGHT);
}

/**
 * Calcula ocupación/ingresos estimados de todas las propiedades de un
 * usuario a partir de las estadías registradas manualmente en
 * `Conversation.checkInDate`/`checkOutDate` (Fase 7) — no hay modelo de
 * reservas ni de pagos reales, así que "ingresos" es siempre una
 * estimación (noches × precio/noche actual de la propiedad), nunca un
 * registro contable. Ver PHASE-8.md.
 */
export async function computeUserMetrics(userId: string, range: DateRange): Promise<UserMetrics> {
  const properties = await prisma.property.findMany({
    where: { memberships: { some: { userId } } },
    include: {
      conversations: {
        where: {
          checkInDate: { not: null, lt: range.to },
          checkOutDate: { not: null, gt: range.from },
        },
        select: { checkInDate: true, checkOutDate: true },
      },
    },
  });

  const rangeNights = Math.max(1, Math.round((range.to.getTime() - range.from.getTime()) / MS_PER_NIGHT));

  const propertyMetrics: PropertyMetrics[] = properties.map((property) => {
    let nightsBooked = 0;
    let stayCount = 0;

    for (const conversation of property.conversations) {
      if (!conversation.checkInDate || !conversation.checkOutDate) continue;
      const nights = computeNightsOverlap(conversation.checkInDate, conversation.checkOutDate, range);
      if (nights > 0) {
        nightsBooked += nights;
        stayCount += 1;
      }
    }

    return {
      propertyId: property.id,
      propertyName: property.name,
      currency: property.currency,
      nightsInRange: rangeNights,
      nightsBooked,
      occupancyRate: Math.min(1, nightsBooked / rangeNights),
      stayCount,
      estimatedRevenue: nightsBooked * Number(property.nightlyPrice),
    };
  });

  const revenueByCurrency: Record<string, number> = {};
  for (const metrics of propertyMetrics) {
    revenueByCurrency[metrics.currency] = (revenueByCurrency[metrics.currency] ?? 0) + metrics.estimatedRevenue;
  }

  const totalNightsBooked = propertyMetrics.reduce((sum, m) => sum + m.nightsBooked, 0);
  const totalNightsAvailable = propertyMetrics.length * rangeNights;

  return {
    range: { from: range.from.toISOString(), to: range.to.toISOString(), days: rangeNights },
    properties: propertyMetrics,
    overallOccupancyRate: totalNightsAvailable > 0 ? totalNightsBooked / totalNightsAvailable : 0,
    revenueByCurrency,
  };
}
