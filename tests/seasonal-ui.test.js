const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Context = require('../js/game/SeasonalContext.js');

test('season badge follows the run date, refreshes its icon and disposes cleanly', () => {
  const children = [];
  const context = {WBWWBSeasonalContext:Context,Game:{date:new Date(2026,11,20,12)},document:{
    getElementById:()=>({appendChild:el=>children.push(el)}),
    createElement:()=>({setAttribute(){},remove(){children.splice(children.indexOf(this),1);}})
  }};
  vm.runInNewContext(fs.readFileSync('js/game/SeasonalUI.js','utf8'),context);
  const ui=new context.SeasonalUI();
  ui.init();
  assert.equal(children.length,1);
  assert.equal(children[0].className,'seasonal-winter');
  const winter=children[0].innerHTML;
  ui.render(new Date(2026,6,10,12));
  assert.equal(children.length,1);
  assert.equal(children[0].className,'seasonal-summer');
  assert.notEqual(children[0].innerHTML,winter);
  ui.destroy();ui.destroy();
  assert.equal(children.length,0);
  ui.init();
  assert.equal(children.length,1);
});
