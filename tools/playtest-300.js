#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {run} = require('./playtest-309.js');
const audienceSource = fs.readFileSync('js/game/ShadowAudienceModel.js','utf8');
const directorSource = fs.readFileSync('js/game/Director.js','utf8');

// The story scripts run with headless actors here. Rendering and human pacing
// need separate browser and device checks; these fixtures cannot stand in for them.
function boundary(seed, profile) {
  function peep(name, type) {
    return {_CLASS_:name,type,x:0,y:0,getOuttaTV(){this.isWatching=false;},watchTV(){this.isWatching=true;}};
  }
  const context = {Game:{addToManifest(){},random:()=>0.5,randomSource:{shuffle:a=>a}},
    AngryPeep:function(_scene,type){Object.assign(this,peep('AngryPeep',type));},
    NormalPeep:function(){Object.assign(this,peep('NormalPeep','circle'));},
    NervousPeep:function(){Object.assign(this,peep('NervousPeep','circle'));}};
  context.window=context;
  vm.runInNewContext(audienceSource,context);
  vm.runInNewContext(directorSource,context);
  const count=12+seed%37;
  const scene={tv:{x:480,y:270},world:{peeps:Array.from({length:count},(_,i)=>({...peep('NormalPeep',i%2?'square':'circle'),simulationId:i+1}))}};
  scene.world.replacePeep=(old,next)=>{
    Object.assign(next,{x:old.x,y:old.y,type:old.type,simulationId:old.simulationId});
    scene.world.peeps.splice(scene.world.peeps.indexOf(old),1,next);return next;
  };
  scene.director={callbacks:{}};
  const model=new context.WBWWBShadowAudienceModel({allowTransform:profile==='influence',spreadStrength:0});
  const failures=[];
  if(profile==='influence') {
    for(const actor of scene.world.peeps.slice()) {
      actor.shadowInfluence={phase:'active',fear:1,anger:0,behaviour:'avoiding'};
      model.maybeTransform(scene,actor);
    }
  }
  const director=new context.Director(scene);director.tv=scene.tv;
  director.photoData={audience:1+seed%9};
  // A filtered-out audience is also a legitimate caller input.
  const returned=director.audience_cutToTV(null,profile==='empty-filter'?()=>false:undefined);
  const seated=scene.world.peeps.filter(p=>p.isWatching).length;
  if(returned!==(seated>0)) failures.push('audience-success-with-no-viewers');
  if(profile==='influence' && seated===0) failures.push('influence-exhausts-eligible-viewers');
  for(let i=0;i<80;i++) model.spread(scene,500);
  const recovered=scene.world.peeps.filter(p=>p.shadowInfluence?.phase==='susceptible').length;
  const stillNervous=scene.world.peeps.filter(p=>p._CLASS_==='NervousPeep').length;
  if(profile==='influence' && (recovered!==count || stillNervous>0)) failures.push('recovered-influence-crowd-still-nervous');
  return {profile,count,seated,returned,recovered,stillNervous,failures};
}
const runs=[];
for(let i=0;i<300;i++) {
  const seed=Math.imul(i+1,2654435761)>>>0;
  const policy=['sell','refuse','mixed'][i%3];
  const profile=['ordinary','empty-filter','influence'][Math.floor(i/3)%3];
  runs.push({...run(seed,policy),boundary:boundary(seed,profile)});
}
const issues={};
for(const result of runs) for(const issue of [...result.failures,...result.boundary.failures]) {
  if(!issues[issue]) issues[issue]={count:0,exampleSeed:result.seed};
  issues[issue].count++;
}
const report={date:'2026-10-22',baselineCommit:'5a9abb8c5ef7bd94db936f1bfc0ace8791d42593',
  sourceSha256:Object.fromEntries(['js/game/Director.js','js/game/ShadowAudienceModel.js','js/game/PlayerAgencyModel.js','tools/playtest-309.js'].map(path=>[path,crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')])),
  scope:'300 headless runs: 100 per choice policy, 12 model broadcasts per run plus controlled Director/influence boundary fixtures. Boundary populations are deliberately forced; failure counts are not estimates of ordinary play frequency. No complete browser story playthroughs in this batch.',
  runs:300,broadcasts:3600,modelChecks:runs.reduce((n,r)=>n+r.checks,0),
  modelPassed:runs.filter(r=>!r.failures.length).length,
  boundaryPassed:runs.filter(r=>!r.boundary.failures.length).length,
  profiles:Object.fromEntries(['ordinary','empty-filter','influence'].map(p=>[p,runs.filter(r=>r.boundary.profile===p).length])),
  crowdRange:[Math.min(...runs.map(r=>r.crowd)),Math.max(...runs.map(r=>r.crowd))],issues,results:runs};
if (process.argv[2]) fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
const {results,...summary}=report;console.log(JSON.stringify(summary,null,2));
process.exitCode=Object.keys(issues).length?1:0;
