import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";

export function Topbar({ email }: { email: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
      <span className="text-sm font-semibold text-slate-900 md:hidden">
        AIbnb Studio
      </span>
      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm text-slate-500">{email}</span>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </header>
  );
}
