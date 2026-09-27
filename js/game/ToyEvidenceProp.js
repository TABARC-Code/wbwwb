/* The toy stays the same. Only the number above its head gets hysterical. */
function ToyEvidenceProp(scene, x, y){
    var self = this;
    self.scene = scene;
    self._CLASS_ = "ToyEvidenceProp";
    self.toyId = "wobble-beast";
    self.coverageCount = 0;
    self.graphics = MakeSprite("toy_wobble_beast");
    self.graphics.scale.x = self.graphics.scale.y = 0.43;
    self.x = x; self.y = y;
    self.width = 240*0.43; self.height = 180*0.43;
    self.setBuzz = function(count){ self.coverageCount = count; self.bounce = 1 + count*0.12; };
    self.update = function(){ self.graphics.x = self.x; self.graphics.y = self.y; };
    self.kill = function(){
        var world = self.scene.world;
        var index = world.props.indexOf(self);
        if(index>=0) world.props.splice(index,1);
        if(self.graphics.parent) self.graphics.parent.removeChild(self.graphics);
    };
    self.update();
}
