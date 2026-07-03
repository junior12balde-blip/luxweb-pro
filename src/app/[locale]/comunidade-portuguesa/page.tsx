import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { whatsappLink } from "@/lib/constants";
import { pageAlternates } from "@/lib/seo";

type Testimonial = { quote: string; author: string; role: string };
type Stat = { value: string; label: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portugueseCommunity" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: pageAlternates(locale as Locale, "/comunidade-portuguesa"),
  };
}

export default async function PortugueseCommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <PortugueseCommunityContent />;
}

function PortugueseCommunityContent() {
  const t = useTranslations("portugueseCommunity");
  const stats = t.raw("stats") as Stat[];
  const sectors = t.raw("sectors") as string[];
  const testimonials = t.raw("testimonials") as Testimonial[];

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

      <section className="bg-white py-14">
        <div className="container-page">
          <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-slate-600">
            {t("intro")}
          </p>

          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary-700">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-page">
          <h2 className="text-center text-3xl font-bold text-slate-900">{t("sectorsTitle")}</h2>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {sectors.map((sector) => (
              <div
                key={sector}
                className="rounded-xl border border-slate-200 bg-white px-4 py-5 text-center text-sm font-medium text-slate-700 shadow-sm"
              >
                {sector}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page grid grid-cols-1 gap-6 sm:grid-cols-2">
          {testimonials.map((item) => (
            <figure key={item.author} className="rounded-2xl border border-slate-100 bg-slate-50 p-7">
              <blockquote className="text-slate-600">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-5">
                <p className="font-semibold text-slate-900">{item.author}</p>
                <p className="text-sm text-slate-500">{item.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-hero-gradient">
        <div className="container-page py-16 text-center text-white sm:py-20">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-100">{t("ctaSubtitle")}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/orcamento"
              className="w-full rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-primary-700 shadow-lg transition-transform hover:scale-105 sm:w-auto"
            >
              {t("ctaButton")}
            </Link>
            <a
              href={whatsappLink(t("subtitle"))}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 sm:w-auto"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
