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
  let destroyed = 0, dispose;
  const context = { Game: { width: 960, height: 540, stage: {}, addToManifest() {}, sounds: {} },
    PIXI: { Container, Sprite, RenderTexture: function () { this.destroy = () => { destroyed++; }; }, loader: { resources: { cam_frame: {}, cam_flash: {} } } } };
  load(context, 'js/game/Camera.js');
  const scene = { graphics: new Container(), director: { takePhoto() {} }, onDispose(fn) { dispose = fn; } };
  const camera = new context.Camera(scene, { noIntro: true });
  camera.noSounds = true;
  let captured;
  camera.takePhoto = () => { captured = [camera.x, camera.y]; };
  context.Game.stage.mousedown({ data: { global: { x: 240, y: 180 } } });
  assert.deepEqual(captured, [240, 180]);
  dispose();
  assert.equal(destroyed, 2);
});

test('scene changes cancel old tweens before destroying their display targets', () => {
  const order = [];
  const context = { Game: { scene: { kill() { order.push('kill'); }, dispose() { order.push('dispose'); } },
    stage: { removeAllListeners() {}, removeChildren() { return [{ destroy() { order.push('destroy'); } }]; } } },
    Tween: { removeAllTweens() { order.push('cancel tweens'); } },
    Scene_Next: function () { order.push('new scene'); } };
  context.window = context;
  load(context, 'js/core/SceneManager.js');
  const manager = new context.SceneManager();
  assert.throws(() => manager.gotoScene('Missing'), /Unknown scene/);
  assert.equal(order.length, 0);
  manager.gotoScene('Next');
  assert.deepEqual(order, ['kill', 'dispose', 'cancel tweens', 'destroy', 'new scene']);
});

test('resuming after focus loss preserves the player mute choice', () => {
  const elements = { modal_shade: { style: {} }, paused: { style: {} } };
  let mute;
  const context = { document: { getElementById: id => elements[id] }, addEventListener() {},
    WBWWBFixedStepClock: class { reset() {} }, WBWWBEditorialLedger: class {},
    Howler: { mute(value) { mute = value; } } };
  context.window = context;
  load(context, 'js/core/Game.js');
  context.Game.soundMuted = true;
  elements.paused.onclick();
  assert.equal(mute, true);
  context.Game.soundMuted = false;
  elements.paused.onclick();
  assert.equal(mute, false);
});

test('the final zoom stops updating graphics after its scene is destroyed', () => {
  let shakeUpdates = 0;
  const noOp = function () {};
  const context = {
    PIXI: {Container: class { constructor(){this.scale={x:1,y:1};} }},
    Game: {stage:{addChild:noOp,removeChild:noOp},width:960,height:540},
    Scene: function(){this.onDispose=noOp;},
    World: function(){this.peeps=[];this.addProp=noOp;this.update=noOp;},
    Camera: function(){this.update=noOp;}, Director: function(){this.update=noOp;},
    TV: function(){}, ShadowTV: function(){this.attachDisplays=noOp;this.update=noOp;},
    WBWWBIdeologicalAudienceModel: function(){this.seed=noOp;this.update=noOp;},
    WBWWBPlayerAgency:{Model:function(){}}, WBWWBAgencyPanel:function(){},
    ScreenShake:function(){this.update=()=>shakeUpdates++;},
    ScreenZoomOut:function(scene){
      this.timer=this.fullTimer=1; this.fixLaptop=noOp;
      this.update=()=>{if(this.finish){scene.graphics.destroyed=true;scene.graphics.scale=null;context.Game.scene={};}};
    },
    MakeSprite:()=>({}), Tween_get:()=>({to(){return this;},call(){return this;}}),
    _s:x=>x, BEAT:1, Ease:{quadInOut:noOp}, Stage_Start:noOp, Stage_Hat:noOp
  };
  load(context,'js/scenes/Scene_Game.js');
  const scene = new context.Scene_Game();
  context.Game.scene=scene;
  scene.update();
  assert.equal(shakeUpdates,1);
  scene.zoomer.finish=true;
  assert.doesNotThrow(()=>scene.update());
  assert.equal(shakeUpdates,1);
  assert.notEqual(context.Game.scene,scene);
});
