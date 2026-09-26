/*****************************

THE EXTRA NEWS CYCLE

Three short acts before the original fear spiral. The subjects change, but the
incentive does not: do something louder, get photographed, watch the number rise.

******************************/

function _startInfluencerAct(self, profile, capturesNeeded, nextAct){
    self.world.peeps.filter(function(peep){ return peep._CLASS_==="InfluencerPeep"; }).forEach(function(peep){ peep.kill(); });
    for(var creatorIndex=0; creatorIndex<2; creatorIndex++){
        var influencer = new InfluencerPeep(self, profile);
        influencer.setType((creatorIndex+(profile==="trend" ? 1 : 0))%2 ? "square" : "circle");
        var centre = profile==="clout" ? 260 : profile==="trend" ? 480 : 700;
        influencer.x = centre + (creatorIndex ? 75 : -75);
        influencer.y = 380 + creatorIndex*45;
        self.world.addPeep(influencer);
    }
    var captures = 0;

    self.director.callbacks = {
        takePhoto: function(d){
            var caught = d.caught({ influencer: {_CLASS_:"InfluencerPeep"} });
            if(caught.influencer){
                d.photoData.caughtInfluencer = caught.influencer;
                d.photoData.audience = 4 + Math.min(5, captures);
                d.photoData.story = {
                    event: "influencer",
                    topic: caught.influencer.antic,
                    profile: caught.influencer.profile,
                    followers: caught.influencer.followers
                };
                d.chyron = WBWWBInfluencerNewsEngine.create(d.photoData.story).middle;
            }else{
                _chyPeeps(d);
            }
        },
        movePhoto: function(d){ d.audience_movePhoto(); },
        cutToTV: function(d){
            d.audience_cutToTV();
            if(!d.photoData.caughtInfluencer) return;
            d.photoData.caughtInfluencer.rewardCapture();
            captures++;
            if(captures>=capturesNeeded) nextAct(self);
        }
    };
}

function Stage_CloutAntics(self){
    _startInfluencerAct(self, "clout", 2, Stage_TrendFrenzy);
}

function Stage_TrendFrenzy(self){
    _startInfluencerAct(self, "trend", 2, Stage_ScandalCycle);
}

function Stage_ScandalCycle(self){
    _startInfluencerAct(self, "scandal", 2, function(scene){
        scene.world.peeps.filter(function(peep){ return peep._CLASS_==="InfluencerPeep"; }).forEach(function(peep){ peep.kill(); });
        Stage_Screamer(scene);
    });
}
