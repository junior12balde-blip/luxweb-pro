// Client component so `useTranslations` reads from NextIntlClientProvider's
// `messages` prop (React context) instead of the server-side request config —
// required for /site/[client] pages, which inject client-specific translation
// overrides via that prop rather than through the static messages/*.json files.
"use client";

import { useTranslations } from "next-intl";
import ContactForm from "@/components/ContactForm";
import GoogleMap from "@/components/GoogleMap";
import { siteConfig, whatsappLink } from "@/lib/constants";
import { businessJsonLd } from "@/lib/seo";

export type BusinessType =
  | "electrician"
  | "cleaning"
  | "plumber"
  | "gardener"
  | "restaurant"
  | "shop"
  | "construction";

type BusinessTheme = {
  gradient: string;
  icon: string;
  serviceIcons: string[];
  galleryIcons: string[];
  /** schema.org type used for the injected LocalBusiness JSON-LD */
  schemaType: string;
};

const THEMES: Record<BusinessType, BusinessTheme> = {
  electrician: {
    gradient: "linear-gradient(135deg, #B91C1C 0%, #F59E0B 100%)",
    icon: "⚡",
    serviceIcons: ["🔌", "🚨", "🛡️", "🏠"],
    galleryIcons: ["⚡", "🔧", "💡", "🏠", "🔋", "📐"],
    schemaType: "Electrician",
  },
  cleaning: {
    gradient: "linear-gradient(135deg, #0369A1 0%, #06B6D4 100%)",
    icon: "🧹",
    serviceIcons: ["🏢", "🏠", "🪟", "🧱"],
    galleryIcons: ["🧹", "🪣", "✨", "🏢", "🧽", "🧴"],
    schemaType: "LocalBusiness",
  },
  plumber: {
    gradient: "linear-gradient(135deg, #0F766E 0%, #38BDF8 100%)",
    icon: "🔧",
    serviceIcons: ["🚰", "🚨", "🛁", "💧"],
    galleryIcons: ["🔧", "🚰", "🛁", "💧", "🔩", "🧰"],
    schemaType: "Plumber",
  },
  gardener: {
    gradient: "linear-gradient(135deg, #166534 0%, #84CC16 100%)",
    icon: "🌿",
    serviceIcons: ["🌱", "🌳", "🌷", "❄️"],
    galleryIcons: ["🌿", "🌳", "🌷", "🍂", "🪴", "🌻"],
    schemaType: "LocalBusiness",
  },
  restaurant: {
    gradient: "linear-gradient(135deg, #7C2D12 0%, #EA580C 100%)",
    icon: "🍽️",
    serviceIcons: ["🍲", "🍷", "🎉", "🥂"],
    galleryIcons: ["🍽️", "🍷", "🍲", "🥂", "🍰", "👨‍🍳"],
    schemaType: "Restaurant",
  },
  shop: {
    gradient: "linear-gradient(135deg, #6D28D9 0%, #EC4899 100%)",
    icon: "🛍️",
    serviceIcons: ["👗", "🎁", "💬", "📦"],
    galleryIcons: ["🛍️", "👗", "🎁", "✨", "📦", "🏷️"],
    schemaType: "Store",
  },
  construction: {
    gradient: "linear-gradient(135deg, #78350F 0%, #F59E0B 100%)",
    icon: "🏗️",
    serviceIcons: ["🏠", "🔨", "📐", "📋"],
    galleryIcons: ["🏗️", "🏠", "🔨", "📐", "🧱", "🚧"],
    schemaType: "GeneralContractor",
  },
};

export type BusinessOverrides = {
  name?: string;
  tagline?: string;
  phone?: string;
  phoneHref?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  gradient?: string;
  address?: { street: string; city: string; postalCode: string; country?: string };
  siteId?: string;
};

type BusinessTemplateProps = {
  type: BusinessType;
  /** Overrides used when this template is reused for a real client site
   * (see /clients/<name>/config.ts) instead of the LuxWeb Pro demo pages. */
  overrides?: BusinessOverrides;
};

