/*
	Slang - 30 Jul 2018
*/

;(function () {
	'use strict';

	var Cli		= false,
		Js		= false,
		Htm		= false,
		Files	= false,
		Css		= false;
		
	var debug = false,
		verbose = false;

	var sortobject = function (o) {
		var sorted = Object.keys(o).sort(function (a, b) {
			return b.length - a.length
		});
		var o2 = {};
		sorted.forEach(function (item) {
			o2[ item ] = o[ item ];
		});
		return o2;
	};
	var jsxporeplacer = function (text, options) {
//		if (options.uglify)
		for (var w in options.words) {
			options.map[options.words[w]] = _mod.mapit(options.map, options.words[w], options.uglify);
//			$.log( options.words[w], options.map[options.words[w]] );
			text = text.replace(new RegExp('XPO.('+options.words[w]+')', 'gm'), function (ignore, key) {
				return options.map[key];
			});
			// { propname: } replacer
			text = text.replace(new RegExp('([ \t]*)\\b('+options.words[w]+')[ \t]*\\:', 'gm'), function (ignore, tabs, key) {
//				$.log( tabs, '-:-', key );
				return tabs+options.map[key]+':';
			});
			text = text.replace(new RegExp('\\.('+options.words[w]+')\\b', 'gm'), function (ignore, key) {
				return '.'+options.map[key];
			});
		}
//		$.log( text.replace(/\.\./gm, ' ')
//				   .replace(/\s[\s]+/gm, ' ')
//		);

		options.map = sortobject( options.map );
		return text;
	};

	var _mod = {
		_uglyseed: 'ثحخقضصطظذا',
//		_uglyseed: 'aeiouyxqwp',
//		_uglyseed: 'aeiouyüöäß',
		_uglyuid: 0,
		_pickingsuid: 0,
		_pickings: [],
		/*
		 * converts json back to weld, each child level is represented by a \t
		 * @param	Object	a json object
		 * @return	String	weld
		 * */
		toslang: function (obj, tabs) {

			var weld	= '',
				tabs	= tabs || 0,
				filler	= Cli.getfiller(obj);

			for (var i in obj) {
				var sub = obj[i];

				if (typeof sub === 'object') {
					if (!(sub instanceof Array && sub.length === 0)) { // ignore empty arrays
						weld += '\t'.repeat(tabs) + i + '\n';
						weld += ( _mod.toslang( sub, tabs+1 ) );
					}
				} else {
					if (obj instanceof Array) {
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
		/*
		 * this function adds the value to the map if it isn't already there
		 * if value === true, it'll auto gen unique uglykey
		 * mapit( map, key, value )
		 * mapit( map, value ) // uses value as both key & value
		 */
		mapit: function (map, key, value) {
			if (value === undefined) value = key;
			if (map[key] === undefined) {
				if (value === true) {
					if (debug) {
						value = '_'+key+'_';
					} else {
						value = _mod.uglifykey();
					}
				}
				map[key] = value;
			} else {
				return map[key];
			}
			return value;
		},
		uglify: function (UGLY, parsedmulti, options) {
			if (options.uglify === true) {
				var sortedUGLY = [];
				
				// this allows UGLY.somethingUGLY.otherstuff
				parsedmulti = parsedmulti.replace(/UGLY\./g, '%UGLY%.');
				
				parsedmulti.replace(/\%UGLY\%\.(\w*)/gm, function (ignore, key) {
					if (key.length > 0) key = _mod.mapit(UGLY, key, true);
					return key;
				});

				
				for (var j in UGLY) {
					sortedUGLY.push(j);
				}
				sortedUGLY.sort(function (a,b) {
					return b.length - a.length;
				});
				
				for (var j in sortedUGLY) {
					parsedmulti = parsedmulti.replace( new RegExp('\\%UGLY\\%\\.'+ sortedUGLY[j], 'g'), UGLY[ sortedUGLY[j] ] );
				}
			} else {
				parsedmulti = parsedmulti.replace(/UGLY\./g, '');
			}
			return parsedmulti;
		},
		/*
		 * used when mapping an uglified key to an original key
		 * @param	String optional key
		 * @return	Uglified unique key
		 */
		uglifykey: function (key) {
			if (key === undefined) key = _mod._uglyuid++;
			
			var uglykey	= '',
				seed	= _mod._uglyseed,
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
		},
		types: {
			generic:	  0,
			htm:		100,
			css:		200,
			markdown:	300,
			plan:		400,
			page:		500,
			data:		600,
			ia:			700,
			js:			800,
			svg:		900,
		},
		parsetype: function (type) {
			switch (type) {
				case 'htm':
				case 'html':
					return _mod.types.htm;
				case 'css':
					return _mod.types.css;
				case 'js':
					return _mod.types.js;
				case 'svg':
					return _mod.types.svg;
				case 'sql':
				case 'data':
					return _mod.types.sql;
				case 'ia':
				case 'ai':
				case 'smart':
				case 'guess':
					return _mod.types.ia;
				case 'page':
					return _mod.types.page;
				case 'plan':
					return _mod.types.plan;
				case 'markdown':
					return _mod.types.markdown;
				case 'generic':
					return _mod.types.generic;
				default:
					return false;
			}
		},
		linenumber: function (num, total) {
			num = parseInt(num) || 0;
			total = total || num;
			total < num ? total = num : '';
			return '0'.repeat(total.toString().length-num.toString().length)+num;
		},
		/*
		 * callback immediately if sync is true else wait
		 * @callback (path, data)
		 */
		getfile: function (sync, path, callback, level) {
			if (verbose)
				$.log.s( '	'.repeat(level), path.split('/').pop() );

			if (sync) {

				try {
					var data = Files.get.file(path);
				} catch (e) {
					throw e;
				} finally {
					callback(path, data);
					return false;
				}
				
			} else {

				Files.get.file(path, function (data) {
					callback(path, data);
				});

			}

		},
		/*
		 * gets all files using the provided function
		 * concats them
		 * @returns String data
		 */
		getall: function (sync, entrypoint, finalcallback, level) {
			var alldata = '',
				loaded	= {},
				level	= level || 0;
			
			/* get the entrypoint data
			 * get any includes inside
			 * 
			 */
			var callback = function (path, data) {
				data = data || '';

//				$.log.s( '	'.repeat(level), 'parsing', path );
				loaded[path]	=	data.toString();
				
//				if (!path.endsWith('.w')) alldata += '\n+ignore\n';
				
				alldata		 	+=	loaded[path];
//				$.log.s( (loaded[path].length / 1024) . toFixed(1) + '\t' + path );

//				if (!path.endsWith('.w')) alldata += '\n-ignore\n';
				
				var includes	= loaded[path].match(/^[\t]*\+include (.*)/gm),
					q			= $.queue(),
					count		= 0;
				
				var worker = function (done, queue) {
					if (includes[count]) {
//						$.log.s( includes[count] );
						
						var tabs = (includes[count].match(/^(\t)*/)[0] || '').length;
						var extractedpath = includes[count].replace(/^\t*/, '');
						extractedpath = extractedpath.substr(9);
						var fullpath = extractedpath;
						
						// check if it has any dirs in it
						var dirs = entrypoint.split('/');
						if (dirs.length > 1) {
							fullpath = dirs.slice(0, -1).join('/') + '/' + extractedpath;
						}
						
//						$.log.s( '	'.repeat(level), '+include', fullpath, 'tabs: ', tabs );
						++count;
						_mod.getall(sync, fullpath, function (blah, newdata) {
							if (tabs > 0) {
								var tabbeddata = '';
								newdata.split('\n').forEach(function (elt) {
									tabbeddata += '\n' + ('\t'.repeat(tabs)) + elt;
								});
								newdata = tabbeddata;
							}
//							$.log.s( newdata );
							
							alldata = alldata.replace(/^\t*\+include (.*)/gm, function (orig, sel) {
								if (sel === extractedpath) {
									return newdata;
								}
								return orig;
							});
							done(queue);
						}, level+1);
					} else {
						++count;
						done(queue);
					}
				};

				for (var i in includes) {
					q.set(worker);
				}

				q.run(function () {
//					$.log.s( '	'.repeat(level), 'onfinish' );
					// TODO improve this, only \n---\n should allow splitting
//					alldata = alldata.split('---')[0];
					finalcallback( entrypoint, alldata );
				});
			};
			
			_mod.getfile(sync, entrypoint, callback, level);
		},
		/*
		 * converts .w text to json
		 * trims, replaces tabs, relaces consecutive \s \t
		 * splits by line, leaving out empty lines
		 * adds root, parent relationships
		 */
		parse: function ( text ) {
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

//					$.log.s(
//						_mod.linenumber(i, text.length),
//						_mod.linenumber( (levels[level-1]), text.length ),
//						'	'.repeat(level), line,
//						'---------', levels
//					);
					
					// remember this level
					lastlevel = level;
					
				}
				
			}
			
			return parsedlines;
		},
		words: function ( text ) {
			if (typeof text !== 'string') $.log('text needs to be string');
			
			text = (text || '');
			
			var lines = [],
				words = [];
			
			text = ( text || '' ).split('\n');
			for (var i in text) {
				var line = text[i];
				
				// replace those tabs at the beginning
				line = line.replace(/^(\t*)(.*)/i, '$2');
				
				// replace consecutive tabs+spaces with just one space
				line = line.replace(/([\t ]+)/gi, ' ');
				
				// trim
				var line = line.trim();
				
				// uglify lifes
				if (line.startsWith('//+')) {
					lines.push( line.substr(3) );
				}
				
			}
			
			lines.forEach(function (line) {
				line.trim().split(' ').forEach(function (word) {
					word = word.trim();
					if (words.indexOf(word) === -1)
						words.push( word );
				});
			});
			
			return words;
		},
		/*
		 * splits using markers like +html
		 * takes parsed weld
		 * each marker can have its own unique id by default ++uid
		 * 		+htm +html +mu +markup
		 * 		+css +style
		 * 		+data
		 * 		+plan
		 * 		+markdown +md
		 * 		+page
		 * 		+js
		 * 		+ia +smart +guess
		 * 
		 * @returns	Array	sections	commands divided into sections
		 */
		splitter: function ( parsedweld ) {
			
			var sections	= [],
				lastsection	= false,
				sectiontype	= false,
				sectionname	= false,
				uid			= 0,
				ignore		= false;
			
			for (var i in parsedweld) {
				var command = parsedweld[i];
				
				// is this a marker
				var ismarker = command.line.startsWith('+');
				var matches = command.line.match(/^\+(\w*)* *(\w*)*/) || [];
				
				if (ismarker) {
					var tmpsectiontype = _mod.parsetype(matches[1]) || sectiontype;
					
//					$.log.s( tmpsectiontype === sectiontype, _mod.types[tmpsectiontype] );
					
					if (tmpsectiontype !== false) {
						if (tmpsectiontype !== sectiontype) {
							
							sectiontype = _mod.parsetype(matches[1]) || sectiontype;
							sectionname = matches[2] || ++uid;
						} else {
							ismarker = false;
						}
					} else {
						ismarker = false;
					}
					
				} else {
					// ignore
					ismarker = false;
//					sectiontype = 'ignore';
//					sectionname = ++uid;
				}
				
				// if no section, assume it's +htm
				if (!lastsection || ismarker) {
					
					// push it plus remember it
					lastsection = {
						type:	sectiontype,
						name:	sectionname,
						commands:	[]
					};
					sections.push(lastsection)
					
				} else {
					
					lastsection.commands.push(command);
					
				}

			}
				
			return sections;

		},
		/*
		 * after we get all files and replace it all, and split into array items
		 * the js parts can easily mess up htm when inline
		 * so before doing further processing, js is picked up, replaced with
		 * special markers, these markers look like
		 * script
		 * 		'[%weld-script-marker-1%]'
		 * so htm.w just surrounds it with a regular script tag with text
		 * that text later gets a drop in replacement of the script we picked up
		 * */
		pickjs: function (sections, parent) {
			var parent = parent || _mod.findinhtmsections(sections, 'body');

			var lastsection = {}, lastrefinedsection = {}, refinedsections = [];
			for (var i in sections) {
				var section = sections[i];
				
				if ( lastsection.type === _mod.types.htm
					&& section.type === _mod.types.js ) {

					var puid = _mod._pickings.push( Object.assign({}, section) )-1;
					
					var tmpcmd = lastsection.commands[lastsection.commands.length - 1];
					var root = parent.uid;
					
					lastsection.commands.push({
						uid		:	tmpcmd.uid+1						,
						line	:	'script'							,
						level	:	2									,
						root	:	root								,
						parent	:	root
					});
					
					lastsection.commands.push({
						uid		:	tmpcmd.uid+2							,
						line	:	'\'[%weld-script-marker-'+puid+'%]\''	,
						level	:	3										,
						root	:	root									,
						parent	:	tmpcmd.uid+1
					});
				}
				
				lastsection = sections[i];
			}

			for (var i in sections) {
				var section = sections[i];
				
				if (!( lastsection.type === _mod.types.htm
					&& section.type === _mod.types.js )) {

					var tmpid = refinedsections.push(section);
					lastrefinedsection = refinedsections[tmpid-1];
				}
				
				lastsection = sections[i];
			}
			return refinedsections;
		},
		pickcss: function (sections) {
			var parent = _mod.findinhtmsections(sections, 'head');

			var lastsection = {}, lastrefinedsection = {}, refinedsections = [];
			for (var i in sections) {
				var section = sections[i];
				
				if ( lastsection.type === _mod.types.htm
					&& section.type === _mod.types.css ) {
					
					if (verbose == 5)
						section.commands.forEach(function (c) {
							$.log.s( c.line );
						});

					var puid = _mod._pickings.push( Object.assign({}, section) )-1;
					
					var tmpcmd = lastsection.commands[lastsection.commands.length - 1];
					var root = lastsection.commands[0].uid;
					
					lastsection.commands.push({
						uid		:	tmpcmd.uid+1						,
						line	:	'style'								,
						level	:	2									,
						root	:	parent.uid							,
						parent	:	parent.uid
					});
					
					lastsection.commands.push({
						uid		:	tmpcmd.uid+2							,
						line	:	'\'[%weld-style-marker-'+puid+'%]\''	,
						level	:	3										,
						root	:	parent.uid								,
						parent	:	tmpcmd.uid+1
					});
				}
				
				lastsection = sections[i];
			}

			for (var i in sections) {
				var section = sections[i];
				
				if (!( lastsection.type === _mod.types.htm
					&& section.type === _mod.types.css )) {
						
					var tmpid = refinedsections.push(section);
					lastrefinedsection = refinedsections[tmpid-1];
				}
				
				lastsection = sections[i];
			}
			return refinedsections;
		},
		picksvg: function (sections, parent) {
			var parent = parent || _mod.findinhtmsections(sections, 'body');
			
			var lastsection = {}, lastrefinedsection = {}, refinedsections = [];
			for (var i in sections) {
				var section = sections[i];
				
				if ( section.type === _mod.types.svg ) {

					var puid = _mod._pickings.push( Object.assign({}, section) )-1;
					
					var root = lastsection.commands[0].uid;
					
					lastsection.commands.push({
						uid		:	parent.uid+1						,
						line	:	'svg'								,
						level	:	2									,
						root	:	parent.uid							,
						parent	:	parent.uid
					});
					
					lastsection.commands.push({
						uid		:	parent.uid+2										,
						line	:	'\'[%weld-svg-marker-'+puid+'%]\''	,
						level	:	3													,
						root	:	parent.uid											,
						parent	:	parent.uid+1
					});
				}
				
				lastsection = sections[i];
			}

			for (var i in sections) {
				var section = sections[i];
				
				if (!( section.type === _mod.types.svg )) {
					var tmpid = refinedsections.push(section);
					lastrefinedsection = refinedsections[tmpid-1];
				}
				
				lastsection = sections[i];
			}
			return refinedsections;
		},
		dropall: function (parsed, options, UGLY) {
			parsed = parsed || '';
			var result = {}, finalresult = {}, rawjs = '', rawcss = '';
			
			for (var i in _mod._pickings) {
				var section = _mod._pickings[i];
				if (section.type === _mod.types.svg) {
					
					parsed	= parsed.replace( '<svg>[%weld-svg-marker-'+i+'%]</svg>', _mod.rawsection(section) );

				}
				else if (section.type === _mod.types.css) {
					
					result	= Css.parse(section.commands, options);
					if (options.linkify) {
						rawjs += result.rawjs;
					}
					parsed	= parsed.replace('<style>[%weld-style-marker-'+i+'%]</style>', result.parsed);
					Object.assign( options.map, result.map );
					Object.assign( UGLY, result.map );

				}
				else if (section.type === _mod.types.js) {
					result	= Js.parse(section.commands, options);
					result.parsed = jsxporeplacer(result.parsed, options);
					if (options.linkify) {
						rawjs += result.parsed;
						parsed = parsed.replace('<script>[%weld-script-marker-'+i+'%]</script>', function () {
							// TODO add ROOT support for script src "/"
							if (options.client)
							return '<script src=JAZAR/a.js></script>';
							else
							return '<script src=JAZAR/&.js></script>';
						});
					} else {
						parsed = parsed.replace('[%weld-script-marker-'+i+'%]', function () {
							return result.parsed;
						});
					}
					Object.assign( options.map, result.map );
				}
			}
			
			parsed = parsed.replace(/BUILDNUMBER/g, options.buildnumber);
			rawjs = rawjs.replace(/BUILDNUMBER/g, options.buildnumber);

			parsed = parsed.replace(/PRODUCTION/g, options.production);
			rawjs = rawjs.replace(/PRODUCTION/g, options.production);

			finalresult.parsed = parsed.replace(/APPNAME/g, options.appname);
			finalresult.rawjs = rawjs.replace(/APPNAME/g, options.appname);

			finalresult.rawcss = rawcss;

			return finalresult;
		},
		sorthtm: function (sections) {
			var sortedsections = [];
			
			// pickout non-htm sections
			sections.forEach(function (section) {
				if (section.type !== _mod.types.htm) {
					sortedsections.push(section);
				}
			});

			// create a mega htm only section
			var megahtmsection = {
				type:	_mod.types.htm,
				name:	sortedsections.length,
				commands:	[]
			};
			
			/*
			 * from the old sections, pick htm sections
			 * reorder their commands into the mega htm section
			 * */
			var uid = 0;
			sections.forEach(function (section) {
				if ( section.type === _mod.types.htm ) {
					section.commands.forEach(function (command) {
						megahtmsection.commands.push(command);
					});
				}
			});
			
			// push it after other sections
			sortedsections.push(megahtmsection);
			
			return sortedsections;
		},
		findinhtmsections: function (sections, str) {
			var found = '';
			
			sections.forEach(function (section) {
				if ( section.type === _mod.types.htm ) {
					section.commands.forEach(function (command) {
						if (command.line.startsWith(str)) {
							found = command;
						}
					});
				}
			});
			
			return found;
		},
		rawsection: function (section) {
			var tmp = '';
			section.commands.forEach(function (elt) {
				tmp += ( '\t'.repeat(elt.level) ) + elt.line +'\n';
			});
			return '\n'+tmp+'\n';
		},
		/*
		 * removes sections marked with "{-admin"
		 * 								"}-admin"
		 * */
		removeadmin: function (text) {
			var text2 = [], adminsection = false;
			text = text.split('\n');
			for (var i in text) {
				// makes it not include this startmarker in the parsed version
				if (text[i].trim().startsWith('{-admin'))
					adminsection = true;

				if (!adminsection)
					text2.push(text[i]);
				
				// makes it only include text after this marker
				if (text[i].trim().startsWith('}-admin'))
					adminsection = false;
			}
			return text2.join('\n');
		},
		/*
		 * remove }|{-admin markers
		 * */
		stripadmin: function (text) {
			return text.replace(/\{\-admin/g, '').replace(/\}\-admin/g, '');
		},
		/*
		 * removes sections marked with "{-client"
		 * 								"}-client"
		 * */
		removeclient: function (text) {
			var text2 = [], clientsection = false;
			text = text.split('\n');
			for (var i in text) {
				// makes it not include this startmarker in the parsed version
				if (text[i].trim().startsWith('{-client'))
					clientsection = true;

				if (!clientsection)
					text2.push(text[i]);
				
				// makes it only include text after this marker
				if (text[i].trim().startsWith('}-client'))
					clientsection = false;
			}
			return text2.join('\n');
		},
		/*
		 * remove }|{-client markers
		 * */
		stripclient: function (text) {
			return text.replace(/\{\-client/g, '').replace(/\}\-client/g, '');
		},
		xpo: function (text, options) {
			options.map = options.map || {};
			
			text = text.replace(/XPO.(\w*)/gm, function (ignore, key) {
				if (key.length > 0) {
					if (options.uglify) {
						key = _mod.mapit(options.map, key, options.uglify);
					} else {
						options.map[key] = key;
					}
				}
				return key;
			});
			
			return text;
		},
		/* PWA generator
		 * uses +markers to sense what language to parse to
		 * splits first, parses and joins later
		 * +include path
		 * +html
		 * +css
		 * +data
		 * 
		 * IMPORTANT there needs to be at least a body tag in main.htm.w
		 * 			 otherwise none of this works
		 * 
		 * @param	String		entrypoint	.w filepath to parse (don't pass in the actual file data)
		 * @param	Function	callback	called when done with err, result
		 * 			Object		options		sync, ...
		 */
		multi: function (entrypoint, cboroptions, options) {
			
			_mod._pickings = [];

			var sync		= typeof cboroptions !== 'function',
				parsedmulti	= '', rawjs = '', rawcss = '';
				
			if (cboroptions instanceof Object && sync) options = cboroptions;
			options			= options || {};
			var prespace    = options.prespace || '';

			options.buildnumber	= options.buildnumber || 0;
			options.buildnumber = parseInt(options.buildnumber);
			++options.buildnumber;
			
			verbose = options.verbose;
			
			if (options.silent !== true)
				Cli.echo(
					prespace+
					' ~blue~ ^bright^', options.production ? 'pro' : 'dev',
					' ~~',
					' #', options.buildnumber,
					' ~~ ',
					options.appname
				);
			
//			options.compress	= true;
//			options.uglify		= true;
			debug				= options.debug || false;
			
			options.map			= options.map || {};

			/* 
			 * get all files included + concat'd + parsed
			 */
			_mod.getall(sync, entrypoint, function (path, data) {
//				$.log.s( 'finalcallback', path, data );

				var text = data.toString();
				
				if (options.jsmode) {
					result	= Js.process(text, options);
					parsedmulti = result.code;
				}
				else {
					// admin only code
					if (options.admin)
						text = _mod.stripadmin(text);
					else
						text = _mod.removeadmin(text);
					
					// client only code
					if (options.client)
						text = _mod.stripclient(text);
					else
						text = _mod.removeclient(text);
					
					text = _mod.xpo( text, options );
					
					options.words = _mod.words( text );
					
					options.words.forEach(function (w) {
						if (options.uglify) {
							_mod.mapit(options.map, w, options.uglify);
						} else {
							options.map[w] = w;
						}
					});
					
					options.words.sort(function (a, b) {
						return b.length - a.length;
					});

//					$.log( options.map );

					text = _mod.uglify( options.map, text, options );

					var parsedweld	= _mod.parse( text ),
						sections	= _mod.splitter( parsedweld ),
						lastsection	= false;

					sections	= _mod.pickcss(	sections );
					sections	= _mod.pickjs(	sections );
					sections	= _mod.picksvg(	sections );
					sections	= _mod.sorthtm(	sections );

					for (var i in sections) {
						
						var section	= sections[i],
							parsed	= '',
							result	= false;
						
						if (section.type === _mod.types.htm) {
							
							result	= Htm.parse(section.commands, options);
							parsed	= result.parsed;
							Object.assign( options.map, result.map );
							if (typeof result.dictionary === 'object') {
								options.dictionary = {};
								Object.assign( options.dictionary, result.dictionary );
							}
							
						}
						
						parsedmulti	+= '\n'+parsed;
						lastsection	= section[i];
					}

					if (verbose == 2)
						$.log.s( parsedmulti );
					
					var droppings = _mod.dropall(parsedmulti, options, options.map);

					parsedmulti = droppings.parsed;
					
					if (options.linkify) {
						rawjs += droppings.rawjs;
					}
						
					if (verbose == 4) {
						$.log.s( parsedmulti );
					}

					Files.set.file('xpo.w', _mod.toslang( options.map ) );
					
					if (!sync) cboroptions( parsedmulti.trim() );
				}
			});
			

			return {
				rawcss:			rawcss,
				rawjs:			rawjs,
				parsed:			parsedmulti.trim(),
				buildnumber:	options.buildnumber,
				map:			options.map
			};

		},
		init: function () {
			Cli		=	require('../../src/cli');
			Htm		=	require('./htm');
			Css		=	require('./css');
			Js		=	require('./js');
			Files	=	require('../../src/files');
			
			Js.init(_mod, Files);
			Htm.init(_mod);
			Css.init(_mod, Files);
		}
	};
	
	module.exports = _mod;
})();
