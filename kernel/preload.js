$.preload = function (mods, fn) { // loads mods then calls the fn
	if (mods instanceof Array) {
		var modnum = 0; // start by loading the first mod
		var increment = function () {
			++modnum;
			if (modnum < mods.length) {
				loadmod();
			} else {
				if (typeof fn === 'function') {
					fn();
				}
			}
		};
		/*
		 * load mods in order, get the name, see if its path is cached
		 * if we dont know where it's located or if it's already loaded
		 * move on -> increment()
		 * give ge require mod-path and receive mod's contents in callback
		 * cache the contents and move on -> increment()
		 */
		var loadmod = function () {
			var name = mods[modnum];
			
			// if already loaded
			if ($._mods[name]) {
				// then move on
				increment();

			// not loaded but has cached path
			} else if ($._paths[name]) {
				
				// require it from that cached path
				$.require($._paths[name], function(mod) {
					$._mods[name] = mod;
					increment();
				});
				
			// not loaded, no cached path
			} else {
				
				// require from a default path
				$.require($.path + '/src/' + name + '.js', function(mod) {
					$._mods[name] = mod;
					increment();
				});
//			} else {
//				increment();
			}
		};
		loadmod();
	}
};