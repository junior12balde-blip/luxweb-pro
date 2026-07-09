import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">AIbnb Studio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Inicia sesión para gestionar tus alojamientos
          </p>
        </div>

        <LoginForm />

        <div className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="font-medium text-brand-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="font-medium text-brand-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
