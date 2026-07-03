import fs from "node:fs";
import path from "node:path";
import type { Locale } from "@/i18n/routing";
import type { BusinessOverrides, BusinessType } from "@/templates/BusinessTemplate";

const CLIENTS_DIR = path.join(process.cwd(), "clients");

export type ClientAddress = {
  street: string;
  city: string;
  postalCode: string;
  country?: string;
};

export type ClientConfig = {
  slug: string;
  businessType: BusinessType;
  name: string;
  /** Optional — falls back to the template's default tagline when unset. */
  tagline?: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: ClientAddress;
  /** Which of the 5 supported locales this client's site has active. */
  languages: Locale[];
  /** Filename under images/, e.g. "logo.svg" — served at /site/<slug>/images/<file>. */
  logo?: string;
};

export type ClientColors = {
  /** CSS gradient used for the hero/gallery tiles, e.g.
   * "linear-gradient(135deg, #123456 0%, #abcdef 100%)". */
  gradient: string;
};

/** Client folders starting with "_" (like `_example`) are excluded — they're
 * templates to copy, not live sites. */
export function listClientSlugs(): string[] {
  if (!fs.existsSync(CLIENTS_DIR)) return [];
  return fs
    .readdirSync(CLIENTS_DIR, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() && !entry.name.startsWith("_") && !entry.name.startsWith(".")
    )
    .map((entry) => entry.name);
}

export function isValidClientSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && listClientSlugs().includes(slug);
}

export async function loadClientConfig(
  slug: string
): Promise<{ config: ClientConfig; colors: ClientColors }> {
  const configModule = await import(`../../clients/${slug}/config`);
  const colorsModule = await import(`../../clients/${slug}/colors`);
  return {
    config: configModule.default as ClientConfig,
    colors: colorsModule.default as ClientColors,
  };
}

/** Reads clients/<slug>/translations/<locale>.json — returns {} if the
 * client hasn't added an override file for that locale. */
export function loadClientTranslations(
  slug: string,
  locale: Locale
): Record<string, unknown> {
  const file = path.join(CLIENTS_DIR, slug, "translations", `${locale}.json`);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Deep-merges a client's translation overrides on top of a template's
 * default messages — arrays and primitives are replaced wholesale, plain
 * objects are merged key by key. */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Record<string, unknown>
): T {
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const baseValue = result[key];
    const overrideValue = override[key];
    result[key] =
      isPlainObject(baseValue) && isPlainObject(overrideValue)
        ? deepMerge(baseValue, overrideValue)
        : overrideValue;
  }
  return result as T;
}

/** Maps a client's config + colors onto the props BusinessTemplate expects
 * to fully re-skin itself for a real client instead of the agency demo. */
export function clientOverrides(
  config: ClientConfig,
  colors: ClientColors
): BusinessOverrides {
  return {
    name: config.name,
    tagline: config.tagline,
    phone: config.phone,
    phoneHref: `tel:${config.phone.replace(/\s/g, "")}`,
    whatsappNumber: config.whatsappNumber,
    gradient: colors.gradient,
    address: config.address,
    siteId: config.slug,
  };
}
