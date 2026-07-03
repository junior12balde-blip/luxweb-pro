import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import PortfolioGrid from "@/components/PortfolioGrid";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });
  const tMeta = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: `${t("subtitle")} — ${tMeta("siteName")}`,
    alternates: pageAlternates(locale as Locale, "/portfolio"),
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <PortfolioContent />;
}

function PortfolioContent() {
  const t = useTranslations("portfolio");

  return (
    <>
      <section className="bg-hero-gradient text-white">
        <div className="container-page py-20 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            {t("badge")}
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-primary-100">{t("subtitle")}</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <PortfolioGrid />
        </div>
      </section>
    </>
  );
}
