import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/constants";

type ClientFooterProps = {
  name: string;
};

export default async function ClientFooter({ name }: ClientFooterProps) {
  const t = await getTranslations("footer");
  const year = 2026;

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container-page py-10 text-center text-sm">
        <p className="text-base font-semibold text-white">{name}</p>
        <p className="mt-2 text-slate-500">
          © {year} {name}. {t("rights")}
        </p>
        <p className="mt-4 text-xs text-slate-600">
          Website by{" "}
          <a
            href={siteConfig.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            {siteConfig.name}
          </a>
        </p>
      </div>
    </footer>
  );
}
