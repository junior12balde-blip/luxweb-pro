import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { BusinessType } from "@/templates/BusinessTemplate";
import { pageAlternates } from "@/lib/seo";

const TEMPLATE_LINKS = [
  { type: "electrician", href: "/templates/electricista", icon: "⚡" },
  { type: "cleaning", href: "/templates/limpeza", icon: "🧹" },
  { type: "plumber", href: "/templates/canalizador", icon: "🔧" },
  { type: "gardener", href: "/templates/jardineiro", icon: "🌿" },
  { type: "restaurant", href: "/templates/restaurante", icon: "🍽️" },
  { type: "shop", href: "/templates/loja", icon: "🛍️" },
  { type: "construction", href: "/templates/construcao", icon: "🏗️" },
] as const satisfies { type: BusinessType; href: string; icon: string }[];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: `Templates — ${t("siteName")}`,
    alternates: pageAlternates(locale as Locale, "/templates"),
  };
}

export default async function TemplatesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <TemplatesIndexContent />;
}

function TemplatesIndexContent() {
  const t = useTranslations();

  return (
    <>
      <section className="bg-hero-gradient text-white">
        <div className="container-page py-20 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            {t("services.badge")}
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold sm:text-5xl">
            Templates
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-primary-100">
            {t("templatesShared.gallerySubtitle")}
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_LINKS.map(({ type, href, icon }) => (
            <Link
              key={type}
              href={href}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-36 items-center justify-center bg-hero-gradient text-5xl text-white">
                {icon}
              </div>
              <div className="p-6">
                <h2 className="font-semibold text-slate-900">
                  {t(`templates.${type}.name`)}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {t(`templates.${type}.tagline`)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700">
                  {t("portfolio.viewProject")} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
