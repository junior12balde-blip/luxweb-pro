import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageAlternates } from "@/lib/seo";

type Testimonial = { quote: string; author: string; role: string; rating: number };

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill={i < rating ? "#F59E0B" : "#E2E8F0"}
          aria-hidden
        >
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "testimonialsPage" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: pageAlternates(locale as Locale, "/testemunhos"),
  };
}

export default async function TestimonialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <TestimonialsContent />;
}

function TestimonialsContent() {
  const t = useTranslations("testimonialsPage");
  const tHero = useTranslations("hero");
  const items = t.raw("items") as Testimonial[];

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
            {items.map((item) => (
              <figure
                key={item.author}
                className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-7"
              >
                <Stars rating={item.rating} />
                <blockquote className="mt-4 flex-1 text-slate-600">&ldquo;{item.quote}&rdquo;</blockquote>
                <figcaption className="mt-5">
                  <p className="font-semibold text-slate-900">{item.author}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/orcamento"
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-4 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {tHero("cta1")} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
