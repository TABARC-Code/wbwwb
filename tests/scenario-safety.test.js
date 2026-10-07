const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function cricket() {
  let definition;
  const context = {WBWWBScenarioManager:{register:d=>definition=d},
    Game:{random:()=>0},NormalPeep:function(){this._CLASS_='NormalPeep';},
    document:{getElementById:()=>null}};
  context.window=context;
  vm.runInNewContext(fs.readFileSync('js/scenarios/CricketScenario.js','utf8'),context);
  return definition.create();
}
function scene(classes, scripted=true) {
  const result={world:{peeps:classes.map(_CLASS_=>({_CLASS_}))}};
  if(scripted) result.director={callbacks:{}};
  result.world.replacePeep=(old,next)=>{result.world.peeps.splice(result.world.peeps.indexOf(old),1,next);return next;};
  return result;
}
test('cricket calming cannot remove the nervous story actor or sole anger source',()=>{
  for(const name of ['NervousPeep','AngryPeep']) {
    const s=scene([name,'NormalPeep']);
    assert.equal(cricket().calmOne(s),false);
    assert.equal(s.world.peeps[0]._CLASS_,name);
  }
});
test('cricket calming still converts surplus anger and sandbox nervous people',()=>{
  const s=scene(['NervousPeep','AngryPeep','AngryPeep']);
  assert.equal(cricket().calmOne(s),true);
  assert.equal(s.world.peeps.filter(p=>p._CLASS_==='AngryPeep').length,1);
  assert.equal(s.world.peeps[0]._CLASS_,'NervousPeep');
  const sandbox=scene(['NervousPeep'],false);
  assert.equal(cricket().calmOne(sandbox),true);
});
test('influence transformations preserve authored cast but allow generated crowd changes',()=>{
  const context={};context.window=context;
  context.AngryPeep=function(){this._CLASS_='AngryPeep';};
  context.NervousPeep=function(){this._CLASS_='NervousPeep';};
  vm.runInNewContext(fs.readFileSync('js/game/ShadowAudienceModel.js','utf8'),context);
  const Model=context.WBWWBShadowAudienceModel;
  const model=new Model({allowTransform:true});
  for(const name of ['HatPeep','LoverPeep','InfluencerPeep','CrazyPeep','NervousPeep','SnobbyPeep','HappyWeirdoPeep','EvilHatPeep','PanicPeep']) {
    const s=scene([name]);const p=s.world.peeps[0];
    p.shadowInfluence={phase:'active',anger:1,behaviour:'agitating'};
    assert.equal(model.maybeTransform(s,p),p,name);
  }
  const s=scene(['NormalPeep']);const p=s.world.peeps[0];
  p.shadowInfluence={phase:'active',fear:1,behaviour:'avoiding'};
  const nervous=model.maybeTransform(s,p);
  assert.equal(nervous._CLASS_,'NervousPeep');
  nervous.shadowInfluence.behaviour='agitating';
  assert.equal(model.maybeTransform(s,nervous)._CLASS_,'AngryPeep');
});
