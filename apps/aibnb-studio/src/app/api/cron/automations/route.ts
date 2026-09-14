import { NextResponse } from "next/server";
import { runDueAutomations } from "@/lib/automations/engine";

/**
 * Endpoint interno, no un proveedor externo — protegido con un secreto
 * compartido (`CRON_SECRET`) en vez de sesión de usuario, porque quien lo
 * llama es un cron de GitHub Actions, no un navegador (ver
 * ARCHITECTURE.md y PHASE-7.md). Genera el secreto tú mismo (por ejemplo
 * `openssl rand -hex 32`) y ponlo tanto en las variables de entorno de
 * despliegue como en el secreto de GitHub Actions que usa el workflow.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET no está configurado en el servidor." },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const created = await runDueAutomations();

  return NextResponse.json({ created: created.length });
}
