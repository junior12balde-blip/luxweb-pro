import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { computeUserMetrics, getDefaultRange, VALID_RANGE_DAYS, type RangeDays } from "@/lib/analytics/metrics";
import { buildAnalyticsCsv } from "@/lib/analytics/csv";

function parseDays(value: string | null): RangeDays {
  const parsed = Number(value);
  return (VALID_RANGE_DAYS as readonly number[]).includes(parsed) ? (parsed as RangeDays) : 30;
}

export async function GET(request: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const days = parseDays(url.searchParams.get("days"));

  const metrics = await computeUserMetrics(session.user.id, getDefaultRange(days));
  const csv = buildAnalyticsCsv(metrics.properties);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aibnb-studio-analitica-${days}d.csv"`,
    },
  });
}
