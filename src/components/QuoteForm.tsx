"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { locales, localeNames, type Locale } from "@/i18n/routing";

type Status = "idle" | "submitting" | "success" | "error";

const BUSINESS_TYPE_KEYS = [
  "electrician",
  "cleaning",
  "plumber",
  "gardener",
  "restaurant",
  "shop",
  "construction",
  "other",
] as const;

const PLAN_KEYS = ["starter", "business", "premiumMultilingual", "maintenance", "unsure"] as const;

type QuoteFormProps = {
  /** Pre-selects a plan, e.g. when arriving from a pricing card's
   * "Request this plan" button (?plano=premium). */
  defaultPlan?: string;
};

export default function QuoteForm({ defaultPlan }: QuoteFormProps) {
  const t = useTranslations("quote.form");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [selectedLanguages, setSelectedLanguages] = useState<Locale[]>([locale as Locale]);

  function toggleLanguage(loc: Locale) {
    setSelectedLanguages((current) =>
      current.includes(loc) ? current.filter((l) => l !== loc) : [...current, loc]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const data = {
      ...Object.fromEntries(new FormData(form).entries()),
      languages: selectedLanguages,
      locale,
    };

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      form.reset();
      setSelectedLanguages([locale as Locale]);
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="q-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            {t("name")}
          </label>
          <input
            id="q-name"
            name="name"
            type="text"
            required
            placeholder={t("namePlaceholder")}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label htmlFor="q-email" className="mb-1.5 block text-sm font-medium text-slate-700">
            {t("email")}
          </label>
          <input
            id="q-email"
            name="email"
            type="email"
            required
            placeholder={t("emailPlaceholder")}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="q-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
            {t("phone")}
          </label>
          <input
            id="q-phone"
            name="phone"
            type="tel"
            placeholder={t("phonePlaceholder")}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label htmlFor="q-company" className="mb-1.5 block text-sm font-medium text-slate-700">
            {t("company")}
          </label>
          <input
            id="q-company"
            name="company"
            type="text"
            placeholder={t("companyPlaceholder")}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="q-businessType" className="mb-1.5 block text-sm font-medium text-slate-700">
            {t("businessType")}
          </label>
          <select
            id="q-businessType"
            name="businessType"
            defaultValue=""
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="" disabled>
              {t("businessTypePlaceholder")}
            </option>
            {BUSINESS_TYPE_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`businessTypes.${key}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="q-plan" className="mb-1.5 block text-sm font-medium text-slate-700">
            {t("plan")}
          </label>
          <select
            id="q-plan"
            name="plan"
            defaultValue={defaultPlan ?? ""}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="" disabled>
              {t("planPlaceholder")}
            </option>
            {PLAN_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`plans.${key}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-slate-700">{t("languages")}</legend>
        <p className="mb-2.5 text-xs text-slate-500">{t("languagesHint")}</p>
        <div className="flex flex-wrap gap-2">
          {locales.map((loc) => {
            const checked = selectedLanguages.includes(loc);
            return (
              <label
                key={loc}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  checked
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleLanguage(loc)}
                />
                {localeNames[loc]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="q-message" className="mb-1.5 block text-sm font-medium text-slate-700">
          {t("message")}
        </label>
        <textarea
          id="q-message"
          name="message"
          required
          rows={5}
          placeholder={t("messagePlaceholder")}
          className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm shadow-primary-600/30 transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? t("submitting") : t("submit")}
      </button>

      {status === "success" && (
        <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {t("success")}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {t("error")}
        </p>
      )}
    </form>
  );
}
