#!/usr/bin/env node
"use strict";

const path = require("node:path");
const fs = require("node:fs");
const { GRADIENTS } = require("./lib/businessTypes");

const CLIENTS_DIR = path.join(__dirname, "..", "..", "clients");

const STUB_TAGLINE = {
  lu: "Textes an Depot — mat de richtege Kontakter vum Client komplettéieren.",
  fr: "Textes à compléter avec les informations réelles du client.",
  de: "Texte mit den echten Kundendaten vervollständigen.",
  en: "Placeholder copy — fill in with the client's real information.",
  pt: "Textos por preencher com a informação real do cliente.",
};

function configTemplate(lead) {
  const whatsapp = (lead.phone || "").replace(/[^0-9]/g, "") || "352000000000";
  return `import type { ClientConfig } from "@/lib/clientSite";

// Gerado automaticamente por scripts/prospect/05-scaffold-clients.js a partir
// de um lead de prospeção — rever e completar antes de publicar.
const config: ClientConfig = {
  slug: "${lead.slug}",
  businessType: "${lead.businessType}",
  name: "${(lead.name || "").replace(/"/g, '\\"')}",
  phone: "${lead.phone || "+352 000 000 000"}",
  whatsappNumber: "${whatsapp}",
  email: "${lead.email || "contacto@exemplo.lu"}",
  address: {
    street: "${lead.address || "A completar"}",
    postalCode: "${lead.postalCode || "L-0000"}",
    city: "${lead.city || "Luxembourg"}",
    country: "LU",
  },
  languages: ["${(lead.language || "fr").toLowerCase()}"],
  logo: "logo.svg",
};

export default config;
`;
}

function colorsTemplate(businessType) {
  const gradient = GRADIENTS[businessType] || GRADIENTS.electrician;
  return `import type { ClientColors } from "@/lib/clientSite";

const colors: ClientColors = {
  gradient: "${gradient}",
};

export default colors;
`;
}

function translationTemplate(lang) {
  return (
    JSON.stringify(
      {
        tagline: STUB_TAGLINE[lang] || STUB_TAGLINE.fr,
        services: ["Service 1", "Service 2", "Service 3", "Service 4"],
        testimonials: [],
      },
      null,
      2
    ) + "\n"
  );
}

/** Scaffolds clients/<slug>/ (config.ts, colors.ts, translations/, images/)
 * for high-scoring leads — a first draft ready for the agency to fill in
 * with real copy and photos before going live (see clients/README.md). */
function run(scoredLeads, { tier = "Hot" } = {}) {
  const targets = scoredLeads.filter((lead) => lead.tier === tier && lead.businessType);
  const created = [];

  for (const lead of targets) {
    const dir = path.join(CLIENTS_DIR, lead.slug);
    if (fs.existsSync(dir)) {
      created.push({ slug: lead.slug, status: "já existe, ignorado" });
      continue;
    }

    fs.mkdirSync(path.join(dir, "translations"), { recursive: true });
    fs.mkdirSync(path.join(dir, "images", "gallery"), { recursive: true });

    fs.writeFileSync(path.join(dir, "config.ts"), configTemplate(lead));
    fs.writeFileSync(path.join(dir, "colors.ts"), colorsTemplate(lead.businessType));

    const lang = (lead.language || "fr").toLowerCase();
    fs.writeFileSync(path.join(dir, "translations", `${lang}.json`), translationTemplate(lang));
    fs.writeFileSync(
      path.join(dir, "images", "README.md"),
      `Substituir por logo.svg e fotos reais de ${lead.name} antes de publicar.\n`
    );

    created.push({ slug: lead.slug, status: "criado" });
  }

  return { created };
}

if (require.main === module) {
  const outputDir = path.join(__dirname, "output");
  const scored = JSON.parse(fs.readFileSync(path.join(outputDir, "03-scored.json"), "utf-8"));
  const { created } = run(scored);
  created.forEach((c) =>
    console.log(`  ${c.status === "criado" ? "✓" : "·"} clients/${c.slug} — ${c.status}`)
  );
  console.log(
    `✓ ${created.filter((c) => c.status === "criado").length} maquetas criadas em /clients`
  );
}

module.exports = { run };
