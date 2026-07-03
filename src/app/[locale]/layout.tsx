import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Analytics from "@/components/Analytics";
import CookieConsent from "@/components/CookieConsent";
import { routing, hreflangTags, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/lib/constants";
import { localBusinessJsonLd, buildLanguageAlternates } from "@/lib/seo";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t("title"),
      template: `%s | ${t("siteName")}`,
    },
    description: t("description"),
    keywords: [
      "agence web Luxembourg",
      "site internet Luxembourg",
      "Websäit Lëtzebuerg",
      "Webdesign Luxemburg",
      "SEO local Luxembourg",
      "création de site web PME Luxembourg",
    ],
    alternates: {
      canonical: `${siteConfig.url}/${locale}`,
      languages: {
        ...buildLanguageAlternates(),
        "x-default": `${siteConfig.url}/${routing.defaultLocale}`,
      },
    },
    openGraph: {
      type: "website",
      locale: hreflangTags[locale as Locale],
      url: `${siteConfig.url}/${locale}`,
      siteName: t("siteName"),
      title: t("title"),
      description: t("description"),
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    icons: {
      icon: "/icon.svg",
      shortcut: "/icon.svg",
    },
    robots: {
      index: true,
      follow: true,
    },
    // Only emits the verification meta tag when the env var is set — see
    // .env.example / OPERATIONS.md for how to get this from Search Console.
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale as Locale);

  const jsonLd = localBusinessJsonLd(locale as Locale);

  return (
    <html lang={hreflangTags[locale as Locale]} className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
          <CookieConsent />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
