/*
 * Weld is a preprocessor
 * it's full version currently lives in the root folder
 * it's planned to be moved here once mudeer src modules can handle nesting under folder
 * 
 * the proposed structure for future src module:
 * src/
 *   weld.js
 *   weld/
 *     htm.js
 *     js.js
 *     config.js
 *     ...
 * 
 * 
 * this file is a dirty hack to allow Mudeer apps to parse config.w files -_- :D :( :/
 */

var Weld;
;(function(){
function parse_weld( text ) {
	if (typeof text !== 'string') $.log('text needs to be string');
	
	// TODO improve this, only \n---\n should allow splitting
	text = (text || '')/*.split('---')[0]*/;
	
	var levels = [],
		lastlevel = 0,
		lastelement = false,
		parsedlines = [];
	
	text = ( text || '' ).split('\n');
	for (var i in text) {
		var line = text[i];
		
		// get the number of tabs at the beginning
		var tabs = line.match(/^(\t*).*/i);
		var level = tabs[1].length;
		
		// replace those tabs at the beginning
		line = line.replace(/^(\t*)(.*)/i, '$2');
		
		// replace consecutive tabs+spaces with just one space
		line = line.replace(/([\t ]+)/gi, ' ');
		
		// trim
		var line = line.trim();
		
		// check if the line isn't empty
		if (line.length > 0
		// check if it isn't a comment
		&& !line.startsWith('//')) {
			
			// on level increase
			if (level > lastlevel) levels.push(lastelement);
			
			// on level decrease
			if (level < lastlevel) levels = levels.slice(0, level);

			// remember this element | object
			lastelement = parseInt(i);
			
			var parent = levels[level-1	] === undefined ? -1 : levels[level-1	];
			
			parsedlines.push({
				uid		:	parseInt(i)				,
				line	:	line					,
				level	:	level					,
				root	:	levels[0		] || -1	,
				parent	:	parent
			});

//			$.log.s(
//				_mod.linenumber(i, text.length),
//				_mod.linenumber( (levels[level-1]), text.length ),
//				'	'.repeat(level), line,
//				'---------', levels
//			);
			
			// remember this level
			lastlevel = level;
			
		}
		
	}
	
	return parsedlines;
};
var _mod = {
	/*
	 * returns all kids as strings in an array
	 * or returns '' if there are no kids
	 * */
	childrentoarray: function (children) {
		var array = [];
		for (var i in children) {
			array.push(children[i].line);
		}
		if (array.length === 0) return '';
		return array;
	},
	/*
		* returns true if
		* 	all kids don't have children
		* 	and they also don't have values
		* */
	allchildrenterminal: function (children) {
		for (var i in children) {
			if (children[i].children.length > 0 || children[i].value.length > 0) {
				return false;
			}
		}
		return true;
	},
	parseparenttag: function (tag, parent) {
		// value check
		if (tag.value.length > 0) {
		
			parent.obj[tag.line] = tag.value;
			
		// parent tag
		} else if (tag.children.length > 0) {

			if ( _mod.allchildrenterminal( tag.children ) ) {
				parent.obj[tag.line] = _mod.childrentoarray( tag.children );
			} else {
				parent.obj[tag.line] = tag.obj;
			}

		// parent tag with a single kid
		} else if (tag.children.length === 1) {
			if ( _mod.allchildrenterminal( tag.children ) ) {
				parent.obj[tag.line] = _mod.childrentoarray( tag.children );
			} else {
				parent.obj[tag.line] = tag.obj;
			}

		// terminal tag
		} else {
			
			if ( _mod.allchildrenterminal( tag.children ) ) {
				parent.obj[tag.line] = _mod.childrentoarray( tag.children );
			} else {
				parent.obj[tag.line] = tag.line;
			}
			
		}
	},
	_parsevalue: function (value) {
		if (value === 'true') return true;
		if (value === 'false') return false;
//		if (parseInt(value) !== NaN) return parseInt(value);
		return value;
	},
	parseroottag: function (tag, tree) {
		// parent tag
		if (tag.children.length > 0) {

			if ( _mod.allchildrenterminal( tag.children ) ) {
				tree[tag.line] = _mod.childrentoarray( tag.children );
			} else {
				tree[tag.line] = tag.obj;
			}

		// terminal tag
		} else {
			
			if (tag.value.length > 0) {
				tree[tag.line] = _mod._parsevalue(tag.value);
			} else {
				tree[tag.line] = true;
			}
			
		}
	},
	parse: function (parsedslang, options) {

		var dictionary	= {};
		var tree = {};

		for (var i in parsedslang) {
			
			var command = parsedslang[i];
			var tag = {
				uid:			parseInt(command.uid),
				line:			command.line,
				level:			command.level,
				parent:			command.parent,
				children:		[],
				obj:			{}
			};
			
			var splat = tag.line.split(' ');
			tag.line = splat[0];
			tag.value = splat.slice(1).join(' ');

			dictionary[tag.uid] = tag;
			if (command.parent > -1) {
				dictionary[command.parent].children.push( tag );
			}
		
		}
		
		for (var i in parsedslang) {
			
			tag = dictionary[ parsedslang[i].uid ];

			// and it has a parent
			if (tag.parent > -1) {
				
				var parent = dictionary[tag.parent];

				_mod.parseparenttag(tag, parent);

			} else {
				
				_mod.parseroottag(tag, tree, dictionary);
				
			}

		}
		
		return tree;
		
	}
};

Weld = {
	parse_weld,
	parse_config: function ( text ) {
		return _mod.parse( parse_weld( text ) );
	},
	/* converts json back to weld, each child level is represented by a \t
	 * takes a json object, return string weld
	 * */
	encode_config: function (obj, tabs) { // was .toslang
		var weld	= '',
			tabs	= tabs || 0,
			filler	= Cli.getfiller(obj);

		for (var i in obj) {
			var sub = obj[i];

			if (typeof sub === 'object') {
				if (!(isarr(sub) && sub.length === 0)) { // ignore empty arrays
					weld += '\t'.repeat(tabs) + i + '\n';
					weld += ( Weld.encode_config( sub, tabs+1 ) );
				}
			} else {
				if (isarr(obj)) {
					weld += '\t'.repeat(tabs) + sub + '\n';
				} else if (obj instanceof Object) {
					weld += '\t'.repeat(tabs) + filler(i) + ' ' + sub + '\n';
				} else {
					weld += '\t'.repeat(tabs) + filler(i) + ' ' + sub + '\n';
				}
			}
			
		}
		
		return weld;
	},
};

Weld.decode_config = Weld.parse_config;
Weld.encode = Weld.encode_config;

// Uglification support base, all submodules depend on this
/*
 * used when mapping an uglified key to an original key
 * @param	String optional key
 * @return	Uglified unique key
 */
var ugly_uid = 0, ugly_seed = 'ثحخقضصطظذا';
Weld.uglify_key = function (key) {
	if (key === undefined) key = ugly_uid++;
	
	var uglykey	= '',
		seed	= ugly_seed,
		uid		= (key).toString();
	
	if (debug === false) {
		uid = uid.split('');
		for (var i in uid) {
			uglykey += seed[ uid[i] ];
		}
	} else {
		uglykey = uid;
	}

	// the delimiter can be any valid character not in _uglyseed
	return '_'+uglykey;
};
/*
 * this function adds the value to the map if it isn't already there
 * if value === true, it'll auto gen unique uglykey
 * mapit( map, key, value )
 * mapit( map, value ) // uses value as both key & value
 */
Weld.map_key = function (map, key, value) {
	if (value === undefined) value = key;
	if (map[key] === undefined) {
		if (value === true) {
			if (debug) {
				value = '_'+key+'_';
			} else {
				value = Weld.uglify_key();
			}
		}
		map[key] = value;
	} else {
		return map[key];
	}
	return value;
};


})();
