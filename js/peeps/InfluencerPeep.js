/*
 * An ordinary peep with a phone, an audience counter and catastrophic judgement.
 * The joke is the incentive structure: every antic is a route back to likes.
 */
function InfluencerPeep(scene, profile){
    var self = this;
    NormalPeep.apply(self, [scene]);
    self._CLASS_ = "InfluencerPeep";
    self.profile = profile || "clout";
    self.likes = 0;
    self.followers = 120 + Math.floor(Game.random()*880);
    self.anticIndex = -1;
    self.anticTicks = 0;
    self.likeFlashTicks = 0;

    var programmes = {
        clout: ["selfie", "charity", "weather", "apology"],
        trend: ["cards", "sport", "conspiracy", "selfie"],
        scandal: ["affair", "adultCartoon", "faith", "apology"]
    };
    self.programme = programmes[self.profile] || programmes.clout;

    self.liveLabel = new PIXI.Text("LIVE", {fontFamily:"Cairo", fontSize:15, fontWeight:"bold", fill:"#ffffff"});
    self.liveLabel.anchor.set(0.5, 1);
    self.liveLabel.y = -self.height-8;
    self.graphics.addChild(self.liveLabel);

    self.nextAntic = function(){
        self.anticIndex = (self.anticIndex+1)%self.programme.length;
        self.antic = self.programme[self.anticIndex];
        self.anticTicks = 0;
        self.liveLabel.text = self.antic === "adultCartoon" ? "18+?" : self.antic.toUpperCase();
        self.liveLabel.tint = self.antic === "apology" ? 0x8bb7d8 : 0xff4f72;
        self.bounce = 1.35;
    };
    self.rewardCapture = function(){
        var gained = 100 + Math.floor(Game.random()*900);
        self.likes += gained;
        self.followers += Math.floor(self.likes/20);
        self.bounce = 1.7;
        self.nextAntic();
        self.liveLabel.text = "+"+gained+" LIKES";
        self.liveLabel.tint = 0xffd24a;
        self.likeFlashTicks = _s(1.5);
    };

    var normalUpdate = self.callbacks.update;
    self.callbacks.update = function(){
        if(normalUpdate) normalUpdate();
        self.anticTicks++;
        if(self.likeFlashTicks>0){
            self.likeFlashTicks--;
            if(self.likeFlashTicks===0){
                self.liveLabel.text = self.antic === "adultCartoon" ? "18+?" : self.antic.toUpperCase();
                self.liveLabel.tint = self.antic === "apology" ? 0x8bb7d8 : 0xff4f72;
            }
        }
        if(self.anticTicks>=_s(7)) self.nextAntic();
        if(self.anticTicks%90===0){
            self.touchingPeeps(105, function(peep){ return peep._CLASS_==="NormalPeep"; }).forEach(function(peep){
                peep.trendPressure = Math.min(1, (peep.trendPressure||0)+0.08);
                peep.flip = peep.x>self.x ? -1 : 1;
            });
        }
    };
    self.nextAntic();
}
