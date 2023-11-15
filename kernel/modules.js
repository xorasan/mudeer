//+ _paths _mods cache unload
$._paths = {
};

$._mods = {
};

$.cache = function (name, path) { // cache a module's path
	$._paths[name] = path;
};

$.unload = function (mods, fn) {
	/*
	 * @TODO:	delete/unload mods from memory
	 * 			run ._unload per mod for a graceful exit
	 * 			once all mods are unloaded in a chain/order -> call fn
	 */
};