"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { localeFlags, localeNames, type Locale } from "@/i18n/routing";

type ClientLanguageSwitcherProps = {
  locale: Locale;
  languages: Locale[];
};

/**
 * Standalone language switcher for /site/[client]/[locale] routes.
 * These routes sit outside next-intl's `routing` config (they're not part
 * of the agency's own localized pathnames), so — unlike the main site's
 * LanguageSwitcher — this manipulates the URL segment directly instead of
 * using next-intl's navigation APIs.
 */
export default function ClientLanguageSwitcher({
  locale,
  languages,
}: ClientLanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname(); // /site/<slug>/<locale>

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(next: Locale) {
    const segments = pathname.split("/");
    // ["", "site", "<slug>", "<locale>"]
    segments[3] = next;
    router.push(segments.join("/"));
    setOpen(false);
  }

  if (languages.length < 2) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Choose language"
        className="flex items-center gap-2 rounded-full border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        <span className="text-base leading-none" aria-hidden>
          {localeFlags[locale]}
        </span>
        <span className="tracking-wide">{locale.toUpperCase()}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          {languages.map((loc) => {
            const active = loc === locale;
            return (
              <li key={loc}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => switchLocale(loc)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? "bg-primary-50 font-semibold text-primary-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-base leading-none" aria-hidden>
                    {localeFlags[loc]}
                  </span>
                  <span className="flex-1">{localeNames[loc]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
