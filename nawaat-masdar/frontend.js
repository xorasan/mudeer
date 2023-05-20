//+ _mods _paths
var glatteis = {
};

// if fn is not provided, that means the user is expecting immediate response and no deferring
// in that case, return false if the module is not loaded
// otherwise load the module and then run fn(mod)
/*
 * a move to .then(cb) would be awesome or nuh?
 * @todo indeed.
 */
var glatteisfn = function (name, fn) {
	if (name) {
		var mod = (glatteis._mods[name] || glatteis[name]);
		if (typeof fn === 'function') { // defer execution
			if (mod) { // if the mod is loaded or it's a core module
				fn(mod);
			} else {
				// example
				// $('dom')(
				// 		function () {}
				// )
				// this autoloads mods and then you can run relevant code on top
				if (glatteis._paths[name]) { // if its path is defined
					glatteis.require(glatteis._paths[name], function(mod) {
						glatteis._mods[name] = mod;
						fn(mod);
					});
				}
			}
			return null; // the function will be called
		} else { // immediate execution
			return (mod || false);
		}
	}
	return false; // if name wasn't provided
};

var $ = $$ = glatteis = Object.assign(glatteisfn, glatteis);

if (typeof module === 'object') {
	module.exports = glatteis;
}