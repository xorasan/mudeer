/*
 * 
 */

;(function(){
	'use strict';

	var Files	= require('./src/files.js');

	var KERNEL_BUILD_NUMBER = 0;
	try {
		KERNEL_BUILD_NUMBER = Files.get.file('version.w');
		KERNEL_BUILD_NUMBER = parseInt( KERNEL_BUILD_NUMBER.toString() || 0 );
	} catch (e) {
		// ignore because we can make do without this file
	}
	KERNEL_BUILD_NUMBER++;

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

	// this is for the static kernel, dynamic kernel has its own appended line in mudeer-install
	concat += '$.b = '+KERNEL_BUILD_NUMBER+';\n';

	Files.set.file(dest, concat);

	Files.set.file( 'version.w', ''+( KERNEL_BUILD_NUMBER || 0 ) );
})();
