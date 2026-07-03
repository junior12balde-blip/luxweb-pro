import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { CITIES, getCity, type CitySlug } from "@/lib/cities";
import { cityJsonLd, pageAlternates } from "@/lib/seo";

export function generateStaticParams() {
  return CITIES.map((city) => ({ cidade: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; cidade: string }>;
}): Promise<Metadata> {
  const { locale, cidade } = await params;
  const city = getCity(cidade);
  if (!city) return {};

  const t = await getTranslations({ locale, namespace: "cities" });
  return {
    title: t("title", { city: city.name }),
    description: t("subtitle", { city: city.name }),
    alternates: pageAlternates(locale as Locale, {
      pathname: "/localidades/[cidade]",
      params: { cidade: city.slug },
    }),
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ locale: string; cidade: string }>;
}) {
  const { locale, cidade } = await params;
  const city = getCity(cidade);
  if (!city) notFound();

  setRequestLocale(locale as Locale);
  return <CityContent slug={city.slug} locale={locale as Locale} />;
}

function CityContent({ slug, locale }: { slug: CitySlug; locale: Locale }) {
  const t = useTranslations("cities");
  const city = getCity(slug)!;
  const highlights = t.raw("highlights") as string[];
  const description = t("subtitle", { city: city.name });
  const jsonLd = cityJsonLd(city, locale, description);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-hero-gradient text-white">
        <div className="container-page py-20 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            {t("badge")} — {city.name}
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold sm:text-5xl">
            {t("title", { city: city.name })}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-primary-100">{description}</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <p className="mx-auto max-w-2xl text-center text-lg text-slate-600">
            {t(`blurbs.${slug}`)}
          </p>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0 text-primary-600" aria-hidden>
                  <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.12" />
                  <path
                    d="M6 10l2.5 2.5L14 7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {highlight.replace("{city}", city.name)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-hero-gradient">
        <div className="container-page py-16 text-center text-white sm:py-20">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("ctaTitle", { city: city.name })}</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-100">{t("ctaSubtitle")}</p>
          <Link
            href="/orcamento"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-primary-700 shadow-lg transition-transform hover:scale-105"
          >
            {t("ctaButton")} →
          </Link>
        </div>
      </section>
    </>
  );
}
