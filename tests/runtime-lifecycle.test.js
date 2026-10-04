const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function load(context, path) { vm.runInNewContext(fs.readFileSync(path, 'utf8'), context); }
function loaderWith(loadAsset) {
  class Container {}
  const context = { setTimeout, clearTimeout, PIXI: {
    Container, Assets: { load: loadAsset }, RenderTexture: {}, Text: class {}
  } };
  context.window = context;
  load(context, 'js/lib/pixi-compat.js');
  return context.PIXI.loader;
}

test('asset loading overlaps requests, stays bounded and waits for every resource', async () => {
  let active = 0, maximum = 0;
  const loader = loaderWith(async src => {
    maximum = Math.max(maximum, ++active);
    await new Promise(resolve => setTimeout(resolve, 5));
    active--;
    return { src };
  });
  for (let i = 0; i < 9; i++) loader.add('image' + i, 'image' + i + '.png');
  await loader.load();
  assert.equal(maximum, 4);
  assert.equal(Object.keys(loader.resources).length, 9);
  assert.equal(active, 0);
});

test('a stalled required image rejects with its URL and never completes successfully', async () => {
  const loader = loaderWith(() => new Promise(() => {}));
  loader.timeoutMs = 10;
  loader.add('broken', 'broken.png');
  let completed = false;
  await assert.rejects(loader.load(() => { completed = true; }), /timed out: broken.png/);
  assert.equal(completed, false);
});

function gameWithAudio(mode) {
  const context = { setTimeout, clearTimeout, console: { warn() {}, error() {} },
    document: { getElementById: () => ({ style: {} }) }, addEventListener() {},
    WBWWBFixedStepClock: class {}, WBWWBEditorialLedger: class {},
    PIXI: { loader: { add() {}, load: () => Promise.resolve() } },
    Howl: class {
      constructor() { this.events = {}; this.unloaded = false; }
      state() { return mode === 'cached' ? 'loaded' : 'loading'; }
      once(name, fn) { this.events[name] = fn; }
      off(name) { delete this.events[name]; }
      unload() { this.unloaded = true; }
    }
  };
  context.window = context;
  load(context, 'js/core/Game.js');
  context.Game.assetTimeoutMs = 10;
  context.Game.manifest = { music: 'music.mp3' };
  return context.Game;
}

test('audio that never settles falls back to ready silent play and removes listeners', async () => {
  const game = gameWithAudio('stalled');
  await new Promise(resolve => game.loadAssets(resolve));
  assert.equal(game.assetsReady, true);
  assert.equal(game.audioWarnings.length, 1);
  assert.equal(game.sounds.music.unloaded, true);
  assert.equal(Object.keys(game.sounds.music.events).length, 0);
});

test('already-loaded audio does not wait for a load event that has already fired', async () => {
  const game = gameWithAudio('cached');
  await new Promise(resolve => game.loadAssets(resolve));
  assert.equal(game.assetsReady, true);
  assert.equal(game.audioWarnings.length, 0);
});

test('an old agency result cannot hide a new offer or retain a departed scene listener', () => {
  const handlers = new Set(), timers = new Map(); let timerId = 0;
  const root = { hidden: true, querySelector() {}, addEventListener(_, fn) { handlers.add(fn); },
    removeEventListener(_, fn) { handlers.delete(fn); } };
  const elements = { 'agency-panel': root, 'agency-views': { appendChild() {} }, 'agency-status': {} };
  const context = { document: { getElementById: id => elements[id], createElement: () => ({}) },
    setTimeout(fn) { timers.set(++timerId, fn); return timerId; }, clearTimeout(id) { timers.delete(id); } };
  context.window = context;
  load(context, 'js/ui/AgencyPanel.js');
  const panel = new context.WBWWBAgencyPanel({ snapshot: () => ({}) });
  panel.renderResult({ summary: 'First story' });
  assert.equal(timers.size, 1);
  panel.offer({ views: ['Next story'] });
  assert.equal(timers.size, 0);
  assert.equal(root.hidden, false);
  panel.renderResult({ summary: 'Next result' });
  panel.dispose();
  assert.equal(timers.size, 0);
  assert.equal(handlers.size, 0);
  assert.equal(root.hidden, true);
});

test('a camera click captures its own coordinates without a preceding move', () => {
  function Container() { this.scale = {}; this.children = []; this.addChild = x => this.children.push(x); }
  function Sprite() { this.scale = {}; this.anchor = {}; }
  const context = { Game: { width: 960, height: 540, stage: {}, addToManifest() {}, sounds: {} },
    PIXI: { Container, Sprite, RenderTexture: function () {}, loader: { resources: { cam_frame: {}, cam_flash: {} } } } };
  load(context, 'js/game/Camera.js');
  const scene = { graphics: new Container(), director: { takePhoto() {} } };
  const camera = new context.Camera(scene, { noIntro: true });
  camera.noSounds = true;
  let captured;
  camera.takePhoto = () => { captured = [camera.x, camera.y]; };
  context.Game.stage.mousedown({ data: { global: { x: 240, y: 180 } } });
  assert.deepEqual(captured, [240, 180]);
});
