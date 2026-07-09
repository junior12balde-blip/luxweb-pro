import { headers } from "next/headers";

/**
 * Resuelve la URL pública del sitio para construir enlaces de vuelta (p. ej.
 * el `redirectTo` de los emails de Supabase Auth). Usa
 * `NEXT_PUBLIC_SITE_URL` si está definida (recomendado en producción);
 * si no, la deriva de las cabeceras de la petición actual.
 */
export async function getSiteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const proto =
    requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}
