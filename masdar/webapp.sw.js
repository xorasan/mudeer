//+ sw
;(function(){
	var channel = new BroadcastChannel('_');
	
	channel.addEventListener('message', function (e) {
		Hooks.run('XPO.breed', e.data); // message
	});
	
	webapp.sw = {
		abrad: function (breed) { // post message
			channel.postMessage(breed);
		},
	};
})();