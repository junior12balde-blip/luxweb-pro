"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Resumen", icon: "📊", match: "/dashboard" },
  { href: "/dashboard/properties", label: "Propiedades", icon: "🏠", match: "/dashboard/properties" },
  {
    href: "/dashboard/settings/profile",
    label: "Configuración",
    icon: "⚙️",
    match: "/dashboard/settings",
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-bold text-slate-900">AIbnb Studio</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.match === "/dashboard"
              ? pathname === item.match
              : pathname.startsWith(item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4 text-xs text-slate-400">
        Fase 1 — Fundación
      </div>
    </aside>
  );
}
