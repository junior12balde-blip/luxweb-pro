import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { CITIES } from "@/lib/cities";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cities" });
  return {
    title: t("indexTitle"),
    description: t("indexSubtitle"),
    alternates: pageAlternates(locale as Locale, "/localidades"),
  };
}

export default async function LocationsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <LocationsIndexContent />;
}

function LocationsIndexContent() {
  const t = useTranslations("cities");

  return (
    <>
      <section className="bg-hero-gradient text-white">
        <div className="container-page py-20 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            {t("badge")}
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold sm:text-5xl">{t("indexTitle")}</h1>
          <p className="mx-auto mt-4 max-w-xl text-primary-100">{t("indexSubtitle")}</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={{ pathname: "/localidades/[cidade]", params: { cidade: city.slug } }}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-28 items-center justify-center bg-hero-gradient text-3xl font-bold text-white">
                📍
              </div>
              <div className="p-6">
                <h2 className="font-semibold text-slate-900">{city.name}</h2>
                <p className="mt-2 text-sm text-slate-500">{t(`blurbs.${city.slug}`)}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700">
                  {t("indexCta")} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
