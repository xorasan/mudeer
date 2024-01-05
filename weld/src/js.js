/* generates static htm
 * 19 May 2018
 * 
 */

;(function () {
	'use strict';
	
	var Uglify = require('../../deps/uglify-js'),
		Files, Slang;

	var RE_BLOCKS = new RegExp([
	  /\/(\*)[^*]*\*+(?:[^*\/][^*]*\*+)*\//.source,           // $1: multi-line comment
	  /\/(\/)[^\n]*$/.source,                                 // $2 single-line comment
	  /"(?:[^"\\]*|\\[\S\s])*"|'(?:[^'\\]*|\\[\S\s])*'/.source, // - string, don't care about embedded eols
	  /(?:[$\w\)\]]|\+\+|--)\s*\/(?![*\/])/.source,           // - division operator
	  /\/(?=[^*\/])[^[/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[/\\]*)*?\/[gim]*/.source
	  ].join('|'),                                            // - regex
	  'gm'  // note: global+multiline with replace() need test
	);

	// remove comments, keep other blocks
	function removeComments(str) {
	  return str.replace(RE_BLOCKS, function (match, mlc, slc) {
		return mlc ? ' ' :         // multiline comment (replace with space)
			   slc ? '' :          // single/multiline comment
			   match;              // divisor, regex, or string, return as-is
	  });
	}

	var _mod = {
		process: function (text, options) {
			text = text || '';
			
			var douglify = (options.uglify && options.nouglyjs !== true);
			
			if (options.server || options.client) {
				// replace $._c('modname') with $._mods.modname = module.exports
				text = text.replace(/\$\.\_c\(\'(.*)\'\)/g, '$._mods.$1 = module.exports');

				// replace $('modname') with $._mods.modname
				text = text.replace(/\$\(\'(.*)\'\)/g, '$1');
			} else if (douglify) {
				// replace $._c('modname') with $._mods.modname = module.exports
				text = text.replace(/\$\.\_c\(\'(.*)\'\)/g, '$._mods.$1 = module.exports');

				// replace $('modname') with $._mods.modname
				text = text.replace(/\$\(\'(.*)\'\)/g, '$._mods.$1');
			}
			
			if (douglify) {
				// remove the $._c function definition
//				text = text.replace(/\$\.\_c[\w\W\s]*\}\;/g, ';"blah";');

				// props we know should be uglified
				var knownprops = []/*.concat( options.words || [] )*/;
				
				if (options.debug === 'props')
					$.log( knownprops.sort().join(', ') );

				if (options.savetemp) {
					var mapgeprops = '', propscache = {};
					
					text.replace(/([\w]+)\:/g, function (fulltext, prop) {
						if ( prop.length > 3
						&& propscache[ '0'+prop ] !== 1
						&& !knownprops.includes(prop) )
							mapgeprops += '\'' + prop + '\', ';

						propscache[ '0'+prop ] = 1;
					});
					
					Files.set.file('build/map.json', mapgeprops );
				}

			}
			
			var mangle = false, mangleprops = false;
			if (douglify) {
				mangle = {
					toplevel: true,
					'eval': true
				};
				mangleprops = {
					debug:			options.debug,
					ignore_quoted:	false,
//					reserved: [
//						's', 'e', 'i',
//						'Object', 'assign', 'create', 'prototype',
//						'trim', 'length', 'toString',
//						'splice', 'slice', 'unshift', 'push', 'pop'
//					].join(','),
					regex: new RegExp( '^' + knownprops.join('$|^') + '$' ),
				};
			}
			
			if (options.debug) {
				mangle = false;
				mangleprops = false;
			}
			
			var uglifyoptions	= {
					fromString:			true,
					mangle:				mangle,
					mangleProperties:	mangleprops,
					output: {
//						comments:	'all',
						/* TODO
						 * compress passes, 2 at least right?
						 * */
						beautify:	!options.compress,
					},
					outSourceMap:	false,
				};
			
//			if (options.compress === 2)
//				uglifyoptions.output.compress = { passes: 2 };
			
			if (options.minify === true || options.uglify === true) {
//			if (options.nouglyjs !== true) {
				text = Uglify.minify( text, uglifyoptions );
			} else {
				text = {code: text};
			}

			if (options.remove_comments) {
				text.code = removeComments( text.code );
			}

			return text;
		},
		parse: function (parsedslang, options) {
			parsedslang = parsedslang || [];
			options = options || {
					compress: true,
					uglify: false,
					map: {}
				};
				
			var _ = options._ = {
				tabs	: '	',
				slashn	: '\n',
				space	: ' '
			};
			
			if (options.uglify || options.compress) {
				_ = options._ = {
					tabs	: '',
					slashn	: '',
					space	: ''
				};
			}
			
			options.map	= options.map	|| {};

			var text = '';
			parsedslang.forEach(function (elt) {
				if (!elt.line.startsWith('+js')) {
					text += ( '\t'.repeat(elt.level) ) + elt.line +'\n';
				}
			});
			
			// save it for debug
			if (options.savetemp)
				Files.set.file('build/all.js', text );
			
//			if (options.compress) 
				text = _mod.process(text, options).code;
			
			// save it for debug
			if (options.savetemp)
				Files.set.file('build/all-built.js', text );
						
			var parsedhtm	= ''
//							+ '<script>'
							+ _.slashn
							+ text
							+ _.slashn
//							+ '</script>'
							;

			return {
				parsed: parsedhtm,
				map: options.map
			};
			
		},
		init: function (slang, files) {
			Slang = slang;
			Files = files;
		},
	};
	
	module.exports = _mod;
})();
