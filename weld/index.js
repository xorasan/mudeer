;(function(){
	'use strict';
	
	var Uglify = require('uglify-js');
	
	var $ = require('./etc/glatteis.js');
	$.path = __dirname;
	
	// synchronously get all modules beforehand
	var Slang	= $('slang')	,
		Files	= $('files')	,
		Css		= $('css')		,
		Htm		= $('htm')		,
		Js		= $('js')		,
		Sql		= $('sql')		,
		Config	= $('config')	;

	Slang.init();
	
	var exp = {
		css:		Css,
		htm:		Htm,
		sql:		Sql,
		js:			Js,
		config:		Config,
		toslang:	Slang.toslang,
		multi:		Slang.multi,
		splitter:	Slang.splitter,
		parse:		Slang.parse
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