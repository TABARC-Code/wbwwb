import {chromium} from 'playwright';
import assert from 'node:assert/strict';

// Programmatic camera input and accelerated fixed ticks, with the real renderer,
// authored callbacks, capture analysis, director animations and choice buttons.
// Covers the extended news cycle through the hand-off to the original fear acts.
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
      const tick = (n)=>{for(let i=0;i<n;i++) Game.update(1000/60);};
      const select = (name)=>scene.world.props.find(p=>p._CLASS_===name);
      tick(90);
      function snap(name, expectedEvent, phase) {
        const prop = name && select(name);
        check(!name || prop, `Missing ${name} after ${shots.length} photos`);
        if(prop && /EvidenceProp$/.test(name)) {
          check(prop.graphics.anchor.x===0.5 && prop.graphics.anchor.y===1, `${name}: rendered and capture bounds disagree`);
        }
        const point = prop ? {x:prop.x,y:prop.y+(prop.z||0)-prop.height/2} : {x:5,y:5};
        check(!scene.camera.frozen, 'Camera did not reset');
        Game.stage.mousedown({data:{global:point}});
        const data = scene.director.photoData;
        tick(100); // Centre TV cut and agency offer, before audience/stage transition.
        check(data.story?.event===expectedEvent, `Expected ${expectedEvent}; got ${JSON.stringify(data.story)}`);
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
        check(!scene.camera.frozen, 'Capture animation did not finish');
      }
      snap(null,'empty');
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
      return {date,policy,shots,final:scene.agency.snapshot(),handoff:'Screamer'};
    }, {date,policy});
    assert.deepEqual(errors,[]);
    reports.push(report);
    await page.close();
  }
  console.log(JSON.stringify({scope:'Authored news-cycle browser walkthrough; not the full ending',reports},null,2));
} finally {await browser.close();}
