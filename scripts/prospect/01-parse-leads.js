#!/usr/bin/env node
"use strict";

const path = require("node:path");
const fs = require("node:fs");
const { parseCSVFile } = require("./lib/csv");

function run(inputPath, outputDir) {
  const leads = parseCSVFile(inputPath);
  fs.mkdirSync(outputDir, { recursive: true });
  const outFile = path.join(outputDir, "01-leads.json");
  fs.writeFileSync(outFile, JSON.stringify(leads, null, 2));
  return { leads, outFile };
}

if (require.main === module) {
  const inputPath = process.argv[2] || path.join(__dirname, "sample-leads.csv");
  const outputDir = path.join(__dirname, "output");
  const { leads, outFile } = run(inputPath, outputDir);
  console.log(`✓ ${leads.length} leads lidos de ${path.relative(process.cwd(), inputPath)}`);
  console.log(`  → ${path.relative(process.cwd(), outFile)}`);
}

module.exports = { run };
