// Author: TABARC-Code
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';

const browser = await chromium.launch({headless: true});
const output = process.env.WBWWB_SCREENSHOT_DIR;
if (output) await mkdir(output, {recursive: true});
const viewports = [
  {width: 320, height: 568}, {width: 375, height: 667},
  {width: 812, height: 375}, {width: 1280, height: 720}
];
try {
  for (const locale of ['en', 'de', 'es', 'fa', 'pt', 'tr']) {
    const page = await browser.newPage({viewport: viewports[3]});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = new URL(process.env.WBWWB_TEST_URL || 'http://127.0.0.1:4173/');
    url.search = new URLSearchParams({lang: locale, seed: 'layout-audit', date: '2026-12-20'}).toString();
    await page.goto(url.href, {waitUntil: 'networkidle'});
    await page.waitForFunction(() => window.Game?.assetsReady || window.Game?.assetError);
    await page.evaluate(() => {Game.stop(); Game.paused = false; return document.fonts.ready;});
    assert.equal(await page.evaluate(() => Game.assetError?.message || null), null);
    assert.equal(await page.evaluate(() => WBWWB_LOCALE), locale, 'URL language was ignored');
    async function screenshot(label) {
      if (output) await page.screenshot({path: join(output, `${locale}-${label}.png`)});
    }
    await screenshot('preloader');
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const clipped = await page.evaluate(() => {
        return [...document.querySelectorAll('#game-controls, #game-controls select, #sound-toggle')]
          .filter(element => {const r = element.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1;})
          .map(element => element.id);
      });
      assert.deepEqual(clipped, [], `${locale}: controls leave the viewport at ${viewport.width}`);
      await page.evaluate(() => window.dispatchEvent(new Event('blur')));
      const pauseFits = await page.locator('#paused').evaluate(element => {
        const r = element.getBoundingClientRect();
        return r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight &&
          element.scrollWidth <= element.clientWidth && element.scrollHeight <= element.clientHeight;
      });
      assert.ok(pauseFits, `${locale}: pause screen is clipped at ${viewport.width}`);
      await screenshot(`pause-${viewport.width}`);
      await page.locator('#paused').click();
    }
    await page.setViewportSize(viewports[3]);
    for (const [scene, ticks] of [['Quote', 580], ['Credits', 320], ['Post_Post_Credits', 180]]) {
      await page.evaluate(({scene, ticks}) => {
        Game.sceneManager.gotoScene(scene);
        for (let i = 0; i < ticks; i++) Game.update(1000 / 60);
        Game.render();
      }, {scene, ticks});
      await screenshot(scene);
      if (scene === 'Credits') {
        for (let card = 1; card <= 8; card++) {
          await page.evaluate(card => {
            const cards = Game.stage.children[0].children;
            cards.forEach((item, index) => { item.alpha = index === card - 1 ? 1 : 0; });
            Game.render();
          }, card);
          await screenshot(`credits-card-${card}`);
        }
      }
    }
    assert.ok(await page.evaluate(() => {
      const Original = PIXI.RenderTexture;
      const textures = [];
      PIXI.RenderTexture = function (...args) {
        const texture = new Original(...args); textures.push(texture); return texture;
      };
      try { Game.sceneManager.gotoScene('Meta'); }
      finally { PIXI.RenderTexture = Original; }
      for (let i = 0; i < 120; i++) Game.update(1000 / 60);
      Game.render();
      Game.sceneManager.gotoScene('Game');
      return textures.length === 2 && textures.every(texture => texture.destroyed);
    }), `${locale}: promotional scene retained its render textures`);
    const headlineFailures = await page.evaluate(() => {
      Game.sceneManager.gotoScene('Game');
      const tv = Game.scene.tv;
      function strings(value) {
        if (typeof value === 'string') return [value];
        return value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
      }
      const words = [...strings(textStrings),
        ...strings(WBWWBFloodFramingEngine.catalogue[WBWWB_LOCALE]),
        ...strings(WBWWBShortageFramingEngine.catalogue[WBWWB_LOCALE]),
        ...strings(WBWWBSeasonalNewsEngine.catalogue[WBWWB_LOCALE])];
      const failures = [];
      let previous;
      for (const word of words) {
        tv.placePhoto({photo: PIXI.loader.resources.flood_actual.texture, text: word});
        if (previous && !previous.destroyed) failures.push('replaced picture remains alive');
        const screen = tv.graphics.children[1];
        previous = screen.children[0];
        const caption = screen.children[1].children[1];
        if (caption.x + caption.width > Camera.WIDTH - 14 || caption.height > 26.01) failures.push(word);
      }
      tv.placePhoto({photo: PIXI.loader.resources.flood_actual.texture, text: textStrings.niceHat});
      if (tv.graphics.children[1].children[1].children[1].height < 14) failures.push('short headline is unnecessarily small');
      Game.scene.shadowTV.receiveBroadcast({scene: Game.scene, photo: PIXI.loader.resources.flood_actual.texture,
        headline: 'FLOODING CUTS OFF HOMES', story: {event: 'flood', capturedSeverity: 'representative'}, data: {}, entry: {audience: 4}});
      for (let i = 0; i < 90; i++) Game.update(1000 / 60);
      Game.render();
      return failures;
    });
    assert.deepEqual(headlineFailures, [], `${locale}: bulletin content overflows or leaks`);
    await screenshot('bulletins');
    await page.setViewportSize(viewports[1]);
    await page.evaluate(() => {
      Game.scene.agencyPanel.offer({views: ['A longer bulletin for the first outlet', 'A longer bulletin for the second outlet']});
    });
    await screenshot('phone-agency');
    assert.deepEqual(errors, [], `${locale}: browser errors`);
    console.log(`Layout passed: ${locale}, four viewports, scene cards and bulletin bounds.`);
    await page.close();
  }
} finally {
  await browser.close();
}
