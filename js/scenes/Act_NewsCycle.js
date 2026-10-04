/*****************************

THE EXTRA NEWS CYCLE

Four short acts before the original fear spiral. The subjects change, but the
incentive does not: do something louder, get photographed, watch the number rise.

******************************/

function _startInfluencerAct(self, profile, capturesNeeded, nextAct, options){
    options = options || {};
    self.world.peeps.filter(function(peep){ return peep._CLASS_==="InfluencerPeep"; }).forEach(function(peep){ peep.kill(); });
    for(var creatorIndex=0; creatorIndex<2; creatorIndex++){
        var influencer = new InfluencerPeep(self, profile);
        if(options.forcedTopic){
            // I want the sports truce to be an authored beat, not a lucky roll
            // in the antic carousel. Both creators start on the same story so
            // the player can see the crowd swap political camps for team camps.
            influencer.programme = [options.forcedTopic];
            influencer.setAntic(options.forcedTopic);
        }
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
                    event: options.storyEvent || "influencer",
                    topic: caught.influencer.antic,
                    profile: caught.influencer.profile,
                    followers: caught.influencer.followers,
                    capturedSeverity: options.capturedSeverity || null,
                    actualSeverity: options.actualSeverity || null
                };
                d.chyron = options.storyEvent==="flood"
                    ? WBWWBFloodFramingEngine.create(d.photoData.story, WBWWB_LOCALE).middle
                    : WBWWBInfluencerNewsEngine.create(d.photoData.story).middle;
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
    _startInfluencerAct(self, "clout", 2, Stage_FloodFraming);
}

function Stage_FloodFraming(self){
    self.world.peeps.filter(function(peep){ return peep._CLASS_==="InfluencerPeep"; }).forEach(function(peep){ peep.kill(); });
    var fragments = [
        new FloodEvidenceProp(self, "trickle", 125, 365),
        new FloodEvidenceProp(self, "representative", 425, 335),
        new FloodEvidenceProp(self, "extreme", 735, 365)
    ];
    fragments.forEach(function(fragment){ self.world.addProp(fragment); });

    self.director.callbacks = {
        takePhoto: function(d){
            var caught = d.caught({flood:{_CLASS_:"FloodEvidenceProp", returnAll:true}}).flood;
            if(caught.length){
                // The largest visible fragment wins when the frame overlaps two.
                // The camera analysis has already excluded incidental slivers.
                var fragment = caught.sort(function(a,b){ return b.width*b.height-a.width*a.height; })[0];
                d.photoData.caughtFlood = fragment;
                d.photoData.audience = 6;
                d.photoData.story = {
                    event:"flood", topic:"weather", capturedSeverity:fragment.severity,
                    actualSeverity:fragment.actualSeverity, subjects:"residents"
                };
                d.chyron = WBWWBFloodFramingEngine.create(d.photoData.story, WBWWB_LOCALE).middle;
            }else{
                _chyPeeps(d);
            }
        },
        movePhoto: function(d){ d.audience_movePhoto(); },
        cutToTV: function(d){
            d.audience_cutToTV();
            if(!d.photoData.caughtFlood) return;
            fragments.forEach(function(fragment){ fragment.kill(); });
            Stage_ToiletRollPanic(self);
        }
    };
}

function Stage_ToiletRollPanic(self){
    var evidence = [
        new ShortageEvidenceProp(self, "normal", 125, 365),
        new ShortageEvidenceProp(self, "hoard", 425, 335),
        new ShortageEvidenceProp(self, "empty", 735, 365)
    ];
    evidence.forEach(function(prop){ self.world.addProp(prop); });
    self.director.callbacks = {
        takePhoto: function(d){
            var caught = d.caught({shortage:{_CLASS_:"ShortageEvidenceProp", returnAll:true}}).shortage;
            if(caught.length){
                var prop = caught.sort(function(a,b){ return b.width*b.height-a.width*a.height; })[0];
                d.photoData.caughtShortage = prop;
                d.photoData.audience = prop.shortageState === "normal" ? 4 : 8;
                d.photoData.story = {
                    event:"shortage", topic:"shortage", capturedState:prop.shortageState,
                    actualSupply:prop.actualSupply, subjects:"shoppers"
                };
                d.chyron = WBWWBShortageFramingEngine.create(d.photoData.story, WBWWB_LOCALE).middle;
            }else _chyPeeps(d);
        },
        movePhoto: function(d){ d.audience_movePhoto(); },
        cutToTV: function(d){
            d.audience_cutToTV();
            if(!d.photoData.caughtShortage) return;
            evidence.forEach(function(prop){ prop.kill(); });
            var christmas = self.shadowTV && self.shadowTV.season && self.shadowTV.season.event === "christmas";
            if(christmas) Stage_ChristmasToyPanic(self);
            else Stage_PetCraze(self);
        }
    };
}

