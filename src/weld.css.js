/*
 * This sub-module extends Weld to dynamically convert Weld <--> HTML
 */

;(function(){
let typeifclause	= 100,
	typeselector	= 200,
	typekeyframes	= 250,
	typeprint		= 280,
	typescreen		= 290,
	typeproperty	= 300;

/*
 * @param	line	command.line
 * @return	Object	{ id, classes, line }
 */
function extractselectors(line, options) {
	var tag = {
		id: [],
		classes: [],
		data: [],
		datavalues: [],
	};
	
	var matches = line.match(/\#([a-zA-Z0-9\-]*)/g) || '';
	if (matches.length) {
		for (var j in matches) {
			var attrib = matches[j].match(/\#([a-zA-Z0-9\-]*)/);
			if (attrib) {
				tag.id.push( attrib[1] );
			}
		}
	}

	// .class .class .class
	matches = line.match(/\.([a-zA-Z0-9\-\_]*)/g) || '';
	if (matches.length) {
		for (var j in matches) {
			var attrib = matches[j].match(/\.([a-zA-Z0-9\-\_]*)/);
			if (attrib) {
				tag.classes.push( attrib[1] );
			}
		}
	}

	// [data-*] auto uglify the * part
	matches = line.match(/\[data\-([a-zA-Z0-9\-\_\=\'\"]*)\]/g) || '';
	if (matches.length) {
		for (var j in matches) {
			var attrib = matches[j].match(/\-([a-zA-Z0-9\-\_\=\'\"]*)/);
			if (attrib) {
				var splat = attrib[1].split('=');
				tag.data.push( splat[0] );
				if (
					splat[1] && 
					( !splat[1].startsWith('\'') && !splat[1].startsWith('\"') )
				)
					tag.datavalues.push( splat[1] );
			}
		}
	}


	// replacer
	if (options.map) {
		// undefined in mapit returns the key itself
		var uglify = options.uglify || undefined;
		
		// map ids, classes, ...
		for (var k in tag.id) {
			var value = Weld.map_key(options.map, tag.id[k], uglify);
			line = line.replace('#'+tag.id[k], '#'+value);
		}
		for (var k in tag.classes) {
			var value = Weld.map_key(options.map, tag.classes[k], uglify);
			line = line.replace('.'+tag.classes[k], '.'+value);
		}
		for (var k in tag.data) {
			var value = Weld.map_key(options.map, tag.data[k], uglify);
			line = line.replace('[data-'+tag.data[k], '[data-'+value);
		}
		for (var k in tag.datavalues) {
			var value = Weld.map_key(options.map, tag.datavalues[k], uglify);
			line = line.replace('='+tag.datavalues[k]+']', '='+value+']');
		}
	}
	
	return line;
}
function extracttheme(parsedslang, options) {
	parsedslang = parsedslang || [];
	var outslang	= [],
		outtheme	= [],
		dictionary	= [],
		invalue		= false,
		inproperty	= false,
		inselector	= false,
		inifclause	= false;
		
	for (var i in parsedslang) {
		dictionary[parsedslang[i].uid] = parsedslang[i];
	}

	for (var i in parsedslang) {
		
		var command				= parsedslang[i],
			hasthemevariable	= ( command.line.indexOf('@') > -1 );

		if (command.level === 0) {
			if (command.line.startsWith('if ')) {
				inselector	= false;
				inifclause		= true;
			} else {
				inifclause	= false;
				inselector		= true
			}
			inproperty = false;
		}
		if (command.level === 1) {

			if (inifclause) {
				
				inselector = true;
				inproperty = false;
				
			}
			else
			if (inselector) {

				if ( hasthemevariable ) inproperty = true;

			}

		}
		if (command.level === 2 && inselector) {
			
			if ( inifclause && hasthemevariable ) inproperty = true;
			
		}

		invalue = false;
		if (inproperty) {
			if (inifclause) {
				if (command.level >= 3) invalue = true;
			}
			else
			if (inselector) {
				if (command.level >= 2) invalue = true;
			}
		}

		if ( hasthemevariable && command.level > 0 ) {
			if ( command.parent !== command.root ) {
				if ( outtheme.indexOf( dictionary[command.root] ) === -1 ) {
					if (dictionary[command.root])
						outtheme.push( dictionary[command.root] );
				}
			}
			if ( outtheme.indexOf( dictionary[command.parent] ) === -1 ) {
				if (dictionary[command.parent])
					outtheme.push( dictionary[command.parent] );
			}
			if (command)
				outtheme.push( command );
		} else {
			// check if this is a value concatenation and its parent has
			// a variable
			if ( invalue ) {
				if (command)
					outtheme.push( command );
			} else {
				outslang.push( command );
			}
		}

	}

	return {
		theme: outtheme,
		slang: outslang,
	};
}
function buildtheme(theme, options) {
	// cheap hack to remove useless single tab on empty new lines
	theme = theme.replace(/\n\t\n/g, '\n');

	theme = theme.replace(/\'/g, '\\\'');
	theme = 'return \''+ theme.replace(/\n/gm, '\'\n+\'\\n') + '\';';
	
	var uglify = (!options.debug && options.uglify) || undefined;
	
	theme = theme.replace(/\@media/g, '___media___');
	
	var re = /\:(.*)\@([\w]*)/;
	while ( theme.match(re) ) {
		theme = theme.replace(re, function (full, before, name) {
			var value = Weld.map_key(options.map, name, uglify);

			return ':'+before+'\'+o.'+value+'+\'';
		});
	}
	
	theme = theme.replace(/\_\_\_media\_\_\_/g, '@media');
	return theme;
}
/*
 * calcs what a css prop : value pair should be rendered to
 * any math expressions using vars are calc'd first
 */
function _rendervalue(value) {
	return value;
}
function _rendername(value) {
	return value;
}
// to dom string
function _renderselector(tag, tabs, options) {

	var _			= options._,
		selector	= tag.line;
	
	tabs = tabs || '';
	var rendered	=	''
					+	tabs
					+	extractselectors( selector, options )
					+	_.space
					+	'{';
	
	for (var i in tag.children) {
		rendered	+=	''
					+	_.slashn
					+	tabs
					+	_.tabs
					+	_rendername( tag.children[i].name )
					+	':'
					+	_rendervalue( tag.children[i].value )
					+	';';
	}
	
	return	''
			+	_.slashn
			+	rendered
			+	_.slashn
			+	tabs
			+	'}';
}
function _renderscreen(tag, options) {
	
	var _ = options._;

	var line =	tag.line.replace('screen', '@media screen');
	
	var rendered	=	line
					+	_.space
					+	'{';
	
	for (var i in tag.children) {
		rendered += _renderselector( tag.children[i], _.tabs, options );
	}
	
	return	''
			+	_.slashn
			+	rendered
			+	_.slashn
			+	'}';

}
function _renderprint(tag, options) {
	
	var _ = options._;

	var line =	tag.line.replace('print', '@media print');
	
	var rendered	=	line
					+	_.space
					+	'{';
	
	for (var i in tag.children) {
		rendered += _renderselector( tag.children[i], _.tabs, options );
	}
	
	return	''
			+	_.slashn
			+	rendered
			+	_.slashn
			+	'}';

}
function _renderkeyframes(tag, options) {
	
	var _ = options._;

	var line =	tag.line.replace('kf', '@keyframes');
	
	var rendered	=	line
					+	_.space
					+	'{';
	
	for (var i in tag.children) {
		rendered += _renderselector( tag.children[i], _.tabs, options );
	}
	
	return	''
			+	_.slashn
			+	rendered
			+	_.slashn
			+	'}';

}
function _renderifclause(tag, options) {
	
	var _ = options._;

	var line =	tag.line.replace('if', '@media');
	var re = /\s*([\w\S\-]*)\s*\=\s*([\w\S\-]*)\s*/i;
	
	while (line.match(re)) {
		line = line.replace(re, ' ($1:$2) ').trim();
	}
	
	var rendered	=	line
					+	_.space
					+	'{';
	
	for (var i in tag.children) {
		rendered += _renderselector( tag.children[i], _.tabs, options );
	}
	
	return	''
			+	_.slashn
			+	rendered
			+	_.slashn
			+	'}';

}
function _render(json, options) {
	
	var _ = options._;
	
//			var _ = $('ansi').code;
	
	var domstr		= '';
	
	for (var i in json) {
		
		var tag = json[i];
		
		if (tag.type === typeifclause) {
			domstr	+=	''
					+	_.slashn + _.tabs
					+	_renderifclause(tag, options);
		}
		else if (tag.type === typekeyframes) {
			domstr	+=	''
					+	_.slashn + _.tabs
					+	_renderkeyframes(tag, options);
		}
		else if (tag.type === typescreen) {
			domstr	+=	''
					+	_.slashn + _.tabs
					+	_renderscreen(tag, options);
		}
		else if (tag.type === typeprint) {
			domstr	+=	''
					+	_.slashn + _.tabs
					+	_renderprint(tag, options);
		}
		else if (tag.type === typeselector) {
			domstr +=	''
					+	_.slashn + _.tabs
					+	_renderselector(tag, '', options);
		}
		
	}
	
	return domstr;

}
function render(json, options) {
	options		= options || {};
	options.map	= options.map	|| {};
	
	return _render(json, options).trim();
	
}
/* TODO
 * all multiline stuff should be processed before hand using simple
 * conditions, eg, two consecutive zero tab lines should be joined
 * 
 * multiline properties with themevariables don't work yet
 * @param	Object	parsedslang
 * @param	Array	themevariables		names of vars that should be
 * 										extracted to the js theme module
 * 
 * @returns	Object	String css			
 * 					String jsthememod	
 */
function _parse(parsedslang, options) {
	var insertproperty = function (parent, line) {
		var splitup = line.split(' ');
		lastproperty = parent.push({
			name:	splitup[0],
			value:	splitup.slice(1).join(' ')
		})-1;
	};
	
	var dictionary		= [],
		tree			= [],
		lastifclause	= false,
		lastkeyframes	= false,
		lastselector	= false,
		lastscreens		= false,
		lastprints		= false,
		lastproperty	= false;
	
	for (var i in parsedslang) {
		
		var command = parsedslang[i],
			parent	= false;
			
		var selector = {
			type:			typeselector,
			uid:			parseInt(command.uid),
			classes:		[],
			id:				[],
			line:			command.line,
			children:		[]
		};
		var ifclause = {
			type:			typeifclause,
			uid:			parseInt(command.uid),
			line:			command.line,
			children:		[]
		};
		var keyframes = {
			type:			typekeyframes,
			uid:			parseInt(command.uid),
			line:			command.line,
			children:		[]
		};
		var screens = {
			type:			typescreen,
			uid:			parseInt(command.uid),
			line:			command.line,
			children:		[]
		};
		var prints = {
			type:			typeprint,
			uid:			parseInt(command.uid),
			line:			command.line,
			children:		[]
		};
		
		/*
		 * root selector
		 * properties
		 * values
		 * ifclause
		 */

		// determine parent
		// level 0
		if (command.level === 0) {
			/*
			 * we ain't assigning parent here cuz this is the root
			 * and the children will come up in the next line
			 */
			if (command.line.startsWith('if ')) {
				lastselector = false;
				lastkeyframes= false;
				lastifclause = dictionary.push(ifclause)-1;
				lastscreens	 = false;
				lastprints	 = false;
			} else
			if (command.line.startsWith('kf ')) {
				lastselector = false;
				lastifclause = false;
				lastkeyframes= dictionary.push(keyframes)-1;
				lastscreens	 = false;
				lastprints	 = false;
			} else
			if (command.line === 'screen') {
				lastselector = false;
				lastifclause = false;
				lastkeyframes= false;
				lastscreens	 = dictionary.push(screens)-1;
				lastprints	 = false;
			} else
			if (command.line === 'print') {
				lastselector = false;
				lastifclause = false;
				lastkeyframes= false;
				lastscreens	 = false;
				lastprints	 = dictionary.push(prints)-1;
			} else
			{
				lastifclause = false;
				lastkeyframes= false;
				lastselector = dictionary.push(selector)-1;
				lastscreens	 = false;
				lastprints	 = false;
			}
			lastproperty = false;

		}
		// level 1, selectors or properties
		if (command.level === 1) {

			if (lastifclause !== false) {
				
				lastselector = dictionary[lastifclause].children.push(selector)-1;
				lastproperty = false;
				
			}
			else
			if (lastkeyframes !== false) {
				
				lastselector = dictionary[lastkeyframes].children.push(selector)-1;
				lastproperty = false;
				
			}
			else
			if (lastscreens !== false) {
				
				lastselector = dictionary[lastscreens].children.push(selector)-1;
				lastproperty = false;
				
			}
			else
			if (lastprints !== false) {
				
				lastselector = dictionary[lastprints].children.push(selector)-1;
				lastproperty = false;
				
			}
			else
			if (lastselector !== false) {

				insertproperty(
					dictionary[lastselector]
						.children,
					command.line
				);

			}

		}
		// level 2, properties or values
		if (command.level === 2 && lastselector !== false) {
			
			if (lastifclause !== false) {
				insertproperty(
					dictionary[lastifclause]
						.children[lastselector]
							.children,
					command.line
				);
			} else if (lastkeyframes !== false) {
				insertproperty(
					dictionary[lastkeyframes]
						.children[lastselector]
							.children,
					command.line
				);
			} else if (lastscreens !== false) {
				insertproperty(
					dictionary[lastscreens]
						.children[lastselector]
							.children,
					command.line
				);
			} else if (lastprints !== false) {
				insertproperty(
					dictionary[lastprints]
						.children[lastselector]
							.children,
					command.line
				);
			} else if (lastproperty !== false) {
				dictionary[lastselector].children[lastproperty].value += ' '+command.line;
			}
			
		}
		// level 3+, values only
		if (command.level >= 3 && lastproperty !== false) {
			if (lastifclause !== false) {
				dictionary[lastifclause]
					.children[lastselector]
						.children[lastproperty].value += ' '+command.line;
			} else if (lastkeyframes !== false) {
				dictionary[lastkeyframes]
					.children[lastselector]
						.children[lastproperty].value += ' '+command.line;
			} else if (lastscreens !== false) {
				dictionary[lastscreens]
					.children[lastselector]
						.children[lastproperty].value += ' '+command.line;
			} else if (lastprints !== false) {
				dictionary[lastprints]
					.children[lastselector]
						.children[lastproperty].value += ' '+command.line;
			} else if (lastselector !== false) {
				dictionary[lastselector].children[lastproperty].value += ' '+command.line;
			}

			
		}

	}
	
	for (var i in dictionary) {
		if (dictionary[i].children.length > 0) {
			tree.push(dictionary[i]);
		}
	}
	
	return {
		tree: tree,
		map: options.map
	};
}
function parse(parsedslang, options) {
	parsedslang = parsedslang || [];
	options = options || {
			compress: false,
			uglify: false,
			map: {}
		};
		
	var _ = options._ = {
		tabs	: '	',
		slashn	: '\n',
		space	: ' '
	};
	
	if (options.compress) {
		_ = options._ = {
			tabs	: '',
			slashn	: '',
			space	: ''
		};
	}
	
	options.map	= options.map	|| {};

	var theme			= [],
		tree			= [],
		result			= false;

	var inslang = extracttheme( parsedslang, options );

	theme		= inslang.theme;
	parsedslang	= inslang.slang;

	// BUGFIX here extracttheme was inserting an undefined in the returned array causing _parse to fail
	// TODO backport to root Weld folder altho I've never seen this error occur there
	
	result	= _parse(theme,		options);
	theme	= result.tree;
	Object.assign( options.map, result.map );

	result	= _parse(parsedslang,	options);
	tree	= result.tree;
	Object.assign( options.map, result.map );
	
	var rendered = render( tree, options );
	
	var parsedhtm	= '<style>'
					+ _.slashn
					+ rendered
					+ _.slashn
					+ '</style>'
					+ _.slashn
					// handled by themes module now
					/*+ '<style id=dynamicstyle></style>'*/;

	var uglify = (!options.debug && options.uglify) || undefined;
	var themefnname = Weld.map_key(options.map, 'updatetheme', uglify);

	var renderedtheme = buildtheme( render( theme, options ), options )
	
	var style_only = parsedhtm;
	
	var rawjs = '', script_only = '';
	if (options.linkify) {
		if (!options.xaadim)
		rawjs += 	_.slashn
					+ 'function '+themefnname+'(o)'+_.space+'{'
					+ _.slashn
					+ renderedtheme
					+ _.slashn
					+ '};'
					+ _.slashn;
		
		script_only = rawjs;
	}
	else {
		parsedhtm	+= _.slashn
					+ '<script>'
					+ _.slashn
					+ 'function '+themefnname+'(o)'+_.space+'{'
					+ _.slashn
					+ renderedtheme
					+ _.slashn
					+ '};'
					+ _.slashn
					+ '</script>';
	}
	
	return {
		rawjs:	rawjs			,
		parsed:	parsedhtm		,
		map:	options.map		,
		style:	style_only		,
		script:	renderedtheme	,
	};
	
}

Weld.parse_css = parse;

Weld.decode_css = function ( text ) {
	return parse( Weld.parse_weld( text ) );
};
/* TODO this doesn't work just yet, needs more dev
 * converts css back to weld, each child level is represented by a \t
 * takes an css object, return string weld
 * */
Weld.encode_css = function (obj, tabs) {
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
};

})();
