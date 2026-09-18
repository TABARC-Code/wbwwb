#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const sourceRoots = ["js/core", "js/game", "js/misc", "js/peeps", "js/scenes"];
const sources = [];

function walk(relative) {
  const absolute = path.join(root, relative);
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) walk(child);
    else if (entry.isFile() && child.endsWith(".js")) sources.push(child);
  }
}

sourceRoots.forEach(walk);

const references = new Set();
const assetPattern = /["']((?:sprites|sounds)\/[^"']+\.(?:png|json|mp3))["']/g;
for (const source of sources) {
  const contents = fs.readFileSync(path.join(root, source), "utf8");
  for (const match of contents.matchAll(assetPattern)) references.add(match[1]);
}

const missing = [];
for (const reference of references) {
  if (!fs.existsSync(path.join(root, reference))) missing.push(reference);
  if (reference.endsWith(".mp3")) {
    const stem = reference.slice(0, -4);
    const alternatives = [".opus", ".m4a", ".mp3"].filter((extension) =>
      fs.existsSync(path.join(root, stem + extension))
    );
    if (!alternatives.length) missing.push(reference + " (no playable format)");
  }
}

if (missing.length) {
  console.error("Asset audit failed:\n" + missing.map((item) => "  - " + item).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Asset audit passed: ${references.size} manifest references resolve.`);
}
