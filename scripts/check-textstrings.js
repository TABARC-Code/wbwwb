// Guards against the exact class of bug fixed in TABARC-Code/wbwwb#2:
// js/textStrings.js defining language blocks (textStrings_EN, textStrings_FA, ...)
// but never assigning the `textStrings` global every scene reads from.

const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "js", "textStrings.js");
const src = fs.readFileSync(file, "utf8");

eval(src); // executed at this scope like a <script> tag, so top-level `var`s land here

if (typeof textStrings === "undefined" || textStrings === null) {
	console.error("FAIL: `textStrings` in js/textStrings.js is never assigned — the game will crash on boot.");
	process.exit(1);
}

const blockNames = [...src.matchAll(/var (textStrings_[A-Z_]+)\s*=\s*\{/g)].map(m => m[1]);
if (blockNames.length === 0) {
	console.error("FAIL: no textStrings_XX language blocks found in js/textStrings.js");
	process.exit(1);
}
if (typeof textStrings_EN === "undefined") {
	console.error("FAIL: textStrings_EN (reference block) is missing");
	process.exit(1);
}

const baseKeys = Object.keys(textStrings_EN).sort();
let ok = true;

for (const name of blockNames) {
	const block = eval(name);
	const keys = Object.keys(block).sort();
	const missing = baseKeys.filter(k => !keys.includes(k));
	const extra = keys.filter(k => !baseKeys.includes(k));
	if (missing.length || extra.length) {
		ok = false;
		console.error(`FAIL: ${name} missing=[${missing.join(", ")}] extra=[${extra.join(", ")}]`);
	}
}

if (!ok) process.exit(1);

console.log(`OK: textStrings resolves (${blockNames.length} language blocks checked, all key sets match textStrings_EN).`);
