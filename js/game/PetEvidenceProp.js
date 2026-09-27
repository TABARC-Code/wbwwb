/* The animal is never the joke. The crowd's brief appetite is. */
function PetEvidenceProp(scene, state, x, y, drift){
    var self = this;
    self.scene = scene;
    self._CLASS_ = "PetEvidenceProp";
    self.petState = state || "cute";
    self.origin = "viral-photo-cycle";
    self.graphics = MakeSprite("pet_"+self.petState);
    self.graphics.scale.x = self.graphics.scale.y = self.petState === "bones" ? 0.28 : 0.34;
    self.x = x; self.y = y;
    self.width = (self.petState === "bones" ? 220 : 240) * self.graphics.scale.x;
    self.height = (self.petState === "bones" ? 120 : 180) * self.graphics.scale.y;
    self.drift = self.petState === "stray" ? Number(drift) || 0.24 : 0;
    self.update = function(){
        if(self.drift){
            self.x += self.drift;
            if(self.x < 90 || self.x > 870) self.drift *= -1;
            // A tiny vertical wobble reads as searching rather than marching.
            self.y += Math.sin(self.x*0.025)*0.08;
            self.graphics.scale.x = Math.abs(self.graphics.scale.x) * (self.drift < 0 ? -1 : 1);
        }
        self.graphics.x = self.x; self.graphics.y = self.y;
    };
    self.kill = function(){
        var world = self.scene.world;
        var index = world.props.indexOf(self);
        if(index>=0) world.props.splice(index,1);
        if(self.graphics.parent) self.graphics.parent.removeChild(self.graphics);
    };
    self.update();
}
