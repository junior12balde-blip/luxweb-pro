import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import ClientLanguageSwitcher from "./ClientLanguageSwitcher";

type ClientHeaderProps = {
  name: string;
  locale: Locale;
  languages: Locale[];
  logoSrc?: string;
};

export default async function ClientHeader({
  name,
  locale,
  languages,
  logoSrc,
}: ClientHeaderProps) {
  const tNav = await getTranslations("nav");
  const tShared = await getTranslations("templatesShared");

  const links = [
    { href: "#servicos", label: tNav("services") },
    { href: "#galeria", label: tShared("galleryTitle") },
    { href: "#testemunhos", label: tShared("testimonialsTitle") },
    { href: "#contacto", label: tNav("contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#home" className="flex shrink-0 items-center gap-2 text-lg font-bold text-slate-900">
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- client logos are served from a dynamic route, not a known-dimension static asset
            <img src={logoSrc} alt={name} className="h-9 w-auto" />
          ) : (
            name
          )}
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-primary-600">
              {link.label}
            </a>
          ))}
        </nav>

        <ClientLanguageSwitcher locale={locale} languages={languages} />
      </div>
    </header>
  );
}
