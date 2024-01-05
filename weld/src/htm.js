/* generates static htm
 * 19 May 2018
 * 
 */

;(function () {
	'use strict';
	var Slang = false;
	
	var _mod = {
		voidtags: [
			'!doctype',
			'area'    ,
			'base'    ,
			'br'      ,
			'col'     ,
			'command' ,
			'embed'   ,
			'hr'      ,
			'img'     ,
			'input'   ,
			'keygen'  ,
			'link'    ,
			'meta'    ,
			'param'   ,
			'source'  ,
			'track'   ,
			'use'     ,
			'wbr'
		],
		quotesmask: /[ '"]/,
		pathmask: '\\w\\=\\:\\;\\.\\#\\(\\)\\%\\,\\-\\!\\&\\/\\# ا-ي',
		
		/*
		 * this should also return a map of all uglifiable keywords
		 * this map should add to slang.keywords using $.unique
		 * this map is an object, key: uglified-version
		 * 
		 * this module should also accept a map second parameter
		 * when this parameter is spec'd, uglified code + map will be returned
		 * the returned map can then be passed by slang to next modules
		 * and they can use it as a guide
		 */
		// to dom string
		_render: function (json, options) {

//			var _ = $('ansi').code;
			
			var domstr = '';
			
			for (var i in json) {
				
				var tag = json[i],
					indent = '\n'+'	'.repeat(tag.level);
					
				if (options.compress) {
					indent = '';
				}
				
				var attribstr = '';
//				attribstr += _.FgYellow;
				if (tag.id.length > 0) {
					if (options.uglify === true) {
						for (var k in tag.id) {
							tag.id[k] = Slang.mapit(options.map, tag.id[k], true);
						}
					}
					
					var joined = tag.id.join(' ').trim();
					attribstr += ' id=';
					if (joined.match(_mod.quotesmask)) {
						attribstr += '"'+joined+'"';
					} else {
						attribstr += joined;
					}
				}
//				attribstr += _.FgCyan;
				if (tag.classes.length > 0) {
					
					if (options.uglify === true) {
						for (var k in tag.classes) {
							tag.classes[k] = Slang.mapit(options.map, tag.classes[k], true);
						}
					}

					var joined = tag.classes.join(' ').trim();
					attribstr += ' class=';
					if (joined.match(_mod.quotesmask)) {
						attribstr += '"'+joined+'"';
					} else {
						attribstr += joined;
					}
				}
//				attribstr += _.FgBlue;
				if (tag.attributes) {
					for (var j in tag.attributes) {
						var attrib = tag.attributes[j];
						attribstr += ' '+j.substr(1);
						if (attrib.length) {
							if (attrib.match(_mod.quotesmask)) {
								attribstr += '="'+attrib+'"';
							} else {
								attribstr += '='+attrib;
							}
						}
					}
				}
//				attribstr += _.FgMagenta;
				if (tag.dataset) {
					if (options.uglify === true) { // EXPERIMENTAL
						var newdataset = {};
						for (var k in tag.dataset) {
							newdataset[ Slang.mapit(options.map, k, true) ] = Slang.mapit(options.map, tag.dataset[k], true);
						}
						tag.dataset = newdataset;
					}

					for (var j in tag.dataset) {
						if (tag.dataset.hasOwnProperty(j)) {
							var data = tag.dataset[j];
							attribstr += ' data-'+j;
							
							// only insert '=' if there's a value
							if (data.trim().length) {
								attribstr += '=';
								if (data.match(_mod.quotesmask)) {
									attribstr += '"'+data+'"';
								} else {
									attribstr += data;
								}
							}
						}
					}
				}
//				attribstr += _.Reset;
				
				// is it a void tag
				if (_mod.voidtags.includes(tag.name.toLowerCase())) {

					domstr += ''
							+indent
//							+ _.BgBlack
							+'<' + tag.name
//							+ _.Reset
							+ attribstr
//							+ _.BgBlack
							+ '>'
//							+ _.Reset
							;
					
				} else {
					
					var childrenstr = '';
					if (tag.children.length > 0) {
						
						childrenstr += _mod._render(tag.children, options);
						
					}
					
					domstr += ''
							+indent
//							+ _.BgBlack
							+'<' + tag.name
//							+ _.Reset
							+ attribstr
//							+ _.BgBlack
							+ '>'
//							+ _.Reset
								+ tag.text
										.replace(/\n/g, '')
								+ childrenstr
//							+ _.BgBlack
							+'</' + tag.name + '>'
							+indent
//							+ _.Reset
							;
					
					
				}

			}
			
			return domstr;

		},
		render: function (json, options) {
			options		= options || {};
			options.map	= options.map	|| {};
			
			return _mod._render(json, options).trim();
			
		},
		// to json
		parse: function (parsedslang, options) {
			
			parsedslang = parsedslang	|| [];
			options		= options		|| {};
			options.map	= options.map	|| {};
			
			var dictionary	= {};
			
			for (var i in parsedslang) {
				
				var command = parsedslang[i];
				var tag = {
					uid:			parseInt(command.uid),
					attributes:		{},
					dataset:		{},
					classes:		[],
					text:			'', // textnode
					id:				[],
					level:			command.level,
					parent:			command.parent,
					children:		[]
				};
				
				// is it a text node?
				var textnode = command.line.match(/^['"](.*)["']$/) || '';
				
				if ( command.line.startsWith('//') || command.line.startsWith('+htm') ) {
				} else
				if (textnode) {
					
					var parent = dictionary[tag.parent];
					parent.text.length > 0 ? parent.text += '\n' + textnode[1] : parent.text += textnode[1];
					
				} else {

					dictionary[tag.uid] = tag;
					if (command.parent > -1) {
						if (dictionary[command.parent])
							dictionary[command.parent].children.push( tag );
						else
							$.log.s( 'ge-htm: parent not found\n'+ Slang.toslang(command) );
					}

					// tag-name#id.class.class
					// TODO #id vs url(#id), fix
					var matches = command.line.match(/([\!\w\_\-]*)(\#*[\w\_\-\#]*)*(\.*[\w\_\-\.]*)*/) || '';
					if (matches) {
						tag.name = (matches[1] || 'div');
//						if (matches[2]) tag.id = tag.id.concat( matches[2].split('#')[1] ); // BUGGY
						if (matches[3]) tag.classes = tag.classes.concat( matches[3].split('.') );
					}
					
					matches = command.line.match(/(^| )*\#([a-zA-Z0-9\_\-]*)/g) || '';
					if (matches.length) {
						for (var j in matches) {
							var attrib = matches[j].match(/\#([a-zA-Z0-9\_\-]*)/);
							if (attrib) {
								attrib = attrib[1].trim();
								if (attrib.length && tag.id.indexOf(attrib) === -1)
									tag.id.push( attrib );
							}
						}
					}
					
					// extract quoted text, replace it with nothing
					command.line = command.line.replace(/(^| )['"]([\s\S]*)['"]/m, function () {
						if (arguments) tag.text += arguments[2] || '';
						return '';
					});
					
					// @attrib(value) @attrib
					var regex = new RegExp('(\\@[a-zA-Z0-9\\-\\:ا-ي]*(\\(['+_mod.pathmask+']*\\))*[ $]*)', 'g');
					matches = command.line.match(regex) || '';
					if (matches.length) {
						for (var j in matches) {
							var attrib = matches[j];
							if (typeof attrib === 'string') {
								attrib = attrib.match(/\@([a-zA-Z0-9\-\:ا-ي]*)*\(*(.*)*\)*/);
								
								// add it to attributes
								tag.attributes['_'+attrib[1]] = (attrib[2] || '').trim().slice(0, -1);
							}
						}
					}
					// replace attribs to avoid conflict with .class e.g .css
					command.line = command.line.replace(regex, '');
					
					// [name=value] [name]
					// @todo this should be uglified as well
					regex = /\[([\w\= ا-ي])+\]/g;
					matches = command.line.match(regex) || '';
					if (matches.length) {
						for (var j in matches) {
							var attrib = matches[j];
							if (attrib) {
								attrib = attrib.substr(1, attrib.length-2).split('=');
								tag.dataset[attrib[0]] = attrib[1] || '';
							}
						}
					}
					// replace datasets to avoid conflict with .class e.g .css
					command.line = command.line.replace(regex, '') || '';
					
					// .class .class .class
					matches = command.line.match(/ +\.([a-zA-Z0-9\-\_]*)/g) || '';
					if (matches.length) {
						for (var j in matches) {
							var attrib = matches[j].match(/\.([a-zA-Z0-9\-\_]*)/);
							if (attrib) {
								tag.classes.push( attrib[1] );
							}
						}
					}
					
					if (options.uglify === true) {
						// map ids, classes, ...
						for (var k in tag.id) {
							Slang.mapit(options.map, tag.id[k], true);
						}
						for (var k in tag.classes) {
							Slang.mapit(options.map, tag.classes[k], true);
						}
						for (var k in tag.dataset) {
							Slang.mapit(options.map, tag.dataset[k], true);
						}
					}
				}
				
			}
			

			var tree = [];
			for (var i in dictionary) {

				if (dictionary.hasOwnProperty(i) && dictionary[i].parent < 0) {
					tree.push(dictionary[i]);
				}

			}

			var parsedhtm = _mod.render( tree, options );
			
			return {
				parsed: parsedhtm,
				map: options.map
			};
			
		},
		init: function (slang) {
			Slang = slang;
		}
	};
	
	module.exports = _mod;
})();
