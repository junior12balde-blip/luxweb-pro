import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "./Logo";
import { siteConfig } from "@/lib/constants";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tContact = useTranslations("contact");
  const year = 2026;

  return (
    <footer className="bg-primary-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Logo variant="light" className="mb-4" />
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              {t("description")}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white">{tNav("home")}</Link></li>
              <li><Link href="/servicos" className="hover:text-white">{tNav("services")}</Link></li>
              <li><Link href="/precos" className="hover:text-white">{t("pricing")}</Link></li>
              <li><Link href="/portfolio" className="hover:text-white">{tNav("portfolio")}</Link></li>
              <li><Link href="/templates" className="hover:text-white">{t("templates")}</Link></li>
              <li><Link href="/contacto" className="hover:text-white">{tNav("contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              {t("services")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/porque-nos-escolher" className="hover:text-white">{t("whyUs")}</Link></li>
              <li><Link href="/testemunhos" className="hover:text-white">{t("testimonials")}</Link></li>
              <li><Link href="/comunidade-portuguesa" className="hover:text-white">{t("portugueseCommunity")}</Link></li>
              <li><Link href="/localidades" className="hover:text-white">{t("locations")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              {t("contact")}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>{tContact("info.address")}</li>
              <li>
                <a href={siteConfig.phoneHref} className="hover:text-white">
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="hover:text-white">
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>
            © {year} {siteConfig.name}. {t("rights")}
          </p>
          <p>{t("madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
