"use strict";

// Sector labels as they might realistically appear in different CSV
// exports (PT, FR, DE, EN) mapped onto LuxWeb Pro's 7 BusinessTemplate
// types (src/templates/BusinessTemplate.tsx).
const SECTOR_TO_BUSINESS_TYPE = {
  eletricista: "electrician",
  electricien: "electrician",
  elektriker: "electrician",
  electrician: "electrician",

  limpeza: "cleaning",
  nettoyage: "cleaning",
  reinigung: "cleaning",
  cleaning: "cleaning",

  canalizador: "plumber",
  plombier: "plumber",
  klempner: "plumber",
  plumber: "plumber",

  jardineiro: "gardener",
  jardinier: "gardener",
  gartner: "gardener",
  gardener: "gardener",

  restaurante: "restaurant",
  restaurant: "restaurant",

  loja: "shop",
  boutique: "shop",
  geschaft: "shop",
  shop: "shop",

  construcao: "construction",
  construction: "construction",
  bau: "construction",

  barbearia: "barbershop",
  coiffeur: "barbershop",
  friseur: "barbershop",
  barbershop: "barbershop",
  barbier: "barbershop",

  oficina: "carRepair",
  "oficina-automovel": "carRepair",
  garage: "carRepair",
  werkstatt: "carRepair",
  carrepair: "carRepair",
};

// Mirrors THEMES[type].gradient in src/templates/BusinessTemplate.tsx —
// kept in sync manually since this script runs outside the Next.js/TS
// build and can't import a .tsx file directly.
const GRADIENTS = {
  electrician: "linear-gradient(135deg, #B91C1C 0%, #F59E0B 100%)",
  cleaning: "linear-gradient(135deg, #0369A1 0%, #06B6D4 100%)",
  plumber: "linear-gradient(135deg, #0F766E 0%, #38BDF8 100%)",
  gardener: "linear-gradient(135deg, #166534 0%, #84CC16 100%)",
  restaurant: "linear-gradient(135deg, #7C2D12 0%, #EA580C 100%)",
  shop: "linear-gradient(135deg, #6D28D9 0%, #EC4899 100%)",
  construction: "linear-gradient(135deg, #78350F 0%, #F59E0B 100%)",
  barbershop: "linear-gradient(135deg, #18181B 0%, #B45309 100%)",
  carRepair: "linear-gradient(135deg, #1E293B 0%, #DC2626 100%)",
};

function normalizeSector(sector) {
  return (sector || "").trim().toLowerCase();
}

function detectBusinessType(sector) {
  return SECTOR_TO_BUSINESS_TYPE[normalizeSector(sector)] || null;
}

module.exports = { SECTOR_TO_BUSINESS_TYPE, GRADIENTS, detectBusinessType };
