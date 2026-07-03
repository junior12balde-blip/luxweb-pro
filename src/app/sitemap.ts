import type { MetadataRoute } from "next";
import { locales, hreflangTags } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { siteConfig } from "@/lib/constants";
import { CITIES } from "@/lib/cities";

// Static routes, keyed by their internal pathname (see src/i18n/routing.ts
// `pathnames`) — getPathname() below resolves each one to the *actual*
// localized URL per language (e.g. "/contacto" -> "/kontakt" for lu,
// "/contact" for fr/en), which a naive locale-prefix concatenation would
// have gotten wrong for every localized route.
const STATIC_ROUTES: { pathname: Parameters<typeof getPathname>[0]["href"]; priority: number; changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]> }[] = [
  { pathname: "/", priority: 1, changeFrequency: "weekly" },
  { pathname: "/servicos", priority: 0.8, changeFrequency: "monthly" },
  { pathname: "/precos", priority: 0.9, changeFrequency: "monthly" },
  { pathname: "/porque-nos-escolher", priority: 0.7, changeFrequency: "monthly" },
  { pathname: "/orcamento", priority: 0.9, changeFrequency: "monthly" },
  { pathname: "/portfolio", priority: 0.7, changeFrequency: "monthly" },
  { pathname: "/testemunhos", priority: 0.7, changeFrequency: "monthly" },
  { pathname: "/comunidade-portuguesa", priority: 0.7, changeFrequency: "monthly" },
  { pathname: "/localidades", priority: 0.6, changeFrequency: "monthly" },
  { pathname: "/contacto", priority: 0.8, changeFrequency: "monthly" },
  { pathname: "/templates", priority: 0.6, changeFrequency: "monthly" },
  { pathname: "/templates/electricista", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/templates/limpeza", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/templates/canalizador", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/templates/jardineiro", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/templates/restaurante", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/templates/loja", priority: 0.5, changeFrequency: "monthly" },
  { pathname: "/templates/construcao", priority: 0.5, changeFrequency: "monthly" },
];

function buildEntry(
  href: Parameters<typeof getPathname>[0]["href"],
  priority: number,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>
): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteConfig.url}${getPathname({ locale: locales[0], href })}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [hreflangTags[locale], `${siteConfig.url}${getPathname({ locale, href })}`])
      ),
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = STATIC_ROUTES.map((route) =>
    buildEntry(route.pathname, route.priority, route.changeFrequency)
  );

  for (const city of CITIES) {
    entries.push(
      buildEntry(
        { pathname: "/localidades/[cidade]", params: { cidade: city.slug } },
        0.6,
        "monthly"
      )
    );
  }

  return entries;
}
