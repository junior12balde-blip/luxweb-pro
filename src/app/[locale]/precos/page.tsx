import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageAlternates } from "@/lib/seo";

type Plan = {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  badge?: string;
  description: string;
  features: string[];
  cta: string;
  highlight: boolean;
};

type Faq = { q: string; a: string };

type MaintenanceAddon = {
  title: string;
  name: string;
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  cta: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: pageAlternates(locale as Locale, "/precos"),
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <PricingContent />;
}

function PricingContent() {
  const t = useTranslations("pricing");
  const plans = t.raw("plans") as Plan[];
  const faqItems = t.raw("faq.items") as Faq[];
  const addon = t.raw("maintenanceAddon") as MaintenanceAddon;

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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${
                  plan.highlight
                    ? "border-primary-500 bg-primary-50/40 shadow-lg ring-2 ring-primary-500"
                    : "border-slate-100 bg-white"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-xs font-semibold text-white">
                    {plan.badge}
                  </span>
                )}
                <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
                <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
                <p className="mt-6">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="ml-1.5 text-sm text-slate-500">{plan.priceNote}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        className="mt-0.5 shrink-0 text-primary-600"
                        aria-hidden
                      >
                        <circle cx="9" cy="9" r="9" fill="currentColor" opacity="0.12" />
                        <path
                          d="M5.5 9l2.2 2.2L12.5 6.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={{ pathname: "/orcamento", query: { plano: plan.id } }}
                  className={`mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">{t("billingNote")}</p>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="container-page">
          <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-primary-300 bg-white p-8 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                {addon.title}
              </span>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {addon.name}
                <span className="ml-2 text-base font-semibold text-slate-500">
                  {addon.price} {addon.priceNote}
                </span>
              </h2>
              <p className="mt-2 text-sm text-slate-500">{addon.description}</p>
              <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-slate-600 sm:grid-cols-2">
                {addon.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={{ pathname: "/orcamento", query: { plano: "maintenance" } }}
              className="mt-6 inline-block shrink-0 rounded-full bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:mt-0"
            >
              {addon.cta}
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <h2 className="text-center text-3xl font-bold text-slate-900">{t("faq.title")}</h2>
          <div className="mx-auto mt-10 max-w-2xl space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-slate-200 bg-white p-5 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-medium text-slate-900 marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 12 12"
                      className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                      aria-hidden
                    >
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-slate-500">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
