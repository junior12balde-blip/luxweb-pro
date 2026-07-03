#!/usr/bin/env node
"use strict";

const path = require("node:path");
const fs = require("node:fs");

const PROPOSAL_TEXT = {
  lu: (lead) => `# Ugebot fir eng Websäit — ${lead.name}

Moien,

Mir hu gesinn datt **${lead.name}** (${lead.sector}) zu ${lead.city || "Lëtzebuerg"} nach keng eege professionell Websäit huet. LuxWeb Pro baut modern, séier a méisproocheg Websäiten fir Lëtzebuerger Betriber — mat eise Ready-to-go Templates kënne mir Iech eng Maquette bannent 24h weisen.

## Wat mir proposéieren
- One-Page Websäit (Home, Servicer, Galerie, Referenzen, Kontakt)
- Kontaktformular + WhatsApp
- Google Maps mat Ärer Adress
- Lokal SEO fir zu ${lead.city || "Lëtzebuerg"} fonnt ze ginn
- Verfügbar op Lëtzebuergesch, Franséisch, Däitsch (+ Englesch/Portugisesch optional)

## Opportunitéits-Score
${lead.score}/100 — ${lead.tier}
${(lead.reasons || []).map((r) => `- ${r}`).join("\n")}

## Präis
Ab 690 € (One-Page Websäit, ee Secteur, bis zu 3 Sproochen) + Hosting.

## Nächst Schrëtt
Äntwert op dëse Message oder rufft eis un +352 621 123 456 — mir kënnen Iech eng perséinlech Maquette bannent 24h weisen.

— D'LuxWeb Pro Equipe
`,
  fr: (lead) => `# Proposition commerciale — ${lead.name}

Bonjour,

Nous avons remarqué que **${lead.name}** (${lead.sector}) n'a pas encore de site web professionnel à ${lead.city || "Luxembourg"}. Chez LuxWeb Pro, nous créons des sites modernes, rapides et multilingues pour les entreprises luxembourgeoises — grâce à nos templates prêts à l'emploi, nous pouvons vous montrer une maquette sous 24h.

## Ce que nous proposons
- Site one-page moderne (Accueil, Services, Galerie, Témoignages, Contact)
- Formulaire de contact + intégration WhatsApp
- Google Maps avec votre adresse
- SEO local pour être trouvé à ${lead.city || "Luxembourg"}
- Disponible en luxembourgeois, français, allemand (+ anglais/portugais en option)

## Score d'opportunité
${lead.score}/100 — ${lead.tier}
${(lead.reasons || []).map((r) => `- ${r}`).join("\n")}

## Tarif indicatif
À partir de 690 € (site one-page, un secteur, jusqu'à 3 langues) + hébergement.

## Prochaine étape
Répondez à cet e-mail ou appelez-nous au +352 621 123 456 — nous vous montrons une maquette personnalisée sous 24h.

— L'équipe LuxWeb Pro
`,
  de: (lead) => `# Angebot — ${lead.name}

Guten Tag,

uns ist aufgefallen, dass **${lead.name}** (${lead.sector}) in ${lead.city || "Luxemburg"} noch keine eigene professionelle Website hat. LuxWeb Pro erstellt moderne, schnelle und mehrsprachige Websites für luxemburgische Unternehmen — dank unserer einsatzbereiten Templates können wir Ihnen innerhalb von 24 Stunden einen Entwurf zeigen.

## Unser Angebot
- Moderne One-Page-Website (Startseite, Leistungen, Galerie, Referenzen, Kontakt)
- Kontaktformular + WhatsApp-Integration
- Google Maps mit Ihrer Adresse
- Lokales SEO, damit Sie in ${lead.city || "Luxemburg"} gefunden werden
- Verfügbar auf Luxemburgisch, Französisch, Deutsch (+ Englisch/Portugiesisch optional)

## Opportunity-Score
${lead.score}/100 — ${lead.tier}
${(lead.reasons || []).map((r) => `- ${r}`).join("\n")}

## Richtpreis
Ab 690 € (One-Page-Website, eine Branche, bis zu 3 Sprachen) + Hosting.

## Nächster Schritt
Antworten Sie auf diese E-Mail oder rufen Sie uns an: +352 621 123 456 — wir zeigen Ihnen innerhalb von 24 Stunden einen personalisierten Entwurf.

— Ihr LuxWeb Pro Team
`,
  en: (lead) => `# Proposal — ${lead.name}

Hello,

We noticed that **${lead.name}** (${lead.sector}) in ${lead.city || "Luxembourg"} doesn't have its own professional website yet. LuxWeb Pro builds modern, fast and multilingual websites for Luxembourg businesses — thanks to our ready-to-go templates, we can show you a mockup within 24 hours.

## What we propose
- Modern one-page website (Home, Services, Gallery, Testimonials, Contact)
- Contact form + WhatsApp integration
- Google Maps with your address
- Local SEO so customers in ${lead.city || "Luxembourg"} can find you
- Available in Luxembourgish, French, German (+ English/Portuguese optional)

## Opportunity score
${lead.score}/100 — ${lead.tier}
${(lead.reasons || []).map((r) => `- ${r}`).join("\n")}

## Indicative price
From €690 (one-page site, one sector, up to 3 languages) + hosting.

## Next step
Reply to this message or call us at +352 621 123 456 — we can show you a personalized mockup within 24 hours.

— The LuxWeb Pro team
`,
  pt: (lead) => `# Proposta comercial — ${lead.name}

Olá,

Reparámos que a **${lead.name}** (${lead.sector}) em ${lead.city || "Luxemburgo"} ainda não tem um website profissional próprio. Na LuxWeb Pro criamos websites modernos, rápidos e multilingues para empresas do Luxemburgo — graças aos nossos templates prontos a usar, conseguimos mostrar-lhe uma maquete em menos de 24h.

## O que propomos
- Website one-page moderno (Início, Serviços, Galeria, Testemunhos, Contacto)
- Formulário de contacto + integração WhatsApp
- Google Maps com a sua morada
- SEO local para ser encontrado em ${lead.city || "Luxemburgo"}
- Disponível em luxemburguês, francês, alemão (+ inglês/português opcional)

## Pontuação de oportunidade
${lead.score}/100 — ${lead.tier}
${(lead.reasons || []).map((r) => `- ${r}`).join("\n")}

## Preço indicativo
A partir de 690 € (site one-page, um setor, até 3 idiomas) + alojamento.

## Próximo passo
Responda a esta mensagem ou ligue-nos para +352 621 123 456 — mostramos-lhe uma maquete personalizada em menos de 24h.

— A equipa LuxWeb Pro
`,
};

function run(scoredLeads, outputDir, { minTier = "Warm" } = {}) {
  const tierRank = { Hot: 2, Warm: 1, Cold: 0 };
  const targets = scoredLeads.filter((lead) => tierRank[lead.tier] >= tierRank[minTier]);

  const proposalsDir = path.join(outputDir, "proposals");
  fs.mkdirSync(proposalsDir, { recursive: true });

  const generated = targets.map((lead) => {
    const lang = (lead.language || "fr").toLowerCase();
    const build = PROPOSAL_TEXT[lang] || PROPOSAL_TEXT.fr;
    const file = path.join(proposalsDir, `${lead.slug}.md`);
    fs.writeFileSync(file, build(lead));
    return { slug: lead.slug, lang, file };
  });

  return { generated, proposalsDir };
}

if (require.main === module) {
  const outputDir = path.join(__dirname, "output");
  const scored = JSON.parse(fs.readFileSync(path.join(outputDir, "03-scored.json"), "utf-8"));
  const { generated, proposalsDir } = run(scored, outputDir);
  console.log(`✓ ${generated.length} propostas geradas (Hot + Warm)`);
  console.log(`  → ${path.relative(process.cwd(), proposalsDir)}/`);
}

module.exports = { run };
