"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "luxwebpro-cookie-consent";
export const COOKIE_CONSENT_EVENT = "luxwebpro-cookie-consent-changed";

export type ConsentValue = "granted" | "denied";

export function getStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

function setStoredConsent(value: ConsentValue) {
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
}

/**
 * Minimal cookie consent banner — required under GDPR (Luxembourg is EU)
 * before loading any analytics script. Analytics.tsx only injects GA after
 * this stores "granted"; nothing analytics-related loads until then.
 */
export default function CookieConsent() {
  const t = useTranslations("cookieConsent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredConsent() === null);
  }, []);

  function respond(value: ConsentValue) {
    setStoredConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur sm:p-5">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-center text-sm text-slate-600 sm:text-left">{t("message")}</p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => respond("denied")}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {t("decline")}
          </button>
          <button
            type="button"
            onClick={() => respond("granted")}
            className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
