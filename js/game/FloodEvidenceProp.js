/* A photographable fragment of one larger flood. */
function FloodEvidenceProp(scene, severity, x, y){
    var self = this;
    self.scene = scene;
    self._CLASS_ = "FloodEvidenceProp";
    self.severity = severity;
    self.actualSeverity = "severe";
    var resources = {trickle:"flood_trickle", representative:"flood_actual", extreme:"flood_extreme"};
    self.graphics = MakeSprite(resources[severity] || resources.representative);
    self.graphics.anchor.set(0.5, 1); // Match the camera's bottom-centre prop bounds.
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
