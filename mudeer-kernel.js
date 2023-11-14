/*
 * 
 */

;(function(){
	'use strict';

	var Cli		= require('./masdar/cli.js'),
		Files	= require('./masdar/files.js');

	var mods = [
		'shims', 
		'frontend', 
		'log',
		'taxeer',
		'regexp', 
		'mod-concat',
		'modules',
		'use',
		'array',
		'preload',
		'queue',
		'require'
	];
	var concat = '';
	var dest = 'nawaat.js';
	for (var i in mods) {
		var mod = mods[i];
		var path = 'nawaat-masdar/' + mod + '.js';
		concat +=	'\n//' + mod + '\n'
				+	Files.get.file( path ) + '\n';
	}

	Files.set.file(dest, concat);
})();
