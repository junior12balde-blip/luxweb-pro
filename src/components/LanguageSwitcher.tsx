"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/routing";

type LanguageSwitcherProps = {
  variant?: "light" | "dark";
};

export default function LanguageSwitcher({
  variant = "dark",
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        close();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function openMenu() {
    setOpen(true);
    requestAnimationFrame(() => setVisible(true));
  }

  function close() {
    setVisible(false);
    window.setTimeout(() => setOpen(false), 120);
  }

  function toggle() {
    if (open) close();
    else openMenu();
  }

  function switchLocale(next: Locale) {
    // Generic switcher — pathname may be a dynamic route (e.g.
    // /localidades/[cidade]), so params must travel with it. Full type
    // inference isn't possible here since we don't know which route this
    // is; this is next-intl's documented pattern for this case.
    // @ts-expect-error -- see comment above
    router.replace({ pathname, params }, { locale: next });
    close();
  }

  const textColor = variant === "light" ? "text-white" : "text-primary-950";
  const borderColor =
    variant === "light" ? "border-white/25 hover:bg-white/10" : "border-slate-200 hover:bg-slate-50";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Choose language"
        className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium ${textColor} ${borderColor} transition-all duration-150`}
      >
        <span className="text-base leading-none" aria-hidden>
          {localeFlags[locale]}
        </span>
        <span className="tracking-wide">{locale.toUpperCase()}</span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          className={`shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute right-0 z-50 mt-2 w-52 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur transition-all duration-150 ${
            visible ? "translate-y-0 scale-100 opacity-100" : "-translate-y-1 scale-95 opacity-0"
          }`}
        >
          {locales.map((loc) => {
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
                  {active && (
                    <svg width="16" height="16" viewBox="0 0 16 16" className="text-primary-600" aria-hidden>
                      <path
                        d="M3 8.5l3 3 7-7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
