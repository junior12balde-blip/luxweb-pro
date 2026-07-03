export const BUSINESS_TYPES = [
  "eletricista",
  "limpeza",
  "canalizador",
  "jardineiro",
  "restaurante",
  "loja",
  "construcao",
] as const;

export type BusinessTypeId = (typeof BUSINESS_TYPES)[number];

export type BusinessTypeTheme = {
  id: BusinessTypeId;
  gradient: string;
  icon: string;
  serviceIcons: string[];
  galleryIcons: string[];
};

/**
 * Visual theme per business vertical: gradient, hero icon and icon sets used
 * to illustrate services/gallery tiles when a client hasn't supplied real
 * photos yet. Content (names, copy) lives in i18n messages under
 * `templates.<id>` — this file only owns colors/icons so a new client can be
 * re-skinned by swapping `clients/<slug>/colors.ts` without touching copy.
 */
export const BUSINESS_THEMES: Record<BusinessTypeId, BusinessTypeTheme> = {
  eletricista: {
    id: "eletricista",
    gradient: "linear-gradient(135deg, #B91C1C 0%, #F59E0B 100%)",
    icon: "⚡",
    serviceIcons: ["🔌", "🚨", "🛡️", "🏠", "💡", "🔋"],
    galleryIcons: ["🔌", "⚡", "🏠", "🛠️", "💡", "🚨"],
  },
  limpeza: {
    id: "limpeza",
    gradient: "linear-gradient(135deg, #0369A1 0%, #06B6D4 100%)",
    icon: "🧹",
    serviceIcons: ["🏢", "🏠", "🪟", "🧱", "🧽", "🧴"],
    galleryIcons: ["🧹", "🏢", "🪟", "🧽", "🏠", "✨"],
  },
  canalizador: {
    id: "canalizador",
    gradient: "linear-gradient(135deg, #0E7490 0%, #38BDF8 100%)",
    icon: "🔧",
    serviceIcons: ["🚿", "🚰", "🔥", "🧯", "🛁", "🔩"],
    galleryIcons: ["🔧", "🚿", "🚰", "🛁", "🔥", "🔩"],
  },
  jardineiro: {
    id: "jardineiro",
    gradient: "linear-gradient(135deg, #15803D 0%, #84CC16 100%)",
    icon: "🌿",
    serviceIcons: ["🌳", "🌱", "🍂", "💧", "🪴", "🌷"],
    galleryIcons: ["🌿", "🌳", "🌱", "🪴", "🌷", "🍂"],
  },
  restaurante: {
    id: "restaurante",
    gradient: "linear-gradient(135deg, #7C2D12 0%, #EA580C 100%)",
    icon: "🍽️",
    serviceIcons: ["🍲", "🍷", "🎉", "🥂", "🍰", "☕"],
    galleryIcons: ["🍽️", "🍲", "🍷", "🥂", "🍰", "👨‍🍳"],
  },
  loja: {
    id: "loja",
    gradient: "linear-gradient(135deg, #6D28D9 0%, #EC4899 100%)",
    icon: "🛍️",
    serviceIcons: ["🛒", "🎁", "📦", "💳", "🚚", "🏷️"],
    galleryIcons: ["🛍️", "🛒", "🎁", "📦", "🏷️", "✨"],
  },
  construcao: {
    id: "construcao",
    gradient: "linear-gradient(135deg, #78350F 0%, #D97706 100%)",
    icon: "🏗️",
    serviceIcons: ["🧱", "🏠", "🚧", "📐", "🪚", "🏢"],
    galleryIcons: ["🏗️", "🧱", "🚧", "🏠", "📐", "🏢"],
  },
};
