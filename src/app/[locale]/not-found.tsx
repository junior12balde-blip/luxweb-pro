import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-7xl font-bold text-primary-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">{t("title")}</h1>
      <p className="mt-2 max-w-md text-slate-500">{t("description")}</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
