import { chromium } from "playwright";

const target = process.env.WBWWB_TEST_URL || "http://127.0.0.1:4173/?lang=en&seed=browser-smoke&date=2026-12-20";
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
    simulationDate: window.Game.date?.toISOString().slice(0, 10),
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
  if (result.simulationDate !== "2026-12-20") failures.push(`date mismatch: ${result.simulationDate}`);
  if (result.assetError) failures.push(`asset error: ${result.assetError}`);
  if (result.scenario !== "canonical") failures.push(`expected canonical scenario; found ${result.scenario}`);
  for (const mode of ["canonical", "attention", "cricket"]) {
    if (!result.scenarioOptions.includes(mode)) failures.push(`missing scenario option: ${mode}`);
  }
  if (!result.shadowTV) failures.push("shadow TV module did not load");
  else if (result.shadowTV.visible !== false) failures.push("shadow TV should remain headless");

  await page.waitForFunction(() => window.Game?.sounds?.bg_park?.state?.() === "loaded", null, { timeout: 60_000 });
  const shadowResult = await page.evaluate(() => {
    Game.sceneManager.gotoScene("Game");
    const scene = Game.scene;
    const beforeClasses = scene.world.peeps.map((peep) => peep._CLASS_);
    scene.shadowTV.receiveBroadcast({
      scene,
      headline: "CHRISTMAS SHOPPING BEGINS",
      photo: PIXI.Texture.WHITE,
      entry: { sequence: 3, audience: 4, seed: Game.seed },
      data: {}
    });
    const latest = scene.shadowTV.latest();
    return {
      displayCount: scene.world.props.filter((prop) => prop._CLASS_ === "ShadowTVDisplay").length,
      tvCount: scene.world.props.filter((prop) => prop._CLASS_ === "TV" || prop._CLASS_ === "ShadowTVDisplay").length,
      strategy: latest?.framingStrategy,
      season: latest?.season?.event,
      influenced: scene.world.peeps.filter((peep) => peep.shadowInfluence).length,
      classesPreserved: beforeClasses.every((name, index) => scene.world.peeps[index]?._CLASS_ === name)
    };
  });
  if (shadowResult.displayCount !== 2) failures.push(`expected two shadow displays; found ${shadowResult.displayCount}`);
  if (shadowResult.tvCount !== 3) failures.push(`expected three televisions; found ${shadowResult.tvCount}`);
  if (shadowResult.strategy !== "seasonal-frame-substitution") failures.push(`seasonal strategy missing: ${shadowResult.strategy}`);
  if (shadowResult.season !== "christmas") failures.push(`expected Christmas context; found ${shadowResult.season}`);
  if (!shadowResult.influenced) failures.push("a real shadow broadcast influenced nobody");
  if (!shadowResult.classesPreserved) failures.push("canonical peep classes changed after a shadow broadcast");

  if (failures.length) throw new Error(failures.join("\n"));
  console.log(`Browser smoke passed: ${result.scene}, locale ${result.locale}, seed ${result.seed}.`);
} finally {
  await browser.close();
}
