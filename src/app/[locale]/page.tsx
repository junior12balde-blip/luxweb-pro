import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { whatsappLink } from "@/lib/constants";

const SERVICE_ICONS = ["💻", "🌍", "📍", "💬", "🛠️", "🎨"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("title"), description: t("description") };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations();
  const tWhatsapp = useTranslations("whatsapp");

  const services = t.raw("services.items") as {
    title: string;
    description: string;
  }[];
  const steps = t.raw("process.steps") as {
    title: string;
    description: string;
  }[];
  const testimonials = t.raw("testimonials.items") as {
    quote: string;
    author: string;
    role: string;
  }[];
  const portfolioItems = (
    t.raw("portfolio.items") as {
      title: string;
      category: string;
      description: string;
    }[]
  ).slice(0, 3);

  const stats = [
    { value: "50+", label: t("stats.projects") },
    { value: "5", label: t("stats.languages") },
    { value: "100%", label: t("stats.responsive") },
    { value: "95+", label: t("stats.speed") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient text-white">
        <div className="container-page relative z-10 py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
              {t("hero.badge")}
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {t("hero.title")}{" "}
              <span className="text-accent-light">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-primary-100">
              {t("hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/contacto"
                className="w-full rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-primary-700 shadow-lg transition-transform hover:scale-105 sm:w-auto"
              >
                {t("hero.cta1")}
              </Link>
              <Link
                href="/portfolio"
                className="w-full rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                {t("hero.cta2")}
              </Link>
            </div>
            <p className="mt-8 text-sm text-primary-200">{t("hero.trustLine")}</p>
          </div>
        </div>
        <div
          aria-hidden
          className="absolute -bottom-24 left-1/2 h-64 w-[120%] -translate-x-1/2 rounded-[100%] bg-white/5 blur-3xl"
        />
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100 bg-white">
        <div className="container-page grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary-700 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge">{t("services.badge")}</span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              {t("services.title")}
            </h2>
            <p className="mt-4 text-slate-500">{t("services.subtitle")}</p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <div
                key={service.title}
                className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="text-3xl" aria-hidden>
                  {SERVICE_ICONS[i % SERVICE_ICONS.length]}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/servicos"
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {t("nav.services")} →
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge">{t("process.badge")}</span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              {t("process.title")}
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
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

      {/* Portfolio teaser */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge">{t("portfolio.badge")}</span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              {t("portfolio.title")}
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {portfolioItems.map((item) => (
              <div
                key={item.title}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-40 items-center justify-center bg-hero-gradient text-4xl text-white">
                  {item.category === "electrician" && "⚡"}
                  {item.category === "cleaning" && "🧹"}
                  {item.category === "restaurant" && "🍽️"}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-primary-200 px-7 py-3.5 text-sm font-semibold text-primary-700 hover:bg-primary-50"
            >
              {t("nav.portfolio")} →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge">{t("testimonials.badge")}</span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              {t("testimonials.title")}
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <figure
                key={item.author}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-7"
              >
                <blockquote className="text-slate-600">“{item.quote}”</blockquote>
                <figcaption className="mt-5">
                  <p className="font-semibold text-slate-900">{item.author}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-hero-gradient">
        <div className="container-page py-16 text-center text-white sm:py-20">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("contact.title")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-100">
            {t("contact.subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contacto"
              className="w-full rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-primary-700 shadow-lg transition-transform hover:scale-105 sm:w-auto"
            >
              {t("hero.cta1")}
            </Link>
            <a
              href={whatsappLink(tWhatsapp("message"))}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 sm:w-auto"
            >
              {t("contact.whatsappCta")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
