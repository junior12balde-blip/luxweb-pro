#!/usr/bin/env node
"use strict";

const path = require("node:path");
const fs = require("node:fs");
const { scoreLead, slugify } = require("./lib/leads");
const { detectBusinessType } = require("./lib/businessTypes");

function run(opportunities, outputDir) {
  const scored = opportunities
    .map((lead) => {
      const businessType = detectBusinessType(lead.sector);
      const { score, tier, reasons } = scoreLead(lead, businessType);
      return { ...lead, slug: slugify(lead.name), businessType, score, tier, reasons };
    })
    .sort((a, b) => b.score - a.score);

  fs.mkdirSync(outputDir, { recursive: true });
  const outFile = path.join(outputDir, "03-scored.json");
  fs.writeFileSync(outFile, JSON.stringify(scored, null, 2));
  return { scored, outFile };
}

if (require.main === module) {
  const outputDir = path.join(__dirname, "output");
  const opportunities = JSON.parse(
    fs.readFileSync(path.join(outputDir, "02-opportunities.json"), "utf-8")
  );
  const { scored, outFile } = run(opportunities, outputDir);
  const hot = scored.filter((l) => l.tier === "Hot").length;
  const warm = scored.filter((l) => l.tier === "Warm").length;
  console.log(
    `✓ ${scored.length} oportunidades classificadas — ${hot} Hot, ${warm} Warm, ${
      scored.length - hot - warm
    } Cold`
  );
  console.log(`  → ${path.relative(process.cwd(), outFile)}`);
}

module.exports = { run };
