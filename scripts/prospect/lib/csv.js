"use strict";

const fs = require("node:fs");

/** Minimal RFC4180-ish CSV parser — handles quoted fields, escaped quotes
 * ("") and CRLF/LF line endings without any external dependency. */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

/** Reads a CSV file and returns an array of objects keyed by the header row. */
function parseCSVFile(filePath) {
  const text = fs.readFileSync(filePath, "utf-8");
  const rows = parseCSV(text);
  const [header, ...dataRows] = rows;

  return dataRows.map((row) => {
    const obj = {};
    header.forEach((key, i) => {
      obj[key.trim()] = (row[i] ?? "").trim();
    });
    return obj;
  });
}

module.exports = { parseCSV, parseCSVFile };
