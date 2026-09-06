import { chromium } from "playwright";

const target = process.env.WBWWB_TEST_URL || "http://127.0.0.1:4173/?lang=en&seed=browser-smoke";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const failures = [];

page.on("pageerror", (error) => failures.push(`page error: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") failures.push(`console error: ${message.text()}`);
});
page.on("requestfailed", (request) => {
  failures.push(`request failed: ${request.url()} — ${request.failure()?.errorText || "unknown"}`);
});

try {
  const response = await page.goto(target, { waitUntil: "networkidle", timeout: 60_000 });
  if (!response?.ok()) throw new Error(`HTTP ${response?.status() || "no response"}`);

  await page.waitForFunction(() => window.Game?.scene && document.querySelector("#stage canvas"), null, { timeout: 60_000 });
  const result = await page.evaluate(() => ({
    canvasCount: document.querySelectorAll("#stage canvas").length,
    warningVisible: getComputedStyle(document.querySelector("#warning")).display !== "none",
    locale: window.WBWWB_LOCALE,
    seed: window.Game.seed,
    scene: window.Game.scene?.constructor?.name || "anonymous",
    assetError: window.Game.assetError?.message || null,
    scenario: window.Game.scenarios?.id,
    scenarioOptions: Array.from(document.querySelectorAll("#scenario-select option")).map((option) => option.value),
    shadowTV: typeof window.ShadowTV === "function" ? (() => {
      const shadow = new window.ShadowTV();
      return { visible: shadow.visible, historyLength: shadow.history.length };
    })() : null
  }));

  if (result.canvasCount !== 1) failures.push(`expected one canvas; found ${result.canvasCount}`);
  if (result.warningVisible) failures.push("warning overlay is visible");
  if (result.locale !== "en") failures.push(`expected en locale; found ${result.locale}`);
  if (result.seed !== "browser-smoke") failures.push(`seed mismatch: ${result.seed}`);
  if (result.assetError) failures.push(`asset error: ${result.assetError}`);
  if (result.scenario !== "canonical") failures.push(`expected canonical scenario; found ${result.scenario}`);
  for (const mode of ["canonical", "attention", "cricket"]) {
    if (!result.scenarioOptions.includes(mode)) failures.push(`missing scenario option: ${mode}`);
  }
  if (!result.shadowTV) failures.push("shadow TV module did not load");
  else if (result.shadowTV.visible !== false) failures.push("shadow TV should remain headless");

  if (failures.length) throw new Error(failures.join("\n"));
  console.log(`Browser smoke passed: ${result.scene}, locale ${result.locale}, seed ${result.seed}.`);
} finally {
  await browser.close();
}