function Stage_ChristmasToyPanic(self){
    var toy = new ToyEvidenceProp(self, 430, 340);
    self.world.addProp(toy);
    var captures = 0;
    self.director.callbacks = {
        takePhoto: function(d){
            var caught = d.caught({toy:{_CLASS_:"ToyEvidenceProp"}}).toy;
            if(caught){
                var count = Math.min(3, captures+1);
                d.photoData.caughtToy = caught;
                d.photoData.audience = 3 + count*2;
                d.photoData.story = {
                    event:"toy-panic", topic:"toy", toyId:caught.toyId,
                    coverageCount:count, subjects:"christmas-shoppers"
                };
                d.chyron = WBWWBToyPanicEngine.create(d.photoData.story, WBWWB_LOCALE).middle;
            }else _chyPeeps(d);
        },
        movePhoto: function(d){ d.audience_movePhoto(); },
        cutToTV: function(d){
            d.audience_cutToTV();
            if(!d.photoData.caughtToy) return;
            captures++;
            toy.setBuzz(captures);
            if(captures>=3){ toy.kill(); Stage_PetCraze(self); }
        }
    };
}

function Stage_PetCraze(self){
    var phase = 0;
    var phases = ["cute", "craze", "stray", "bones"];
    var pets = [];
    function clearPets(){ while(pets.length) pets.pop().kill(); }
    function populate(state){
        clearPets();
        var positions = state === "cute" || state === "bones"
            ? [[430, 350, 0]]
            : [[245, 365, 0.28], [455, 330, -0.22], [690, 380, 0.2]];
        positions.forEach(function(position){
            var pet = new PetEvidenceProp(self, state, position[0], position[1], position[2]);
            pets.push(pet); self.world.addProp(pet);
        });
    }
    populate(phases[phase]);
    self.director.callbacks = {
        takePhoto: function(d){
            var caught = d.caught({pet:{_CLASS_:"PetEvidenceProp", returnAll:true}}).pet;
            if(caught.length){
                var pet = caught.sort(function(a,b){ return b.width*b.height-a.width*a.height; })[0];
                d.photoData.caughtPet = pet;
                d.photoData.audience = [4, 8, 7, 9][phase];
                d.photoData.story = {
                    event:"pet-craze", topic:"pet", phase:pet.petState,
                    coverageCount:phase+1, origin:pet.origin, subjects:"pets-and-owners"
                };
                d.chyron = WBWWBPetCrazeEngine.create(d.photoData.story, WBWWB_LOCALE).middle;
            }else _chyPeeps(d);
        },
        movePhoto: function(d){ d.audience_movePhoto(); },
        cutToTV: function(d){
            d.audience_cutToTV();
            if(!d.photoData.caughtPet) return;
            phase++;
            if(phase>=phases.length){ clearPets(); Stage_TrendFrenzy(self); }
            else populate(phases[phase]);
        }
    };
}

function Stage_TrendFrenzy(self){
    _startInfluencerAct(self, "trend", 2, Stage_SportsAlliance);
}

function Stage_SportsAlliance(self){
    _startInfluencerAct(self, "trend", 2, Stage_ScandalCycle, {forcedTopic:"sport"});
}

function Stage_ScandalCycle(self){
    _startInfluencerAct(self, "scandal", 2, function(scene){
        scene.world.peeps.filter(function(peep){ return peep._CLASS_==="InfluencerPeep"; }).forEach(function(peep){ peep.kill(); });
        Stage_Screamer(scene);
    });
}
