import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import BusinessTemplate from "@/templates/BusinessTemplate";
import ClientHeader from "@/components/client/ClientHeader";
import ClientFooter from "@/components/client/ClientFooter";
import {
  listClientSlugs,
  isValidClientSlug,
  loadClientConfig,
  loadClientTranslations,
  deepMerge,
  clientOverrides,
} from "@/lib/clientSite";

export async function generateStaticParams() {
  const slugs = listClientSlugs();
  const params: { client: string; locale: string }[] = [];

  for (const client of slugs) {
    const { config } = await loadClientConfig(client);
    for (const locale of config.languages) {
      params.push({ client, locale });
    }
  }

  return params;
}

async function resolveClient(client: string, locale: string) {
  if (!isValidClientSlug(client) || !hasLocale(routing.locales, locale)) {
    return null;
  }
  const { config, colors } = await loadClientConfig(client);
  if (!config.languages.includes(locale as Locale)) {
    return null;
  }
  return { config, colors };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ client: string; locale: string }>;
}): Promise<Metadata> {
  const { client, locale } = await params;
  const resolved = await resolveClient(client, locale);
  if (!resolved) return {};

  const { config } = resolved;
  return {
    title: config.tagline ? `${config.name} — ${config.tagline}` : config.name,
    description: config.tagline,
  };
}

export default async function ClientSitePage({
  params,
}: {
  params: Promise<{ client: string; locale: string }>;
}) {
  const { client, locale } = await params;
  const resolved = await resolveClient(client, locale);
  if (!resolved) notFound();

  const { config, colors } = resolved;
  const typedLocale = locale as Locale;

  // /site isn't covered by next-intl's middleware (see middleware.ts), so
  // the request-level locale must be set explicitly for server components
  // here (ClientHeader/ClientFooter) that call next-intl/server's
  // getTranslations — otherwise it falls back to the default locale.
  setRequestLocale(typedLocale);

  const baseMessages = (await import(`@/messages/${locale}.json`)).default;
  const overrideMessages = loadClientTranslations(client, typedLocale);
  const mergedTemplate = deepMerge(
    baseMessages.templates[config.businessType],
    overrideMessages
  );
  const messages = {
    ...baseMessages,
    templates: {
      ...baseMessages.templates,
      [config.businessType]: mergedTemplate,
    },
  };

  const logoSrc = config.logo ? `/site/${client}/images/${config.logo}` : undefined;

  return (
    <NextIntlClientProvider locale={typedLocale} messages={messages}>
      <div className="flex min-h-screen flex-col font-sans">
        <ClientHeader
          name={config.name}
          locale={typedLocale}
          languages={config.languages}
          logoSrc={logoSrc}
        />
        <main className="flex-1">
          <BusinessTemplate
            type={config.businessType}
            overrides={clientOverrides(config, colors)}
          />
        </main>
        <ClientFooter name={config.name} />
      </div>
    </NextIntlClientProvider>
  );
}
