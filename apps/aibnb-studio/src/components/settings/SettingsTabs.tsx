"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard/settings/profile", label: "Perfil" },
  { href: "/dashboard/settings/integrations", label: "Integraciones" },
] as const;

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav className="mt-4 flex gap-2 border-b border-slate-200">
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-600 hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
