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
const assetPattern = /["']((?:sprites|sounds)\/[^"']+\.(?:png|svg|json|mp3))["']/g;
for (const source of sources) {
  const contents = fs.readFileSync(path.join(root, source), "utf8");
  for (const match of contents.matchAll(assetPattern)) references.add(match[1]);
}

const missing = [];
const css = fs.readFileSync(path.join(root, "css/game.css"), "utf8");
for (const match of css.matchAll(/url\(['"]?([^'"\)]+\.woff2)['"]?\)/g)) {
  const reference = path.join("css", match[1]);
  references.add(reference);
  const absolute = path.join(root, reference);
  if (fs.existsSync(absolute) && fs.readFileSync(absolute).subarray(0, 4).toString() !== "wOF2") {
    missing.push(reference + " (invalid WOFF2 font)");
  }
}
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
