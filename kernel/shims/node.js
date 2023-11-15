;(function () {
	if (typeof window.addEventListener !== 'function') { window.addEventListener = function(){}; }
	if (typeof global !== 'object') { global = window||{}; }
	if (typeof self !== 'object') { self = window||{}; }
	if (typeof process !== 'object') { process = {}; }

	if (!(process.argv instanceof Array)) { process.argv = []; }
	if (typeof window.navigator !== 'object') { window.navigator = {}; }
	if (typeof location !== 'object') {
		location = {
			"hash":"",
			"search":"",
			"pathname":"",
			"port":"",
			"hostname":"",
			"host":"",
			"protocol":"",
			"origin":"",
			"href":"",
			"ancestorOrigins":{}
		};
	}
})();
