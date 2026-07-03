#!/usr/bin/env node
"use strict";

const path = require("node:path");

const parseLeads = require("./01-parse-leads");
const filterNoWebsite = require("./02-filter-no-website");
const scoreLeads = require("./03-score-leads");
const generateProposals = require("./04-generate-proposals");
const scaffoldClients = require("./05-scaffold-clients");

const inputPath = process.argv[2] || path.join(__dirname, "sample-leads.csv");
const outputDir = path.join(__dirname, "output");

console.log("LuxWeb Pro — Pipeline de Prospeção Comercial\n");

const { leads } = parseLeads.run(inputPath, outputDir);
console.log(`1. Leads lidos ......................... ${leads.length}`);

const { opportunities } = filterNoWebsite.run(leads, outputDir);
console.log(`2. Sem website próprio .................. ${opportunities.length}`);

const { scored } = scoreLeads.run(opportunities, outputDir);
const hot = scored.filter((l) => l.tier === "Hot").length;
const warm = scored.filter((l) => l.tier === "Warm").length;
const cold = scored.length - hot - warm;
console.log(`3. Classificação ........................ ${hot} Hot, ${warm} Warm, ${cold} Cold`);

const { generated } = generateProposals.run(scored, outputDir);
console.log(`4. Propostas geradas (Hot + Warm) ....... ${generated.length}`);

const { created } = scaffoldClients.run(scored);
const createdCount = created.filter((c) => c.status === "criado").length;
console.log(`5. Maquetas /clients criadas (Hot) ...... ${createdCount}`);

console.log(`\nResultados em ${path.relative(process.cwd(), outputDir)}/`);
if (createdCount > 0) {
  console.log(`Novas maquetas em ${path.relative(process.cwd(), path.join(__dirname, "..", "..", "clients"))}/`);
}
