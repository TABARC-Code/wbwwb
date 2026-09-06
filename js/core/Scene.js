/************************************

SCENE BASE CLASS

*************************************/

function Scene(){

	var self = this;

	// TO IMPLEMENT
	self.update = function(){};

	// TO IMPLEMENT
	self.kill = function(){};

	// Scenes in the original were short-lived enough to get away with leaving
	// crumbs. Remixes aren't. New work can register any cleanup here without
	// forcing every old scene through a rewrite on day one.
	self._disposers = [];
	self.onDispose = function(disposer){
		if(typeof disposer === "function") self._disposers.push(disposer);
		return disposer;
	};
	self.dispose = function(){
		while(self._disposers.length){
			try{ self._disposers.pop()(); }
			catch(error){ console.warn("Scene cleanup failed", error); }
		}
	};

}
