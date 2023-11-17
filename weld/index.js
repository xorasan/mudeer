;(function(){
	'use strict';

	function requireUncached(module) {
		delete require.cache[require.resolve(module)];
		return require(module);
	}
	
	var Uglify = require('../deps/uglify-js');
	
	var $ = requireUncached('../kernel.js');
	$.path = __dirname;
	
	// synchronously get all modules beforehand
	var Weld	= require('./src/w'       )	,
		Files	= require('../src/files'  )	,
		Css		= require('./src/css'     )	,
		Htm		= require('./src/htm'     )	,
		Js		= require('./src/js'      )	,
		Sql		= require('./src/sql'     )	,
		Config	= require('./src/config'  )	;


	Weld.init();
	
	var exp = {
		css:		Css,
		htm:		Htm,
		sql:		Sql,
		js:			Js,
		config:		Config,
		to_weld:	Weld.toslang,
		toslang:	Weld.toslang,
		multi:		Weld.multi,
		splitter:	Weld.splitter,
		parse:		Weld.parse
	};

	module.exports	= exp;
	
//	var obj = Files.get.file('test.slang');
	
//	var parsedslang = exp.multi( 'test.slang' );
	
//	parsedslang = ( Config.parse(parsedslang) );
	
//	var	uglifyoptions	= {
//			fromString:			true,
//			mangle:				false,
//			output: {
//				comments:	'all',
//				beautify:	true
//			},
//		};
//	parsedslang = Uglify.minify(
//		'a='+JSON.stringify( parsedslang ),
//		uglifyoptions
//	).code;

//	$.log.s( parsedslang );

//	$.log.s( exp.toslang( parsedslang ) );

})();