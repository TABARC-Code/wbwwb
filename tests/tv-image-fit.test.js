// Author: TABARC-Code
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function fixture(displayScale = 1) {
  class Container {
    constructor() { this.children = []; this.scale = {x: 1, y: 1}; }
    addChild(child) { this.children.push(child); return child; }
    removeChildren() { this.children.length = 0; }
  }
  class Sprite extends Container {
    constructor(texture) { super(); this.texture = texture; this.anchor = {x: 0, y: 0}; this.x = 0; this.y = 0; }
  }
  const tween = {to() { return this; }};
  const context = {
    Game: {width: 960, height: 540, addToManifest() {}},
    Camera: {WIDTH: 240, HEIGHT: 135},
    PIXI: {Container, Sprite, Text: Container, loader: {resources: {tv: {texture: {width: 300, height: 360}}}}},
    MakeSprite: function () { return new Sprite({width: 1920, height: 1080}); },
    Tween_get: () => tween, _s: n => n, Ease: {}
  };
  vm.runInNewContext(fs.readFileSync('js/game/TV.js', 'utf8'), context);
  const tv = new context.TV({}, {displayScale});
  return {tv, screen: tv.graphics.children[1]};
}

test('every bulletin illustration stays inside the TV screen without distortion', () => {
  const paths = ['sprites/news', 'sprites/scandals'].flatMap(dir =>
    fs.readdirSync(dir).filter(name => name.endsWith('.svg')).map(name => `${dir}/${name}`));
  for (const path of paths) {
    const svg = fs.readFileSync(path, 'utf8');
    const width = Number(/\bwidth="(\d+)"/.exec(svg)[1]);
    const height = Number(/\bheight="(\d+)"/.exec(svg)[1]);
    for (const displayScale of [1, 0.65]) {
      const {tv, screen} = fixture(displayScale);
      tv.placePhoto({photo: {width, height}, nothing: true});
      const photo = screen.children[0];
      const right = photo.x + width * photo.scale.x;
      const bottom = photo.y + height * photo.scale.y;
      assert.ok(photo.x >= 0 && photo.y >= 0 && right <= 240.00001 && bottom <= 135.00001,
        `${path} spills outside its screen at display scale ${displayScale}`);
      assert.equal(photo.scale.x, photo.scale.y, `${path} is stretched`);
      assert.ok(Math.abs(photo.x + right - 240) < 0.00001, `${path} is not centred horizontally`);
      assert.ok(Math.abs(photo.y + bottom - 135) < 0.00001, `${path} is not centred vertically`);
    }
  }
});

test('camera photographs keep their original framing when a bulletin is replaced', () => {
  const {tv, screen} = fixture();
  tv.placePhoto({photo: {width: 320, height: 180}, nothing: true});
  const texture = {width: 240, height: 135};
  tv.placePhoto({photo: texture, nothing: true});
  const photo = screen.children[0];
  assert.equal(screen.children.length, 2);
  assert.equal(photo.texture, texture);
  assert.equal(photo.scale.x, 1);
  assert.equal(photo.scale.y, 1);
  assert.equal(photo.x, 0);
  assert.equal(photo.y, 0);
});
