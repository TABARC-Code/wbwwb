const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function director(peeps) {
  const context={Game:{addToManifest(){},random:()=>0.5,randomSource:{shuffle:a=>a}}};
  vm.runInNewContext(fs.readFileSync('js/game/Director.js','utf8'),context);
  const instance=new context.Director({world:{peeps}});
  instance.tv={x:480,y:270};instance.photoData={audience:3};return instance;
}
function ordinary(){return {_CLASS_:'NormalPeep',type:'circle',getOuttaTV(){},watchTV(){this.isWatching=true;}};}
test('audience result is false when a positive request seats nobody',()=>{
  assert.equal(director([{_CLASS_:'NervousPeep'}]).audience_cutToTV(),false);
  assert.equal(director([ordinary()]).audience_cutToTV(null,()=>false),false);
});
test('audience result is true for seated viewers and custom viewer actions',()=>{
  const p=ordinary();assert.equal(director([p]).audience_cutToTV(),true);
  assert.equal(p.isWatching,true);
  let called=0;assert.equal(director([ordinary()]).audience_cutToTV(()=>called++),true);
  assert.equal(called,1);
});
