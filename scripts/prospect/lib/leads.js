"use strict";

function slugify(name) {
  return (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** True when a lead has no real website of its own — empty, a placeholder
 * value, or just a social-media profile standing in for a site. */
function hasNoRealWebsite(website) {
  const w = (website || "").trim().toLowerCase();
  if (!w || w === "n/a" || w === "none" || w === "-") return true;
  if (w.includes("facebook.com") || w.includes("instagram.com")) return true;
  return false;
}

/** Scores a lead 0-100 and classifies it Hot / Warm / Cold. Weights are a
 * starting point — tune them as real campaign data comes in. */
function scoreLead(lead, businessType) {
  let score = 0;
  const reasons = [];

  if (hasNoRealWebsite(lead.website)) {
    score += 40;
    reasons.push("Sem website próprio (+40)");
  }
  if (lead.phone) {
    score += 15;
    reasons.push("Tem telefone de contacto (+15)");
  }
  if (lead.email) {
    score += 10;
    reasons.push("Tem e-mail de contacto (+10)");
  }
  if (businessType) {
    score += 20;
    reasons.push("Setor coberto por um template LuxWeb Pro (+20)");
  }

  const employees = parseInt(lead.employees, 10);
  if (!Number.isNaN(employees) && employees >= 2 && employees <= 20) {
    score += 15;
    reasons.push("Dimensão ideal — 2 a 20 colaboradores (+15)");
  }

  let tier = "Cold";
  if (score >= 70) tier = "Hot";
  else if (score >= 40) tier = "Warm";

  return { score, tier, reasons };
}

module.exports = { slugify, hasNoRealWebsite, scoreLead };
