import {chromium} from 'playwright';
import assert from 'node:assert/strict';

// Focused integration fixtures, not complete optional-scenario playthroughs.
const browser = await chromium.launch({headless:true});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error=>errors.push(error.message));
  for(const scenario of ['influence','cricket']) {
    const url = new URL(process.env.WBWWB_TEST_URL || 'http://127.0.0.1:4173/');
    url.search = new URLSearchParams({scenario,lang:'en',seed:'scenario-safety',date:'2026-07-10'}).toString();
    await page.goto(url.href,{waitUntil:'networkidle',timeout:60000});
    await page.waitForFunction(()=>Game.assetsReady || Game.assetError,null,{timeout:60000});
    const result = await page.evaluate((scenario)=>{
      function check(ok,message){if(!ok) throw new Error(message);}
      check(!Game.assetError,Game.assetError?.message);
      cancelAnimationFrame(Game._animationFrame);
      Game.paused=false;
      Game.sceneManager.gotoScene('Game');
      Game.update(1000/60);
      const scene=Game.scene;
      check(Game.scenarios.id===scenario,'Wrong scenario loaded');
      if(scenario==='influence') {
        const model=scene.shadowTV.audienceModel;
        check(model.allowTransform,'Laboratory transformations disabled');
        const hat=scene.world.peeps.find(p=>p._CLASS_==='HatPeep');
        hat.shadowInfluence={phase:'active',anger:1,behaviour:'agitating'};
        check(model.maybeTransform(scene,hat)===hat,'Influence removed the hat actor');
        const ordinary=new NormalPeep(scene);ordinary.setType('circle');scene.world.addPeep(ordinary);
        ordinary.shadowInfluence={phase:'active',fear:1,behaviour:'avoiding'};
        const nervous=model.maybeTransform(scene,ordinary);
        check(nervous._CLASS_==='NervousPeep','Ordinary transformation stopped working');
        nervous.shadowInfluence.behaviour='agitating';
        const angry=model.maybeTransform(scene,nervous);
        check(angry._CLASS_==='AngryPeep' && scene.world.peeps.includes(angry),'Generated transformation failed');
      } else {
        scene.world.clearPeeps();
        const nervous=new NervousPeep(scene);
        const first=new AngryPeep(scene,'circle');
        const second=new AngryPeep(scene,'square');
        for(const peep of [nervous,first,second]) scene.world.addPeep(peep);
        Game.scenarios.broadcast({scene,data:{cricketCount:3}});
        check(Game.scenarios.active.calmed===1,'Surplus angry viewer did not calm');
        Game.scenarios.broadcast({scene,data:{cricketCount:3}});
        check(Game.scenarios.active.calmed===1,'Calming removed a required actor');
        check(scene.world.peeps.includes(nervous),'Nervous story actor disappeared');
        check(scene.world.peeps.filter(p=>p._CLASS_==='AngryPeep').length===1,'Last anger source disappeared');
      }
      Game.render();
      return {scenario,passed:true};
    },scenario);
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify(result));
  }
} finally {await browser.close();}
