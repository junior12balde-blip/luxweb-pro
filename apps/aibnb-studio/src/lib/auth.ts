import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Devuelve el usuario autenticado y su fila correspondiente en la base de
 * datos de la aplicación, creándola si es su primer inicio de sesión.
 * Devuelve `null` si no hay sesión — pensado para Route Handlers, que deben
 * responder 401 en JSON en vez de redirigir.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return null;
  }

  const user = await prisma.user.upsert({
    where: { authId: supabaseUser.id },
    update: {
      email: supabaseUser.email ?? "",
    },
    create: {
      authId: supabaseUser.id,
      email: supabaseUser.email ?? "",
      fullName:
        (supabaseUser.user_metadata?.full_name as string | undefined) ?? null,
    },
  });

  return { supabaseUser, user };
}

/**
 * Igual que `getCurrentUser` pero redirige a /login si no hay sesión —
 * pensado para páginas del dashboard protegidas por el middleware.
 */
export async function requireUser() {
  const result = await getCurrentUser();
  if (!result) {
    redirect("/login");
  }
  return result;
}
