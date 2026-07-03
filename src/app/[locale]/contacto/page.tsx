import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import ContactForm from "@/components/ContactForm";
import GoogleMap from "@/components/GoogleMap";
import { siteConfig, whatsappLink, googleMapsDirectionsLink } from "@/lib/constants";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const tMeta = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: `${t("subtitle")} — ${tMeta("siteName")}`,
    alternates: pageAlternates(locale as Locale, "/contacto"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <ContactContent />;
}

function ContactContent() {
  const t = useTranslations("contact");
  const tWhatsapp = useTranslations("whatsapp");

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
        <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
              <dl className="space-y-6">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("info.addressTitle")}
                  </dt>
                  <dd className="mt-1 text-slate-700">{t("info.address")}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("info.phoneTitle")}
                  </dt>
                  <dd className="mt-1">
                    <a href={siteConfig.phoneHref} className="text-primary-700 hover:underline">
                      {siteConfig.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("info.emailTitle")}
                  </dt>
                  <dd className="mt-1">
                    <a href={`mailto:${siteConfig.email}`} className="text-primary-700 hover:underline">
                      {siteConfig.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("info.hoursTitle")}
                  </dt>
                  <dd className="mt-1 text-slate-700">{t("info.hours")}</dd>
                </div>
              </dl>

              <a
                href={whatsappLink(tWhatsapp("message"))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white hover:brightness-95"
              >
                {t("whatsappCta")}
              </a>
            </div>

            <GoogleMap title={siteConfig.name} className="h-64" />
            <a
              href={googleMapsDirectionsLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm font-medium text-primary-700 hover:underline"
            >
              {t("info.addressTitle")} → Google Maps
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
