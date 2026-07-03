#!/usr/bin/env node
"use strict";

/**
 * Walks every institutional-site route in every one of the 5 supported
 * locales and confirms it returns 200 with locale-appropriate content
 * (correct <html lang>, non-empty <title>). Run against a live server:
 *
 *   npm run build && npm start &   (or: npm run dev &)
 *   npm run qa:pages
 *   npm run qa:pages -- http://localhost:3000   (explicit base URL)
 *
 * NOTE: the PATHNAMES map below is a plain-JS mirror of
 * src/i18n/routing.ts (`pathnames`) — this script runs outside the
 * Next.js/TypeScript build, so it can't import that file directly. Keep
 * the two in sync when routes change.
 *
 * Scope: covers the institutional LuxWeb Pro site (src/app/[locale]/**).
 * Client sites (/site/[client]/[locale]) are enumerated per-client from
 * their own config.languages — see clients/README.md — and are spot-checked
 * manually per the OPERATIONS.md launch checklist rather than here, since
 * every new client adds routes this static list can't anticipate.
 */

const LOCALES = ["lu", "fr", "de", "en", "pt"];

const HREFLANG = { lu: "lb", fr: "fr", de: "de", en: "en", pt: "pt" };

const PATHNAMES = {
  "/": "/",
  "/servicos": { lu: "/servicer", fr: "/services", de: "/dienstleistungen", en: "/services", pt: "/servicos" },
  "/portfolio": "/portfolio",
  "/contacto": { lu: "/kontakt", fr: "/contact", de: "/kontakt", en: "/contact", pt: "/contacto" },
  "/templates": "/templates",
  "/templates/electricista": "/templates/electricista",
  "/templates/limpeza": "/templates/limpeza",
  "/templates/canalizador": "/templates/canalizador",
  "/templates/jardineiro": "/templates/jardineiro",
  "/templates/restaurante": "/templates/restaurante",
  "/templates/loja": "/templates/loja",
  "/templates/construcao": "/templates/construcao",
  "/templates/barbearia": "/templates/barbearia",
  "/templates/oficina-automovel": "/templates/oficina-automovel",
  "/precos": { lu: "/praisser", fr: "/tarifs", de: "/preise", en: "/pricing", pt: "/precos" },
  "/porque-nos-escolher": { lu: "/firwat-mir", fr: "/pourquoi-nous", de: "/warum-wir", en: "/why-us", pt: "/porque-nos-escolher" },
  "/orcamento": { lu: "/devisufro", fr: "/devis", de: "/angebot-anfragen", en: "/quote", pt: "/orcamento" },
  "/testemunhos": { lu: "/kritiken", fr: "/temoignages", de: "/kundenstimmen", en: "/testimonials", pt: "/testemunhos" },
  "/comunidade-portuguesa": "/comunidade-portuguesa",
  "/localidades": { lu: "/regiounen", fr: "/localites", de: "/standorte", en: "/locations", pt: "/localidades" },
};

const CITY_PARENT = { lu: "/regiounen", fr: "/localites", de: "/standorte", en: "/locations", pt: "/localidades" };
const CITY_SLUGS = ["luxembourg-ville", "esch-sur-alzette", "differdange", "dudelange", "ettelbruck"];

function resolvePathname(entry, locale) {
  const value = typeof entry === "string" ? entry : entry[locale];
  return value === "/" ? "" : value; // avoid a trailing slash (Next.js 308-redirects "/lu/" -> "/lu")
}

function buildUrls(baseUrl) {
  const urls = [];

  for (const [key, entry] of Object.entries(PATHNAMES)) {
    for (const locale of LOCALES) {
      urls.push({
        label: key,
        locale,
        url: `${baseUrl}/${locale}${resolvePathname(entry, locale)}`,
      });
    }
  }

  for (const slug of CITY_SLUGS) {
    for (const locale of LOCALES) {
      urls.push({
        label: `/localidades/${slug}`,
        locale,
        url: `${baseUrl}/${locale}${CITY_PARENT[locale]}/${slug}`,
      });
    }
  }

  return urls;
}

async function checkUrl({ label, locale, url }) {
  try {
    const res = await fetch(url, { redirect: "manual" });

    if (res.status >= 300 && res.status < 400) {
      return { label, locale, url, ok: false, reason: `unexpected redirect (${res.status}) — check the pathname slug` };
    }
    if (!res.ok) {
      return { label, locale, url, ok: false, reason: `HTTP ${res.status}` };
    }

    const html = await res.text();
    const langMatch = html.match(/<html[^>]*\slang="([^"]+)"/i);
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);

    if (!langMatch) {
      return { label, locale, url, ok: false, reason: "no <html lang> attribute found" };
    }
    if (langMatch[1] !== HREFLANG[locale]) {
      return {
        label,
        locale,
        url,
        ok: false,
        reason: `<html lang="${langMatch[1]}"> does not match expected "${HREFLANG[locale]}"`,
      };
    }
    if (!titleMatch || !titleMatch[1].trim()) {
      return { label, locale, url, ok: false, reason: "empty or missing <title>" };
    }

    return { label, locale, url, ok: true, title: titleMatch[1].trim() };
  } catch (error) {
    return { label, locale, url, ok: false, reason: error.message };
  }
}

async function main() {
  const baseUrl = process.argv[2] || process.env.QA_BASE_URL || "http://localhost:3000";
  const targets = buildUrls(baseUrl);

  console.log(`LuxWeb Pro — QA multi-idioma (${targets.length} páginas, base: ${baseUrl})\n`);

  const results = [];
  for (const target of targets) {
    results.push(await checkUrl(target));
  }

  const failures = results.filter((r) => !r.ok);
  const byLocale = {};
  for (const locale of LOCALES) {
    const localeResults = results.filter((r) => r.locale === locale);
    byLocale[locale] = { total: localeResults.length, ok: localeResults.filter((r) => r.ok).length };
  }

  console.log("Por idioma:");
  for (const locale of LOCALES) {
    const { total, ok } = byLocale[locale];
    console.log(`  ${locale}: ${ok}/${total} ${ok === total ? "✓" : "✗"}`);
  }

  if (failures.length > 0) {
    console.log(`\n✗ ${failures.length} falha(s):\n`);
    for (const failure of failures) {
      console.log(`  [${failure.locale}] ${failure.label} — ${failure.reason}`);
      console.log(`    ${failure.url}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`\n✓ Todas as ${results.length} páginas OK nos ${LOCALES.length} idiomas.`);
  }
}

main();
