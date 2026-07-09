import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";

export function Topbar({ email, avatarUrl }: { email: string; avatarUrl: string | null }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
      <span className="text-sm font-semibold text-slate-900 md:hidden">
        AIbnb Studio
      </span>
      <div className="ml-auto flex items-center gap-4">
        <Link
          href="/dashboard/settings/profile"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <span className="h-8 w-8 overflow-hidden rounded-full bg-slate-100">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar viene de Supabase Storage, dominio dinámico por proyecto
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm">👤</span>
            )}
          </span>
          {email}
        </Link>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </header>
  );
}
