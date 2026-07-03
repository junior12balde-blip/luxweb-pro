#!/usr/bin/env node
"use strict";

const path = require("node:path");
const fs = require("node:fs");
const { hasNoRealWebsite } = require("./lib/leads");

function run(leads, outputDir) {
  const opportunities = leads.filter((lead) => hasNoRealWebsite(lead.website));
  fs.mkdirSync(outputDir, { recursive: true });
  const outFile = path.join(outputDir, "02-opportunities.json");
  fs.writeFileSync(outFile, JSON.stringify(opportunities, null, 2));
  return { opportunities, outFile };
}

if (require.main === module) {
  const outputDir = path.join(__dirname, "output");
  const leads = JSON.parse(fs.readFileSync(path.join(outputDir, "01-leads.json"), "utf-8"));
  const { opportunities, outFile } = run(leads, outputDir);
  console.log(`✓ ${opportunities.length}/${leads.length} empresas sem website próprio`);
  console.log(`  → ${path.relative(process.cwd(), outFile)}`);
}

module.exports = { run };
