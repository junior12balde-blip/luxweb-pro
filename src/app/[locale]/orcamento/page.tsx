import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import QuoteForm from "@/components/QuoteForm";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quote" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: pageAlternates(locale as Locale, "/orcamento"),
  };
}

export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plano?: string }>;
}) {
  const { locale } = await params;
  const { plano } = await searchParams;
  setRequestLocale(locale as Locale);
  return <QuoteContent defaultPlan={plano} />;
}

function QuoteContent({ defaultPlan }: { defaultPlan?: string }) {
  const t = useTranslations("quote");

  const steps = t.raw("sidebar.steps") as string[];

  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge">{t("badge")}</span>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 text-slate-500">{t("subtitle")}</p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
              <QuoteForm defaultPlan={defaultPlan} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
              <h2 className="text-lg font-semibold text-slate-900">{t("sidebar.title")}</h2>
              <ol className="mt-5 space-y-4">
                {steps.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-600">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 rounded-lg bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700">
                {t("sidebar.guarantee")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
