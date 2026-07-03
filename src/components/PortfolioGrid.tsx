"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const CATEGORY_ICONS: Record<string, string> = {
  electrician: "⚡",
  cleaning: "🧹",
  restaurant: "🍽️",
  other: "🖥️",
};

export default function PortfolioGrid() {
  const t = useTranslations("portfolio");
  const [filter, setFilter] = useState<string>("all");

  const items = t.raw("items") as {
    title: string;
    category: string;
    description: string;
  }[];

  const categories = ["all", "electrician", "cleaning", "restaurant"] as const;
  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div>
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              filter === cat
                ? "bg-primary-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div
            key={item.title}
            className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-44 items-center justify-center bg-hero-gradient text-5xl text-white">
              {CATEGORY_ICONS[item.category] ?? "🖥️"}
            </div>
            <div className="p-6">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                {t(`categories.${item.category}`)}
              </span>
              <h3 className="mt-2 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
