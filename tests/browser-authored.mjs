import {chromium} from 'playwright';
import assert from 'node:assert/strict';

// Programmatic camera input and accelerated fixed ticks, with the real renderer,
// authored callbacks, capture analysis, director animations and choice buttons.
// Walks the authored news and fear acts through credits without forcing stages.
const browser = await chromium.launch({headless: true});
const reports = [];
try {
  for (const [date, policy] of [['2026-12-20','sell'], ['2026-07-10','mixed']]) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e=>errors.push(e.message));
    page.on('console', msg=>{if(msg.type()==='error') errors.push(msg.text());});
    const base = process.env.WBWWB_TEST_URL || 'http://127.0.0.1:4173/';
    const url = new URL(base);
    url.search = new URLSearchParams({lang:'en',seed:'authored-'+policy,date}).toString();
    await page.goto(url.href, {waitUntil:'networkidle',timeout:60000});
    await page.waitForFunction(()=>Game.assetsReady || Game.assetError, null, {timeout:60000});
    const report = await page.evaluate(({date,policy})=>{
      function check(ok, message) {if(!ok) throw new Error(message);}
      check(!Game.assetError, Game.assetError?.message);
      cancelAnimationFrame(Game._animationFrame);
      Game.paused = false;
      Game.sceneManager.gotoScene('Game');
      const scene = Game.scene;
      const shots = [];
      const seatAudience = scene.director.audience_cutToTV;
      scene.director.audience_cutToTV = function (...args) {
        const result = seatAudience.apply(this,args);
        this.photoData.seatedAudience = scene.world.peeps.filter(p=>p.isWatching).length;
        return result;
      };
      const tick = (n)=>{for(let i=0;i<n;i++) Game.update(1000/60);};
      const select = (name)=>scene.world.props.find(p=>p._CLASS_===name);
      tick(90);
      function snap(name, expectedEvent, phase, selected) {
        const prop = selected?.prop || (name && select(name));
        check(!name || prop, `Missing ${name} after ${shots.length} photos`);
        if(prop && /EvidenceProp$/.test(name)) {
          check(prop.graphics.anchor.x===0.5 && prop.graphics.anchor.y===1, `${name}: rendered and capture bounds disagree`);
        }
        const point = selected?.point || (prop ? {x:prop.x,y:prop.y+(prop.z||0)-prop.height/2} : {x:5,y:5});
        check(!scene.camera.frozen, 'Camera did not reset');
        Game.stage.mousedown({global:point});
        const data = scene.director.photoData;
        tick(100); // Centre TV cut and agency offer, before audience/stage transition.
        check(data.story?.event===expectedEvent, `Shot ${shots.length+1}: expected ${expectedEvent}; got ${JSON.stringify(data.story)}`);
        if(phase) check(data.story.phase===phase, `Expected pet phase ${phase}`);
        const offered = Boolean(scene.agency.pending);
        const expectedOffer = ['influencer','flood','shortage','toy-panic','pet-craze'].includes(expectedEvent);
        check(offered===expectedOffer, `${expectedEvent}: unexpected agency offer=${offered}`);
        let choice = null;
        if(offered) {
          choice = policy==='sell' ? 'sell' : scene.agency.money>=2 ? 'repair' : 'sell';
          const oldLength = scene.agency.history.length;
          document.querySelector(`[data-agency-action="${choice}"]`).click();
          check(scene.agency.history.length===oldLength+1 && !scene.agency.pending, 'Choice did not resolve once');
        }
        const entry = Game.ledger.entries[Game.ledger.entries.length-1];
        shots.push({event:expectedEvent,topic:data.story.topic||null,phase:data.story.phase||null,
          authoredAudience:entry.audience,choice,money:scene.agency.money});
        tick(600);
        shots[shots.length-1].seatedAudience = data.seatedAudience || 0;
        check(!scene.camera.frozen, 'Capture animation did not finish');
      }
      let emptyPoint;
      for(let attempt=0;attempt<600 && !emptyPoint;attempt++) {
        for(let y=67.5;y<=472.5 && !emptyPoint;y+=45) for(let x=120;x<=840 && !emptyPoint;x+=60) {
          if(!WBWWBCaptureAnalysis.analyse(scene.world.props,{x,y,width:240,height:135},0.33).length) emptyPoint={x,y};
        }
        if(!emptyPoint) tick(1);
      }
      check(emptyPoint,'Could not find an empty frame');
      snap(null,'empty',null,{point:emptyPoint});
      check(scene.agency.money===2,'Empty photograph earned money');
      snap('HatPeep','fashion');
      snap('LoverPeep','affection');
      snap('InfluencerPeep','influencer');
      snap('InfluencerPeep','influencer');
      snap('FloodEvidenceProp','flood');
      snap('ShortageEvidenceProp','shortage');
      if(date.includes('-12-')) {
        for(let i=0;i<3;i++) snap('ToyEvidenceProp','toy-panic');
      } else check(!select('ToyEvidenceProp'),'Christmas act ran outside Christmas');
      for(const phase of ['cute','craze','stray','bones']) snap('PetEvidenceProp','pet-craze',phase);
      snap('InfluencerPeep','influencer');
      snap('InfluencerPeep','influencer');
      // The authored sports beat must survive idle time and rewardCapture.
      tick(600);
      for(let i=0;i<2;i++) {
        check(scene.world.peeps.filter(p=>p._CLASS_==='InfluencerPeep').every(p=>p.antic==='sport'), 'Sports act lost its forced topic');
        snap('InfluencerPeep','influencer');
        check(shots[shots.length-1].topic==='sport','Sports photo changed topic');
      }
      snap('InfluencerPeep','influencer');
      snap('InfluencerPeep','influencer');
      check(select('CrazyPeep'),'News cycle failed to hand over to Screamer');
      check(!select('InfluencerPeep'),'Influencer leaked into original fear act');
      check(!scene.world.props.some(p=>/EvidenceProp$/.test(p._CLASS_)), 'Evidence leaked beyond its act');
      function waitUntil(predicate, label, limit=18000) {
        for(let i=0;i<limit;i++) {const value=predicate(); if(value) return value; tick(1);}
        throw new Error(`Timed out waiting for ${label}; classes=${scene.world.peeps.map(p=>p._CLASS_).join(',')}`);
      }
      function candidate(name, ready, valid=()=>true) {
        for(const prop of scene.world.peeps.filter(p=>p._CLASS_===name && ready(p))) {
          const points=[{x:prop.x,y:prop.y+(prop.z||0)-prop.height/2}];
          if(name==='NervousPeep') for(const other of scene.world.peeps.filter(p=>p.confused)) {
            points.push({x:(prop.x+other.x)/2,y:(prop.y+other.y)/2-prop.height/2});
          }
          for(const point of points) {
            point.x=Math.max(120,Math.min(840,point.x));
            point.y=Math.max(67.5,Math.min(472.5,point.y));
            const caught=WBWWBCaptureAnalysis.analyse(scene.world.props,{...point,width:240,height:135},0.33).map(x=>x.prop);
            if(caught.includes(prop) && valid(caught)) return {prop,point};
          }
        }
        return null;
      }
      let found=waitUntil(()=>candidate('CrazyPeep',p=>p.isScreaming()),'screaming square');
      snap('CrazyPeep','confrontation',null,found);
      found=waitUntil(()=>candidate('NervousPeep',p=>p.isScared(),caught=>caught.some(p=>p._CLASS_==='NormalPeep' && p.confused)), 'fear with its confused witness');
      snap('NervousPeep','fear',null,found);
      found=waitUntil(()=>candidate('SnobbyPeep',p=>p.isSmug),'snubbing square');
      snap('SnobbyPeep','contempt',null,found);
      for(let i=0;i<30 && !select('EvilHatPeep');i++) {
        found=waitUntil(()=>candidate('AngryPeep',p=>p.isShouting,caught=>!caught.some(p=>['HelpingAnim','ProtestAnim'].includes(p._CLASS_))), 'anger away from foreground evidence');
        snap('AngryPeep','anger',null,found);
      }
      check(select('EvilHatPeep'),'Anger did not progress to the final act');
      waitUntil(()=>scene.camera.noSounds,'panic');
      snap(null,'ordinary');
      snap(null,'ordinary');
      check(scene.zoomer.started,'Second panic broadcast did not start the ending');
      const final=scene.agency.snapshot();
      waitUntil(()=>Game.scene instanceof Scene_Post_Credits,'credits and aftermath',10000);
      Game.stage.mousedown({global:{x:480,y:270}});
      waitUntil(()=>Game.scene instanceof Scene_Post_Post_Credits,'final menu',1000);
      check(document.querySelector('#agency-panel').hidden,'Choice panel leaked into ending');
      return {date,policy,shots,final,ending:'Post_Post_Credits'};
    }, {date,policy});
    assert.deepEqual(errors,[]);
    reports.push(report);
    await page.close();
  }
  console.log(JSON.stringify({scope:'Accelerated authored browser walkthrough through the final menu; not human playtesting',reports},null,2));
} finally {await browser.close();}
