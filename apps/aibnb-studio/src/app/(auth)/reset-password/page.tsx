import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Restablecer contraseña</h1>
          <p className="mt-1 text-sm text-slate-500">Elige una nueva contraseña.</p>
        </div>

        {user ? (
          <ResetPasswordForm />
        ) : (
          <div className="space-y-4 text-center">
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Este enlace ha caducado o no es válido. Solicita uno nuevo.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block font-medium text-brand-600 hover:underline"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
