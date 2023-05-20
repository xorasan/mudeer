//+ _r _c _name
/*
 * this restores the initial module.exports = {} from
 * = glatteis by ._c
 * inclusion in other parent scripts after concatenation &
 * uglification
 */
$._r = function () {
	module.exports = glatteis;
};

/* 
 * used only when mods are concat'd
 * if no ._name property is present in mod, use the name argument
 * if no name argument, return false
*/
$._c = function (name) {
	var mod = module.exports;
	module.exports = {};

	if (mod instanceof Object 
		&& (typeof(name) === 'string' || typeof(mod._name) === 'string')
	) {
		if (typeof(mod._name) === 'string') {
			glatteis._mods[mod._name] = mod;
		} else {
			glatteis._mods[name] = mod;
		}
		
		return true;
	}
	
	return false;
};