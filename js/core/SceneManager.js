/************************************

SCENE MANAGER
Basically just swaps out scenes.

*************************************/

function SceneManager(){

	var self = this;

	self.gotoScene = function(sceneName){

		var Scene_Class = window["Scene_"+sceneName];
		if(typeof Scene_Class !== "function") throw new Error("Unknown scene: "+sceneName);

		// Old scene
		var oldScene = Game.scene;
		if(oldScene){
			oldScene.kill();
			if(oldScene.dispose) oldScene.dispose();
		}
		// Tweens belong to the departing scene; their callbacks must not touch destroyed objects.
		if(typeof Tween !== "undefined" && Tween.removeAllTweens) Tween.removeAllTweens();
		if(Game.stage.removeAllListeners) Game.stage.removeAllListeners();
		var removed = Game.stage.removeChildren();
		removed.forEach(function(child){
			if(child && child.destroy) child.destroy({children:true, texture:false});
		});

		// New scene
		var newScene = new Scene_Class();
		Game.scene = newScene;

	};

	self.update = function(){
		if(Game.scene){
			Game.scene.update();
		}
	};

}
