import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, hreflangTags, type Locale } from "@/i18n/routing";
import "../../../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// /site/[client]/[locale] pages are a preview/staging surface (the live
// product path is the client's own domain, pointed at this route — see
// OPERATIONS.md "Colocar o site do cliente em produção"). They're kept out
// of search results so they never compete with the client's real domain.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ClientSiteRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ client: string; locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={hreflangTags[locale as Locale]} className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
