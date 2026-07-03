import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageAlternates } from "@/lib/seo";

type Reason = { icon: string; title: string; description: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "whyUs" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: pageAlternates(locale as Locale, "/porque-nos-escolher"),
  };
}

export default async function WhyUsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <WhyUsContent />;
}

function WhyUsContent() {
  const t = useTranslations("whyUs");
  const reasons = t.raw("reasons") as Reason[];

  return (
    <>
      <section className="bg-hero-gradient text-white">
        <div className="container-page py-20 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            {t("badge")}
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold sm:text-5xl">{t("title")}</h1>
          <p className="mx-auto mt-4 max-w-xl text-primary-100">{t("subtitle")}</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-7 shadow-sm"
              >
                <span className="text-4xl" aria-hidden>
                  {reason.icon}
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">{reason.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-hero-gradient">
        <div className="container-page py-16 text-center text-white sm:py-20">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("ctaTitle")}</h2>
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
