//+ sw
;(function(){
	var channel = new BroadcastChannel('_');
	
	channel.addEventListener('message', function (e) {
		Hooks.run('message', e.data); // message
	});
	
	webapp.sw = {
		abrad: function (message) { // post message
			channel.postMessage(message);
		},
	};
})();