/**
 * Reusable one-page landing template for local Luxembourg service
 * businesses (electricians, cleaning companies, plumbers, gardeners,
 * restaurants, shops, construction companies, ...).
 *
 * Content comes from the `templates.<type>` i18n namespace so the same
 * layout can be re-skinned per business by swapping messages, the THEMES
 * entry above, and — for real clients — the `overrides` prop.
 */
export default function BusinessTemplate({ type, overrides }: BusinessTemplateProps) {
  const t = useTranslations(`templates.${type}`);
  const tShared = useTranslations("templatesShared");
  const tWhatsapp = useTranslations("whatsapp");
  const theme = THEMES[type];
  const services = t.raw("services") as string[];
  const testimonials = t.raw("testimonials") as {
    quote: string;
    author: string;
    role: string;
  }[];

  const name = overrides?.name ?? t("name");
  const tagline = overrides?.tagline ?? t("tagline");
  const phone = overrides?.phone ?? siteConfig.phone;
  const phoneHref = overrides?.phoneHref ?? siteConfig.phoneHref;
  const whatsappNumber = overrides?.whatsappNumber ?? siteConfig.whatsappNumber;
  const whatsappMessage = overrides?.whatsappMessage ?? tWhatsapp("message");
  const gradient = overrides?.gradient ?? theme.gradient;
  const address = overrides?.address ?? siteConfig.address;

  const jsonLd = businessJsonLd({
    schemaType: theme.schemaType,
    name,
    description: tagline,
    phone,
    url: siteConfig.url,
    address,
  });

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Home */}
      <section id="home" className="scroll-mt-20 text-white" style={{ background: gradient }}>
        <div className="container-page py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
            {t("badge")}
          </span>
          <div className="mt-6 text-6xl" aria-hidden>
            {theme.icon}
          </div>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{name}</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">{tagline}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={phoneHref}
              className="w-full rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-lg transition-transform hover:scale-105 sm:w-auto"
            >
              {t("ctaEmergency")}
            </a>
            <a
              href={whatsappLink(whatsappMessage, whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              {t("ctaQuote")}
            </a>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="section scroll-mt-20 bg-white">
        <div className="container-page">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            {t("servicesTitle")}
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <div
                key={service}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center shadow-sm"
              >
                <span className="text-3xl" aria-hidden>
                  {theme.serviceIcons[i % theme.serviceIcons.length]}
                </span>
                <p className="mt-3 font-medium text-slate-800">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section id="galeria" className="section scroll-mt-20 bg-slate-50">
        <div className="container-page">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">{tShared("galleryTitle")}</h2>
            <p className="mt-3 text-slate-500">{tShared("gallerySubtitle")}</p>
          </div>
          {/*
            Placeholder gallery tiles — swap for real client photos from
            /clients/<name>/images/gallery/*.jpg (see BusinessTemplateView
            usage in the client-site loader).
          */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {theme.galleryIcons.map((icon, i) => (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-2xl text-4xl text-white shadow-sm"
                style={{ background: gradient }}
                aria-hidden
              >
                {icon}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testemunhos */}
      <section id="testemunhos" className="section scroll-mt-20 bg-white">
        <div className="container-page">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            {tShared("testimonialsTitle")}
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {testimonials.map((item) => (
              <figure
                key={item.author}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-7"
              >
                <blockquote className="text-slate-600">&ldquo;{item.quote}&rdquo;</blockquote>
                <figcaption className="mt-5">
                  <p className="font-semibold text-slate-900">{item.author}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="section scroll-mt-20 bg-slate-50">
        <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
              <ContactForm serviceOptions={services} siteId={overrides?.siteId} />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <GoogleMap title={name} address={address} className="h-full min-h-[280px]" />
            <a
              href={whatsappLink(whatsappMessage, whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white hover:brightness-95"
            >
              WhatsApp — {phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
