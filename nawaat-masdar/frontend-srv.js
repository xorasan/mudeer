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

		// if the mod is loaded or it's a core module
		var mod = (glatteis._mods[name] || glatteis[name]);

		if (mod) {
			if (typeof fn === 'function') {
				fn(mod);
				return null;
			} else {
				return (mod || false);
			}
		} else {
			var path = glatteis._paths[name] || ( $.path + '/masdar/' + name + '.js' );
			
			if (typeof fn === 'function') { // defer execution
				glatteis.require(path, function(mod) {
					glatteis._mods[name] = mod;
					fn(mod);
				});
			} else {
				glatteis._mods[name] = glatteis.require( path );
				return glatteis._mods[name];
			}
		}

	}
	// if name wasn't provided
	return false;
};

var $ = $$ = glatteis = Object.assign(glatteisfn, glatteis);

if (typeof module === 'object') {
	module.exports = glatteis;
}