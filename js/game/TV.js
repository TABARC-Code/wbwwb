/**************************************

TV:
Is a prop you can add a photo to.

**************************************/

Game.addToManifest({
	tv: "sprites/tv.png",
	chyron: "sprites/chyron.png",
	chyron2: "sprites/chyron2.png",
	chyron3: "sprites/chyron3.png"
});

function TV(scene, options){

	var self = this;
	options = options || {};
	self._CLASS_ = "TV";

	// Properties
	self.scene = scene;
	self.x = Game.width/2;
	self.y = Game.height/2 + 80;
	self.displayScale = options.displayScale || 1;
	self.width = 150*self.displayScale;
	self.height = 180*self.displayScale;

	// Graphics
	var resources = PIXI.loader.resources;
    var g = new PIXI.Container();
    var bg = new PIXI.Sprite(resources.tv.texture);
    bg.anchor.x = 0.5;
    bg.anchor.y = 1.0;
    bg.scale.x = bg.scale.y = 0.5;
    if(options.casingTint != null) bg.tint = options.casingTint;
    g.addChild(bg);
    self.graphics = g;
    g.scale.x = g.scale.y = self.displayScale;

    // Offset
    self.offset = {
    	x: 0,
    	y: -113.5,
    	scale: 8
    };

    // Photo container
    var photoContainer = new PIXI.Container();
    var conversion = 0.5; // from 1/4 to 1/8
    photoContainer.x = self.offset.x - Camera.WIDTH*0.5*conversion;
    photoContainer.y = self.offset.y - Camera.HEIGHT*0.5*conversion;
    photoContainer.scale.x = photoContainer.scale.y = conversion;
    g.addChild(photoContainer);

    // Update
	self.update = function(){
		self.updateGraphics();
	};
	self.updateGraphics = function(){
		g.x = self.x;
    	g.y = self.y;
	};

	// PHOTO
	var photo;
	self.placePhoto = function(options){

		// OPTIONS
		var photoTexture = options.photo;
		var text = options.text || "";
		// Useful to the browser smoke test and future accessibility layer. The TV
		// may keep the live texture anyway; only the headless history avoids it.
		self.lastHeadline = text;

		// Clear screen
		function stopAnimations(target){
			if(typeof Tween !== "undefined" && Tween.removeTweens) Tween.removeTweens(target);
			if(target.children) target.children.forEach(stopAnimations);
		}
		photoContainer.removeChildren().forEach(function(child){
			stopAnimations(child);
			if(child.destroy) child.destroy({children:true, texture:false, textureSource:false});
		});

		// Add photo now
		photo = new PIXI.Sprite(photoTexture);
		// Author: TABARC-Code. Bulletin artwork comes in several sizes. I fit
		// it to the camera frame here; a flood needn't spill out of the set too.
		var fit = Math.min(Camera.WIDTH/photoTexture.width, Camera.HEIGHT/photoTexture.height);
		photo.scale.x = photo.scale.y = fit;
		photo.x = (Camera.WIDTH - photoTexture.width*fit)/2;
		photo.y = (Camera.HEIGHT - photoTexture.height*fit)/2;
		if(options.screenTint != null) photo.tint = options.screenTint;
	    photoContainer.addChild(photo);

		// Chryon container
		var chyron = new PIXI.Container();
		chyron.alpha = 0;
		chyron.x = +15;
		Tween_get(chyron).to({alpha:1}, _s(0.5), Ease.quadInOut);
		Tween_get(chyron).to({x:0}, _s(0.8), Ease.quadInOut);
		photoContainer.addChild(chyron);

		// Chyron BG
		var resourceName;
		if(options.nothing) resourceName="chyron3";
		else if(options.fail) resourceName="chyron2";
		else resourceName="chyron";
		var bg = new MakeSprite(resourceName);
		bg.scale.x = bg.scale.y = 1/8;
		chyron.addChild(bg);

		// Chyron Text
		if(!options.nothing){
		    var text = new PIXI.Text(text, {font:"bold 100px Cairo", align:"left", fill:"#FFF", padding:4});
		    text.scale.x = text.scale.y = 0.2;
		    text.anchor.x = 0;
		    text.anchor.y = 0.5;
		    text.x = 50;
		    text.y = 115;
		    var textFit = Math.min(1, (Camera.WIDTH-text.x-15)/text.width, 22/text.height);
		    text.scale.x *= textFit;
		    text.scale.y *= textFit;
		    chyron.addChild(text);
		}

	}

	// Update!
	self.update();

}
