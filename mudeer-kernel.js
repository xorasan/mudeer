/*
 * 
 */

;(function(){
	'use strict';

	var Cli		= require('./src/cli.js'),
		Files	= require('./src/files.js');

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
	var dest = 'kernel.js';
	for (var i in mods) {
		var mod = mods[i];
		var path = 'kernel/' + mod + '.js';
		concat +=	'\n//' + mod + '\n'
				+	Files.get.file( path ) + '\n';
	}

	Files.set.file(dest, concat);
})();
