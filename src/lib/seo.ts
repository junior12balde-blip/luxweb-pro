import { siteConfig } from "./constants";
import { locales, hreflangTags, type Locale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import type { City } from "./cities";

export function localBusinessJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    image: `${siteConfig.url}/logo.svg`,
    "@id": siteConfig.url,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    priceRange: "€€",
    inLanguage: hreflangTags[locale],
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.lat,
      longitude: siteConfig.geo.lng,
    },
    areaServed: {
      "@type": "Country",
      name: "Luxembourg",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "09:00",
      closes: "18:00",
    },
    sameAs: [
      siteConfig.social.facebook,
      siteConfig.social.instagram,
      siteConfig.social.linkedin,
    ],
  };
}

type BusinessJsonLdOptions = {
  schemaType: string;
  name: string;
  description?: string;
  phone: string;
  email?: string;
  url: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country?: string;
  };
  geo?: { lat: number; lng: number };
};

/**
 * Generic LocalBusiness JSON-LD for a single business (electrician, shop,
 * restaurant, ...). Used both by the /templates/* agency demo pages and by
 * real client sites under /site/[client] — falls back to LuxWeb Pro's own
 * address/geo when a client hasn't set its own yet.
 */
export function businessJsonLd(options: BusinessJsonLdOptions) {
  const address = options.address ?? siteConfig.address;
  const geo = options.geo ?? siteConfig.geo;

  return {
    "@context": "https://schema.org",
    "@type": options.schemaType,
    name: options.name,
    description: options.description,
    "@id": options.url,
    url: options.url,
    telephone: options.phone,
    email: options.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      postalCode: address.postalCode,
      addressCountry: address.country ?? "LU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: geo.lat,
      longitude: geo.lng,
    },
    areaServed: {
      "@type": "Country",
      name: "Luxembourg",
    },
  };
}

/** LocalBusiness JSON-LD scoped to a single city's local-SEO landing page —
 * areaServed is the city itself (a schema.org City with GeoCoordinates)
 * rather than the whole country, which is what actually signals local
 * relevance to Google for "<service> in <city>" queries. */
export function cityJsonLd(city: City, locale: Locale, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${siteConfig.name} — ${city.name}`,
    description,
    "@id": `${siteConfig.url}/${locale}#${city.slug}`,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    inLanguage: hreflangTags[locale],
    areaServed: {
      "@type": "City",
      name: city.name,
      geo: {
        "@type": "GeoCoordinates",
        latitude: city.lat,
        longitude: city.lng,
      },
    },
  };
}

// Keyed by the real BCP47 hreflang tag (not the URL locale segment) so the
// emitted <link rel="alternate" hreflang="..."> stays standards-compliant.
// Only correct for the home page ("/") — routes with a localized pathname
// (e.g. "/contacto" -> "/kontakt" for lu) need `localizedAlternates` below
// instead, since this one doesn't translate the slug per locale.
export function buildLanguageAlternates(pathname = "") {
  return Object.fromEntries(
    locales.map((locale) => [
      hreflangTags[locale],
      `${siteConfig.url}/${locale}${pathname}`,
    ])
  );
}

/**
 * Correct per-page hreflang alternates for any route registered in
 * `routing.pathnames` — resolves each locale's *actual* localized URL
 * (via next-intl's `getPathname`) instead of naively concatenating the
 * internal pathname, which breaks for routes whose slug is translated
 * (e.g. "/contacto" is "/kontakt" in lu, "/contact" in fr/en).
 */
export function localizedAlternates(href: Parameters<typeof getPathname>[0]["href"]) {
  return Object.fromEntries(
    locales.map((locale) => [
      hreflangTags[locale],
      `${siteConfig.url}${getPathname({ locale, href })}`,
    ])
  );
}

/**
 * The full, correct `alternates` object for a page's `generateMetadata` —
 * canonical *and* hreflang languages together. Next.js metadata merging
 * replaces the whole `alternates` object at the page level rather than
 * deep-merging it with the layout's, so a page that sets `languages` but
 * not `canonical` silently loses the canonical tag entirely. Use this
 * instead of calling `localizedAlternates` alone.
 */
export function pageAlternates(
  locale: Locale,
  href: Parameters<typeof getPathname>[0]["href"]
) {
  return {
    canonical: `${siteConfig.url}${getPathname({ locale, href })}`,
    languages: localizedAlternates(href),
  };
}
