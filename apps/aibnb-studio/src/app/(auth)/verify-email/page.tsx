import Link from "next/link";
import { ResendConfirmationForm } from "./ResendConfirmationForm";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-slate-900">Confirma tu email</h1>
        <p className="mt-2 text-sm text-slate-500">
          {email ? (
            <>
              Te hemos enviado un enlace de confirmación a <strong>{email}</strong>.
            </>
          ) : (
            "Te hemos enviado un enlace de confirmación a tu email."
          )}{" "}
          Ábrelo para activar tu cuenta.
        </p>

        <div className="mt-6">
          <ResendConfirmationForm defaultEmail={email ?? ""} />
        </div>

        <p className="mt-6 text-sm text-slate-500">
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
