import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import BusinessTemplate from "@/templates/BusinessTemplate";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "templates.shop" });
  return {
    title: `${t("name")} — ${t("tagline")}`,
    alternates: pageAlternates(locale as Locale, "/templates/loja"),
  };
}

export default async function ShopTemplatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <BusinessTemplate type="shop" />;
}
