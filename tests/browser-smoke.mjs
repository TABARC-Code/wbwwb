import { chromium } from "playwright";

const target = process.env.WBWWB_TEST_URL || "http://127.0.0.1:4173/?lang=en&seed=browser-smoke&date=2026-12-20";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ hasTouch: true, viewport: { width: 1280, height: 720 } });
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
    })() : null,
    influencerModules: typeof window.InfluencerPeep === "function" &&
      typeof window.Stage_CloutAntics === "function" &&
      typeof window.Stage_SportsAlliance === "function" &&
      typeof window.Stage_FloodFraming === "function" &&
      typeof window.FloodEvidenceProp === "function" &&
      typeof window.WBWWBFloodFramingEngine?.create === "function" &&
      typeof window.WBWWBShortageFramingEngine?.create === "function" &&
      typeof window.WBWWBToyPanicEngine?.create === "function" &&
      typeof window.Stage_PetCraze === "function" &&
      typeof window.PetEvidenceProp === "function" &&
      typeof window.WBWWBPetCrazeEngine?.create === "function" &&
      typeof window.WBWWBInfluencerNewsEngine?.create === "function",
    agencyModules: typeof window.WBWWBPlayerAgency?.Model === "function" &&
      typeof window.WBWWBAgencyPanel === "function" &&
      Boolean(document.querySelector("#agency-panel [data-agency-action='repair']"))
  }));

  if (result.canvasCount !== 1) failures.push(`expected one canvas; found ${result.canvasCount}`);
  if (result.warningVisible) failures.push("warning overlay is visible");
  if (result.locale !== "en") failures.push(`expected en locale; found ${result.locale}`);
  if (result.seed !== "browser-smoke") failures.push(`seed mismatch: ${result.seed}`);
  if (result.simulationDate !== "2026-12-20") failures.push(`date mismatch: ${result.simulationDate}`);
  if (result.assetError) failures.push(`asset error: ${result.assetError}`);
  if (result.scenario !== "canonical") failures.push(`expected canonical scenario; found ${result.scenario}`);
  for (const mode of ["canonical", "attention", "cricket", "influence"]) {
    if (!result.scenarioOptions.includes(mode)) failures.push(`missing scenario option: ${mode}`);
  }
  if (!result.shadowTV) failures.push("shadow TV module did not load");
  else if (result.shadowTV.visible !== false) failures.push("shadow TV should remain headless");
  if (!result.influencerModules) failures.push("influencer acts or news engine did not load");
  if (!result.agencyModules) failures.push("player agency model or controls did not load");

  await page.waitForFunction(() => {
    if (window.Game?.assetError) return true;
    return window.Game?.assetsReady === true;
  }, null, { timeout: 60_000 });
  const assetFailure = await page.evaluate(() => window.Game?.assetError?.message || null);
  if (assetFailure) failures.push(`asset error: ${assetFailure}`);
  if (failures.length) throw new Error(failures.join("\n"));
  // Exercise the actual start control, including repeated activation.
  await page.evaluate(() => {
    window.startTransitions = 0;
    const original = Game.sceneManager.gotoScene;
    Game.sceneManager.gotoScene = function (name) {
      if (name === "Quote") window.startTransitions++;
      return original(name);
    };
    const button = Game.stage.children.find(child => child.x === 278 && child.y === 250);
    if (!button?.mousedown) throw new Error("Start control is not ready");
    button.mousedown({ global: { x: 278, y: 250 } });
    button.mousedown({ global: { x: 278, y: 250 } });
  });
  await page.waitForTimeout(350);
  if (await page.evaluate(() => window.startTransitions) !== 1) failures.push("repeated Start scheduled multiple scene transitions");

  const shadowResult = await page.evaluate(() => {
    Game.sceneManager.gotoScene("Game");
    const scene = Game.scene;
    const beforeClasses = scene.world.peeps.map((peep) => peep._CLASS_);
    const ordinary = scene.shadowTV.receiveBroadcast({
      scene,
      headline: "PEOPLE GATHER IN THE PARK",
      photo: PIXI.Texture.WHITE,
      entry: { sequence: 3, audience: 4, seed: Game.seed },
      story: window.WBWWBCaptureNarrativeEngine.infer({}, "PEOPLE GATHER IN THE PARK"),
      data: {}
    });
    scene.shadowTV.receiveBroadcast({
      scene,
      headline: "CHRISTMAS SHOPPING BEGINS",
      photo: PIXI.Texture.WHITE,
      entry: { sequence: 4, audience: 4, seed: Game.seed },
      story: window.WBWWBCaptureNarrativeEngine.infer({
        capturedPeeps: [{ seasonalHabit: "buying" }]
      }, "CHRISTMAS SHOPPING BEGINS"),
      data: {}
    });
    const latest = scene.shadowTV.latest();
    return {
      displayCount: scene.world.props.filter((prop) => prop._CLASS_ === "ShadowTVDisplay").length,
      tvCount: scene.world.props.filter((prop) => prop._CLASS_ === "TV" || prop._CLASS_ === "ShadowTVDisplay").length,
      strategy: latest?.framingStrategy,
      ordinaryStrategy: ordinary.framingStrategy,
      season: latest?.season?.event,
      influenced: scene.world.peeps.filter((peep) => peep.shadowInfluence).length,
      classesPreserved: beforeClasses.every((name, index) => scene.world.peeps[index]?._CLASS_ === name),
      ideologicalCount: scene.world.peeps.filter((peep) => peep.ideology).length
    };
  });
  if (shadowResult.displayCount !== 2) failures.push(`expected two shadow displays; found ${shadowResult.displayCount}`);
  if (shadowResult.tvCount !== 3) failures.push(`expected three televisions; found ${shadowResult.tvCount}`);
  if (shadowResult.strategy !== "seasonal-frame-substitution") failures.push(`seasonal strategy missing: ${shadowResult.strategy}`);
  if (shadowResult.ordinaryStrategy !== "generic-extreme-framing") failures.push("ordinary evidence was replaced by seasonal news");
  if (shadowResult.season !== "christmas") failures.push(`expected Christmas context; found ${shadowResult.season}`);
  if (!shadowResult.influenced) failures.push("a real shadow broadcast influenced nobody");
  if (!shadowResult.classesPreserved) failures.push("canonical peep classes changed after a shadow broadcast");
  if (shadowResult.ideologicalCount !== 6) failures.push(`expected six ideological variants; found ${shadowResult.ideologicalCount}`);

  // Check real pointer input after CSS scaling, then leave with a capture in flight.
  for (const viewport of [
    { width: 1280, height: 720, touch: false },
    { width: 375, height: 667, touch: true },
    { width: 812, height: 375, touch: true }
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.evaluate(() => {
      Game.sceneManager.gotoScene("Game");
      for (let i = 0; i < 90; i++) Game.update(1000 / 60);
    });
    const bounds = await page.locator("#stage canvas").boundingBox();
    const x = bounds.x + bounds.width * 0.25;
    const y = bounds.y + bounds.height * (190 / 540);
    if (viewport.touch) await page.touchscreen.tap(x, y);
    else await page.mouse.click(x, y);
    const capture = await page.evaluate(() => ({
      x: Game.scene.camera.x, y: Game.scene.camera.y,
      frozen: Game.scene.camera.frozen, hasPhoto: Boolean(Game.scene.camera.photoTexture)
    }));
    if (!capture.frozen || !capture.hasPhoto || Math.abs(capture.x - 240) > 2 || Math.abs(capture.y - 190) > 2) {
      failures.push(`camera input failed at ${viewport.width}x${viewport.height}: ${JSON.stringify(capture)}`);
    }
  }
  await page.evaluate(() => {
    Game.sceneManager.gotoScene("Post_Credits");
    for (let i = 0; i < 90; i++) Game.update(1000 / 60);
    Game.sceneManager.gotoScene("Post_Post_Credits");
    for (let i = 0; i < 90; i++) Game.update(1000 / 60);
    Game.sceneManager.gotoScene("Quote");
    for (let i = 0; i < 1200; i++) Game.update(1000 / 60);
  });
  await page.locator("#sound-toggle").click();
  const staysMuted = await page.evaluate(() => {
    window.dispatchEvent(new Event("blur"));
    document.querySelector("#paused").click();
    return Game.soundMuted && Howler._muted;
  });
  if (!staysMuted) failures.push("pause/resume overrode the sound-off choice");
  await page.waitForTimeout(100);

  if (failures.length) throw new Error(failures.join("\n"));
  console.log(`Browser smoke passed: ${result.scene}, locale ${result.locale}, seed ${result.seed}.`);
} catch (error) {
  const diagnostics = await page.evaluate(() => ({
    assetError: window.Game?.assetError?.message || null,
    pending: Object.entries(window.Game?.manifest || {}).filter(([key, src]) =>
      /\.mp3(?:\?|#|$)/i.test(src)
        ? window.Game.sounds[key]?.state?.() !== "loaded"
        : !window.PIXI?.loader?.resources[key]
    ).map(([key, src]) => ({ key, src, soundState: window.Game.sounds[key]?.state?.() })),
    audioWarnings: window.Game?.audioWarnings || []
  })).catch(() => null);
  console.error(JSON.stringify({ failures, diagnostics }, null, 2));
  throw error;
} finally {
  await browser.close();
}
