/* A photographable state of one shop shelf. */
function ShortageEvidenceProp(scene, state, x, y){
    var self = this;
    self.scene = scene;
    self._CLASS_ = "ShortageEvidenceProp";
    self.shortageState = state;
    self.actualSupply = "adequate-before-rush";
    self.graphics = MakeSprite("shortage_"+state);
    self.graphics.scale.x = self.graphics.scale.y = 0.34;
    self.x = x; self.y = y;
    self.width = 320*0.34; self.height = 180*0.34;
    self.update = function(){ self.graphics.x = self.x; self.graphics.y = self.y; };
    self.kill = function(){
        var world = self.scene.world;
        var index = world.props.indexOf(self);
        if(index>=0) world.props.splice(index,1);
        if(self.graphics.parent) self.graphics.parent.removeChild(self.graphics);
    };
    self.update();
}
