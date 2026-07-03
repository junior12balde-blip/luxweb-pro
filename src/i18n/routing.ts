import { defineRouting } from "next-intl/routing";

// URL segment "lu" (Luxembourg-branded) carries Lëtzebuergesch content and is
// obligatoresch — steet als Standardsprooch, well LuxWeb Pro sech als lokal a
// lëtzebuergesch Agence positionéiert.
//
// Note: "lu" is used as the URL/route code (matches the requested /lu path
// and the .lu ccTLD branding) even though the correct BCP47 language subtag
// for Luxembourgish is "lb" — see `hreflangTag` below, which is what's
// actually emitted in <html lang>, hreflang alternates and JSON-LD so SEO
// stays standards-compliant regardless of the URL slug.
export const locales = ["lu", "fr", "de", "en", "pt"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "lu";

export const localeNames: Record<Locale, string> = {
  lu: "Lëtzebuergesch",
  fr: "Français",
  de: "Deutsch",
  en: "English",
  pt: "Português",
};

export const localeFlags: Record<Locale, string> = {
  lu: "🇱🇺",
  fr: "🇫🇷",
  de: "🇩🇪",
  en: "🇬🇧",
  pt: "🇵🇹",
};

// Valid BCP47 language tags for <html lang>, hreflang and JSON-LD.
export const hreflangTags: Record<Locale, string> = {
  lu: "lb",
  fr: "fr",
  de: "de",
  en: "en",
  pt: "pt",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/servicos": {
      lu: "/servicer",
      fr: "/services",
      de: "/dienstleistungen",
      en: "/services",
      pt: "/servicos",
    },
    "/portfolio": "/portfolio",
    "/contacto": {
      lu: "/kontakt",
      fr: "/contact",
      de: "/kontakt",
      en: "/contact",
      pt: "/contacto",
    },
    // Internal template demo/gallery pages — same slug in every locale
    // (not customer-facing marketing URLs, so no need to localize them).
    "/templates": "/templates",
    "/templates/electricista": "/templates/electricista",
    "/templates/limpeza": "/templates/limpeza",
    "/templates/canalizador": "/templates/canalizador",
    "/templates/jardineiro": "/templates/jardineiro",
    "/templates/restaurante": "/templates/restaurante",
    "/templates/loja": "/templates/loja",
    "/templates/construcao": "/templates/construcao",

    "/precos": {
      // "praisser" (no diaeresis) — accented characters in URL slugs cause
      // next-intl's pathname matching to fail (redirects to home instead
      // of resolving), so every localized slug here is kept plain ASCII.
      lu: "/praisser",
      fr: "/tarifs",
      de: "/preise",
      en: "/pricing",
      pt: "/precos",
    },
    "/porque-nos-escolher": {
      lu: "/firwat-mir",
      fr: "/pourquoi-nous",
      de: "/warum-wir",
      en: "/why-us",
      pt: "/porque-nos-escolher",
    },
    "/orcamento": {
      lu: "/devisufro",
      fr: "/devis",
      de: "/angebot-anfragen",
      en: "/quote",
      pt: "/orcamento",
    },
    "/testemunhos": {
      lu: "/kritiken",
      fr: "/temoignages",
      de: "/kundenstimmen",
      en: "/testimonials",
      pt: "/testemunhos",
    },
    // Targets the Portuguese business community specifically — kept as a
    // stable, non-localized slug across every locale on purpose.
    "/comunidade-portuguesa": "/comunidade-portuguesa",

    "/localidades": {
      lu: "/regiounen",
      fr: "/localites",
      de: "/standorte",
      en: "/locations",
      pt: "/localidades",
    },
    "/localidades/[cidade]": {
      lu: "/regiounen/[cidade]",
      fr: "/localites/[cidade]",
      de: "/standorte/[cidade]",
      en: "/locations/[cidade]",
      pt: "/localidades/[cidade]",
    },
  },
});
