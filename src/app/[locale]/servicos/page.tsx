import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageAlternates } from "@/lib/seo";

const SERVICE_ICONS = ["💻", "🌍", "📍", "💬", "🛠️", "🎨"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  const tMeta = await getTranslations({ locale, namespace: "meta" });
  return {
    title: `${t("title")}`,
    description: `${t("subtitle")} — ${tMeta("siteName")}`,
    alternates: pageAlternates(locale as Locale, "/servicos"),
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <ServicesContent />;
}

function ServicesContent() {
  const t = useTranslations("services");
  const tProcess = useTranslations("process");
  const tNav = useTranslations("nav");

  const services = t.raw("items") as { title: string; description: string }[];
  const steps = tProcess.raw("steps") as { title: string; description: string }[];

  return (
    <>
      <section className="bg-hero-gradient text-white">
        <div className="container-page py-20 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            {t("badge")}
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-primary-100">{t("subtitle")}</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <div
                key={service.title}
                className="flex flex-col rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="text-4xl" aria-hidden>
                  {SERVICE_ICONS[i % SERVICE_ICONS.length]}
                </span>
                <h2 className="mt-5 text-xl font-semibold text-slate-900">
                  {service.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge">{tProcess("badge")}</span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              {tProcess("title")}
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page py-16 text-center">
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-4 text-sm font-semibold text-white hover:bg-primary-700"
          >
            {tNav("cta")} →
          </Link>
        </div>
      </section>
    </>
  );
}
