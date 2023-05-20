/*
 * this mod can
 * install > project dirs + basic files, also updates glatteis ifdef
 * 		build/ (tmp build files)
 * 		releases/
 * 		etc/
 * 			glatteis.js (server)
 * 		src/
 * 		dev-public/
 * 		public/ after build, :3100 uses server from src/
 * 			app.js (gen'd using config)
 * 		node_modules/
 * 		tests/
 * 		index.js
 * 		package.json
 * 		tabee3ah.slang
 * import > modules to etc/glatteis.js
 * create > modules under src/
 * build > use tabee3ah.slang to build the project
 * 
 */

;(function(){
	'use strict';
	var Cli, Hooks, Files, Uglify, Wrap, Slang, Configure, Database, Data,
		Release,
		glatteisroot		= process.env.HOME+'/Documents/projects/glatteis/',
		nmodulesroot		= process.env.HOME+'/Documents/projects/glatteis/node_modules/',
		devroot				= process.env.HOME+'/Documents/projects/glatteis/dev-public/',
		taraajimroot		= process.env.HOME+'/Documents/projects/glatteis/taraajim/',
		eqonaatroot			= process.env.HOME+'/Documents/projects/glatteis/eqonaat/',
		translationspath	= 'taraajim/';

	var Repl = {
		mode: 0, // single command
		/* cd sets this to false again
		 * cache of files+folder stats below the current dir
		 */
		cache: false,
		commands: (
					'exit quit install import create build release eqonaat setup '
				   +'cd cwd start stop restart info configure help database '
				   +'network permissions test doc modules '
				  ).split(' ').sort(),
		config: {},
		currentpath: false,
		setup: function (args) {
			if (Repl._isinstalled() === false) return;
			
			var conf = Repl.getconfig();

			if (!conf.local) {
				Cli.echo( '\n ~red~ ! ~~ only works for local apps \n' );
				return;
			}
			
			if (args.keys.kaios) {
				/* TODO URGENT
				 * glatteis/bases/<base>/
				 * 					main.js
				 * 					script.js.slang
				 * 					...
				 * also auto imports+includes certain modules
				 * 
				 * */
			} else {
				Cli.echo( '\n ~red~ ! ~~ please specify a base ^bright^glatteis setup -base' );
				Repl.list('bases', ['basic', 'kaios']);
				Cli.echo();
			}
		},
		indextranslation: function (path, filename, languages, translations) {
			var splat = filename.split('.');
			var langname = splat[0];
			var ext = splat.pop();
			if (languages.includes(langname) && ext == 'slang') {
				var filedata = Files.get.file(path+filename).toString();
				var parsed = Slang.parse( filedata ); 
				parsed = Slang.config.parse( parsed ); 
				
				var parsedwithxpo = {};
				
				Object.keys(parsed).forEach(function (key) {
					parsedwithxpo[ 'XPO.'+key ] = parsed[ key ];
				});
				translations[ langname ] = translations[ langname ] || {};
				translations[ langname ] = Object.assign( translations[ langname ], parsedwithxpo );
			}
		},
		updatetranslations: function (conf, path) {
			var translations = {}, languages = conf.taraajim || [];
			
			if (path) path += '/taraajim/';

			path = path||translationspath;
			
			var result = Files.get.folder(path);
			result.forEach(function (filename) {
				Repl.indextranslation(path, filename, languages, translations)
			});

			try {
				result = Files.get.folder(path+'linked');
			} catch (e) {
				if ( e.code === 'ENOENT' ) {
					Cli.echo( '\n ~red~ ! ~~ taraajim/linked not found ~blue~ i ~~ try ^bright^glatteis install~~ \n' );
					process.exit(0);
				}
			}
			result.forEach(function (filename) {
				Repl.indextranslation(path+'linked/', filename, languages, translations);
			});
			
			return translations;
		},
		/*
		 * exits the command if in single function mode or displays the prompt
		 */
		prompt: function () {
			if (Repl.mode === 0) {
				process.exit(0);
			} else {
				Cli.prompt();
			}
		},
		getdirdetails: function (path) {
			try {
				var ispath = Files.realpath(path);
				var stats = Files.stats(path);
			} catch (e) {
//				$.log.s( e );
			}
			
//			if (!ispath || !stats) return false;
			
			var dirs = {
					has: function (name) {
						return dirs.list['/'+name];
					},
					dir: function (name) {
						var obj = this.has(name);
						if (obj && obj.isDirectory() === true) return obj;
						
						return false;
					},
					file: function (name) {
						var obj = this.has(name);
						if (obj && obj.isDirectory() === false) return obj;
						
						return false;
					}
				};
				
			var list = [];
			try {
				list = Files.get.folder(ispath);
			} catch (e) {
//				$.log.s( e );
			}
			
			dirs.list = {};
			
			path = path.replace(Repl.currentpath, '');
			
			for (var i in list) {
				dirs.list[path+'/'+list[i]] = Object.create( Files.stats( ispath+'/'+list[i] ) );
			}
			
			if (!Repl.cache) Repl.cache = dirs;
			else Object.assign( Repl.cache.list, dirs.list );
			
			return dirs;
		},
		changeprompt: function (path, text, change) {
			Repl.currentpath = path;
			var cwd = (path||'~').replace(process.env.HOME, '~');
			if (text !== false && change !== false) {
				Repl.prompt('~magenta~ '+(text||'glatteis')+' ~~~blue~ '+cwd+' ~~ ');
			} else {
				Cli.setprompt('~magenta~ '+(text||'glatteis')+' ~~~blue~ '+cwd+' ~~ ');
			}
		},
		usage: function (name) {
			var str = '';
			
			['quit', 'exit'].includes(name)
									&& (str = 'exits glatteis repl')
			'install'		== name && (str = 'install glatteis')
			'import'		== name && (str = 'import modules')
			'setup'			== name && (str = 'overwrite core files with a selected <base>')
			'cd'			== name && (str = 'change directory')
			'cwd'			== name && (str = 'current working directory')
			'permissions'	== name && (str = 'checks + fixes permissions')
			'info'			== name && (str = 'shows installation status + structure')
			'release'		== name && (str = 'release using release.slang to an ssh server')
			'eqonaat'			== name && (str = 'in dev-public: gens eqonaat/* into eqonaat.svg')
			'database'		== name && (str = 'autoupgrade old schema w database.slang, optionally drop old db')
			'doc'			== name && (str = 'build README.md using comments in glatteis files')
			'help'			== name && (str = 'display this usage info')
			'start'			== name && (str = 'start listening on <port>')
			'stop'			== name && (str = 'stop server(s)')
			'restart'		== name && (str = 'stop then start')
			'test'			== name && (str = 'run a specific/all test in tests/')
			'modules'		== name && (str = 'show modules in src/')
			'create'		== name && (str = 'create a module in src/')
			'configure'		== name && (str = 'check + change tabee3ah.slang')
			'build'			== name && (str = 'build, minify, uglify')
			'network'		== name && (str = 'configure network for servers')

			return str;
		},
		commandprocessor: function (options) {
			
			switch (options.cmd[0]) {
				case '?':
				case 'usage':
				case 'help':
					Cli.echo( '\n ~blue~ usage ~~ ' );
//					Cli.echo( Repl.commands.join('\n    ') );
					
					var fill = Cli.getfiller( Repl.commands );
					
					for (var i in Repl.commands) {
						Cli.echo (
							  '    '
							+ fill( Repl.commands[i] )
							+ '    ^dim^'
							+ ( Repl.usage( Repl.commands[i] ) || '' )
							+ '``'
						);
					}
					
					Cli.echo();
					process.exit(0);
					break;
				case 'quit':
				case 'exit':
					process.exit(0);
					break;
				case 'setup':
					Repl.setup(options);
					break;
				case 'build':
					Repl.build(options);
					break;
				case 'run':
					Repl.run(options);
					break;
				case 'engine':
					Repl.engine(options);
					break;
				case 'import':
					Repl.importcore(options);
					break;
				case 'create':
					Repl.create(options);
					break;
				case 'mods':
				case 'modules':
					Repl.modules(options);
					break;
				case 'conf':
				case 'config':
				case 'configure':
					Configure.init( Repl, Cli, Files, Slang ).install( options );
					break;
				case 'db':
				case 'data':
				case 'database':
					Database.init( Repl, Cli, Files, Slang, Data ).install( options );
					break;
				case 'pub':
				case 'publish':
				case 'rel':
				case 'release':
					Release.init( Repl, Cli, Files, Slang ).install( options );
					break;
				case 'eqonaat':
					Repl.eqonaat(options);
					break;
				case 'install':
					Repl.install(options);
					break;
				case 'ls':
					var dirs = Files.get.folder( Repl.currentpath );
					if (dirs) {
						// @todo sort by size, columnize
						Cli.echo( dirs.join('\n') );
					}
					Repl.prompt();
					break;
				case 'info':
					Repl.info();

					Repl.prompt();
					break;
				case 'cwd':
					Cli.echo( Repl.currentpath );

					Repl.prompt();
					break;
				case 'up':
					options.cmd.push('..');
				case 'cd':
					Repl.cd( options );
					Repl.prompt();
					break;
				default:
					Repl.prompt();
					break;
			}
			
		},
		/*
		 * @param options String or Object
		 * */
		cd: function (options) {
			
			if (typeof options === 'string') {
				options = {
					cmd: [ 'cd', options ]
				};
			}
			
			var ispath	= false,
				isdir	= false,
				path	= options.cmd
								 .slice(1)
								 .join('/')
								 .replace('~', process.env.HOME);
			
			if ( path === '..' ) {
				path = Repl.currentpath.split('/').slice(0, -1).join('/');
			} else if ( !path.startsWith('/') ) {
				path = Repl.currentpath+'/'+path;
			}
			
			if (path === '') path = '/';

			try {
				ispath = Files.realpath( path );
			} catch (e) {
				if ( e.message.startsWith('ENOENT') ) {
					Cli.echo('\n ~red~ directory does not exist ~~\n');
				}
			}
			
			if ( ispath ) {
				isdir = Files.stats( path ).isDirectory();
				if (isdir) {
					process.chdir(ispath);
					Repl.changeprompt(ispath);
					
					Repl.cache = false;
					
					// update cache
					Repl.getdirdetails( Repl.currentpath );
				} else {
					Cli.echo('\n ~red~ not a directory ~~\n');
				}
			}


		},
		// @improve is glatteis managing this project? if tabee3ah.slang == file
		managed: function () {
			if (Repl.cache) {
				var stats = Repl.cache.has('tabee3ah.slang');
				
				if (stats && stats.isDirectory() === false) {
					return stats;
				}
			}
			return false;
		},
		// echo a green yes or a red no
		yes: function (yes) {
			if (yes) return '~green~^bright^ yes ~~';

			return '~red~^bright^ no  ~~';
		},
		// type: 0 fold, 1 file
		directoryinfo: function (type, path, details) {
			
			var bool	= type === 1 ? Repl.cache.file(path) : Repl.cache.dir(path),
				title	= type === 1 ? path+' ' : path+'/';

			Repl.echorow( bool, title, details );
			
		},
		echorow: function (bool, title, details) {
			if (typeof bool != 'string') bool = ' '+ Repl.yes( bool )	+' ';
			Cli.echo( bool + title + '^dim^ ' +details+ ' ~~' );
		},
		version: function (v) {
			var minor = v % 10;
			var major = (v - minor) % 100;
			var main = (v - major - minor);
			return (main/100)+'.'+(major/10)+'.'+minor;
		},
		/*
		 * for node webkit, kaiOS
		 * instead of dev-public, uses src for all slang+js+css files
		 * instead of public, exports to releases
		 */
		makemanifest: function (args, conf, BUILDNUMBER) {
			var origin = 'app://';
			if (conf.origin) origin += conf.origin;
			else origin += (conf.appname||conf.name)+'.xorasan';

			var manifest = {
				version: Repl.version(BUILDNUMBER),
				name: conf.appname || conf.name,
				origin: origin,
				subtitle: conf.sub || '',
				description: conf.desc || '',
				fullscreen: conf.fullscreen || '',
				background_color: conf.bg || '',
				type: conf.type,
				role: conf.role,
				launch_path: "/index.html",
				eqonaat: {
					"56": "/0.png",
					"112": "/1.png",
				},
				developer: {
					name: "Hasan Xorasani",
					url: "mailto:hxorasani@gmail.com",
				},
				locales: {
					"en-US": {
						name: conf.appname || conf.name,
						subtitle: conf.sub || '',
						description: conf.desc || '',
					}
				},
				default_locale: "en-US",
				orientation: 'default',
				chrome: {
					statusbar: 'overlap'
				},
			};
			
			if (typeof conf['activities'] == 'object') {
				manifest['activities'] = conf['activities'];
			}
			
			if (typeof conf['datastores-owned'] == 'object') {
				manifest['datastores-owned'] = conf['datastores-owned'];
			}
			
			if (typeof conf['datastores-access'] == 'object') {
				manifest['datastores-access'] = conf['datastores-access'];
			}
			
			if (typeof conf.access == 'object') {
				manifest.permissions = Object.assign({}, conf.access);
				for (var i in manifest.permissions) {
					if (typeof manifest.permissions[i] == 'string'
					&& manifest.permissions[i].length === 0) {
						manifest.permissions[i] = {};
					}
				}
			}
			
			Files.set.file( 'releases/manifest.webapp', JSON.stringify( manifest, null, '\t' ) );
			
			var packagejson = {
				name: conf.name,
				main: 'releases/index.html',
			};
			
			if (conf.bg == 'transparent') {
				packagejson.window = {
					frame: false,
					transparent: true,
				};
			}
			
			Files.set.file( 'package.json', JSON.stringify( packagejson, null, '\t' ) );
		},
		run: function (args) {
			var conf = Repl.getconfig();

			/*
			 * this one processes main.js and includes whatever is $('---')d
			 * then runs it directly without writing it to storage
			 * */
			var options = {
				jsmode		:	1							,
				silent		:	true						,
				appname		:	args.keys.appname || 0		,
				production	:	args.keys.production || 0	,
				debug		:	args.keys.debug || false	,
				verbose		:	args.keys.verbose || false	,
			};
			
			var core = Repl.importcore({keys: {
				eng: conf.import.etc.eng,
				lib: (conf.import.etc.lib||[]).concat( conf.import.src||[] ),
			}});
			
			var path = process.cwd();
			
//			core += '\n$.path = \''+path+'\';';
			core += '\n$.path = __dirname;';

			var payload = Slang.multi( 'main.js', null, options ).parsed;

			Cli.echo( ' ~blue~^bright^ running ~~' );
			
			Files.set.file(path+'/run.js', core+'\n'+payload);
		},
		buildheadless: function (args, conf, BUILDNUMBER) {
			/*
			 * this one is for node js apps that run in the background or on
			 * the terminal or choose their own methods of gui
			 * 
			 * this has no browser or htm/css components, no uglification
			 * 
			 * it compiles to built.js
			 * */
			
			var options = {
				jsmode		:	1							,
				appname		:	args.keys.appname || 0		,
				production	:	args.keys.production || 0	,
				buildnumber	:	BUILDNUMBER || 0			,
				debug		:	args.keys.debug || false	,
				verbose		:	args.keys.verbose || false	,
			};

			Repl.importcore({keys: {
				to: 'src/glatteis.tmp.js',
				eng: conf.import.etc.eng,
				lib: (conf.import.etc.lib||[]).concat( conf.import.src||[] ),
			}});
			
			Cli.echo( '\n ~blue~^bright^ headless ~~' );

			var parsedoutput = Slang.multi( 'main.js', null, options );
			Files.set.file( 'built.js', ( parsedoutput.parsed || '' ) );

			++BUILDNUMBER;

			var packagejson = {
				name: conf.name,
				main: 'built.js',
			};
			
			Files.set.file( 'package.json', JSON.stringify( packagejson, null, '\t' ) );

			Files.set.file( 'build/number.slang', ( BUILDNUMBER || '' ) );
		},
		buildlocally: function (args, conf, BUILDNUMBER) {
			/* OFFLINE APP
			 * if app needs to run offline then we need to bundle any linked
			 * files in src to dev-public/glatteis.tmp.js
			 * then include that glatteis.js in the final build
			 * */
			if (conf.local) {
				Repl.importcore({keys: {
					to: 'src/glatteis.tmp.js',
					eng: conf.import.public.eng,
					lib: (conf.import.public.lib||[]).concat( conf.import.src||[] ),
				}});
			}
			
			// compress svg eqonaat into dev-public/eqonaat.svg
			Repl._eqonaat(0);
			
			var translations = Repl.updatetranslations(conf);
			
			/* REMEMBER IMPORTANT MEMO
			 * make sure translations is defined globally beforehand
			 * this helps uglifyjs when passed mangle.eval.true to uglify
			 * global vars
			 * */
			translations = 'var taraajim = '+JSON.stringify(translations)+';';
			Files.set.file( 'src/taraajim.js', ( translations || '' ) );

			var options = {
				appname:		args.keys.appname || 0			,
				production:		args.keys.production || 0		,
				buildnumber:	BUILDNUMBER || 0				,
				compress:		args.keys.compress || false		,
				linkify:		args.keys.linkify || conf.linkify || false,
				uglify:			args.keys.uglify || false		,
//				nouglyjs:		args.keys.nouglyjs || false		,
				minify:			args.keys.minify || false		,
				// save temp js css htm... aggregated code to build/
				savetemp:		args.keys.savetemp || false		,
				debug:			args.keys.debug || false		,
				verbose:		args.keys.verbose || false		,
				// reserved words
				map: {
//					eqonaat: 'eqonaat'
				}
			};
			
			Cli.echo( '\n ~blue~^bright^ local ~~' );
			options.admin = true;
			var parsedoutput = Slang.multi( 'src/index.htm.slang', null, options );
			Files.set.file( 'releases/index.html', ( parsedoutput.parsed || '' ) );
			
			if (args.keys.linkify || conf.linkify)
				Files.set.file( 'releases/&.js', ( parsedoutput.rawjs || '' ) );

			var swjs;
			try {
				swjs = Files.get.file('src/sw.js');
			} catch (e) {}
			if (swjs) {
				swjs = swjs.toString();
				swjs = swjs.replace(/BUILDNUMBER/g, BUILDNUMBER);
				
				var parsedoutputswjs = Uglify.minify(swjs, {
					fromString:			true,
					mangle:				true,
				});
				Files.set.file( 'releases/_.js', ( parsedoutputswjs.code || '' ) );
			}

			++BUILDNUMBER;

			Repl.makemanifest(args, conf, BUILDNUMBER);

			Files.set.file( 'build/number.slang', ''+( BUILDNUMBER || '' ) );
		},
		buildpwa: function () {
			/*
			 * build a server+webapp combo, this has both back&front end modules
			 * the frontend compiles to a single htm file
			 * 
			 * the backend uses generated files to communicate with the webapp
			 * like network.slang which is a uglification dictionary
			 * 
			 * it also supports gening a service worker
			 * */
			
			// compress svg eqonaat into dev-public/eqonaat.svg
			Repl._eqonaat();
			
			var translations = Repl.updatetranslations(conf);
			
			/* REMEMBER IMPORTANT MEMO
			 * make sure translations is defined globally beforehand
			 * this helps uglifyjs when passed mangle.eval.true to uglify
			 * global vars
			 * */
			translations = 'taraajim = '+JSON.stringify(translations)+';';
			Files.set.file( 'dev-public/taraajim.js', ( translations || '' ) );
			
			var options = {
				appname:		args.keys.appname || 0			,
				production:		args.keys.production || 0		,
				buildnumber:	BUILDNUMBER || 0				,
				compress:		args.keys.compress || false		,
				uglify:			args.keys.uglify || false		,
//				nouglyjs:		args.keys.nouglyjs || false		,
				minify:			args.keys.minify || false		,
				// save temp js css htm... aggregated code to build/
				savetemp:		args.keys.savetemp || false		,
				debug:			args.keys.debug || false		,
				verbose:		args.keys.verbose || false		,
				// reserved words
				map: {
//					eqonaat: 'eqonaat'
				}
			};
			
			if (args.keys.client || args.keys.all) {
				// client only code
				Cli.echo( '\n ~blue~^bright^ client ~~' );
				options.client = true;
				var parsedoutput = Slang.multi( 'dev-public/index.htm.slang', null, options );
				// client version
				Files.set.file( 'public/index.html', ( parsedoutput.parsed || '' ) );
			}
			
			if (args.keys.admin || args.keys.all) {
				// admin only code
				Cli.echo( '\n ~blue~^bright^ admin ~~' );

				options.client = false;
				options.admin = true;
				var parsedoutput2 = Slang.multi( 'dev-public/index.htm.slang', null, options );
				// admin version
				Files.set.file( 'public/admin.html', ( parsedoutput2.parsed || '' ) );
			}
			
			if (args.keys.client || args.keys.admin || args.keys.all)
				++BUILDNUMBER;

			Files.set.file( 'build/number.slang', ( BUILDNUMBER || '' ) );

			var swjs = '';
			if (conf.server) {
				swjs = Files.get.file('dev-public/sw.js');
				swjs = swjs.toString();
			}
			swjs = swjs.replace(/BUILDNUMBER/g, BUILDNUMBER);
			
			var parsedoutputswjs = Uglify.minify(swjs, {
				fromString:			true,
				mangle:				true,
			});
			Files.set.file( 'public/sw.js', ( parsedoutputswjs.code || '' ) );
		},
		build: function (args) {
			if (Repl._isinstalled() === false) return;
//			Cli.echo( 'building...' );

			args.keys.production = args.keys.production || args.keys.pro;
			args.keys.compress = args.keys.compress || args.keys.cmp;
			args.keys.uglify = args.keys.uglify || args.keys.ugl;
			args.keys.verbose = args.keys.verbose || args.keys.vrb;

			// by default, assume admin version is wanted
			if (!args.keys.client && !args.keys.all)
				args.keys.admin = true;
			
			var BUILDNUMBER = 0;
			try {
				BUILDNUMBER = Files.get.file('build/number.slang');
				BUILDNUMBER = BUILDNUMBER.toString();
			} catch (e) {
				// ignore because we can make do without both these files
			}
			
			var conf = Repl.getconfig();

			args.keys.appname = conf.appname || conf.name;

			Repl.managedincludes(conf, args);
			
			if (conf.headless === true) {
				Repl.buildheadless(args, conf, BUILDNUMBER);
				return;
			}

			if (conf.server === false) {
				Repl.buildlocally(args, conf, BUILDNUMBER);
				return;
			}
		},
		/*
		 * glatteis structure info
		 * */
		info: function () {

			Repl.getdirdetails( Repl.currentpath+'/etc' );
			
			if (!Repl.managed()) {
				Cli.echo( '\n ~yellow~^bright^ not fully managed by glatteis ~~' );
			}
			
			var conf = Repl.getconfig();
			if (conf) {
				var BUILDNUMBER = 0;
				try {
					BUILDNUMBER = Files.get.file('build/number.slang');
					BUILDNUMBER = BUILDNUMBER.toString();
				} catch (e) {}

				conf.name && Cli.echo( ' name: ^bright^'+(conf.appname||conf.name)+'~~' );
				conf.sub && Cli.echo( ' subtitle: ^bright^'+conf.sub+'~~' );
				conf.desc && Cli.echo( ' desc: ^bright^'+conf.desc+'~~' );
				conf.type && Cli.echo( ' type: ^bright^'+conf.type+'~~' );
				Cli.echo( ' version: ^bright^'+(BUILDNUMBER/100)+'~~' );

				if (typeof conf.access == 'object') {
					Cli.echo( ' access: ' );

					for (var i in conf.access) {
						Repl.echorow(' - ', i, JSON.stringify(conf.access[i]) );
					}
				}
			}
			
			// what this directory should look like
			var structure = [
				[0, 'build', '          temp build files'],
				[0, 'releases', '       complied, minified, uglified, versioned files'],
				[0, 'etc', '            extra, imported modules like glatteis'],
				[1, 'etc/glatteis.js', 'imported custom glatteis build'],
				[0, 'src', '            modules that belong to this project'],
				[0, 'dev-public', '     development version of web app'],
				[0, 'public', '         production version of web app'],
				[0, 'tests', '          ^bright^test``^dim^ [test-name]'],
				[1, 'README.md', '      ^bright^doc``^dim^ generates this from your comments'],
				[1, 'index.js', '       node index.js'],
				[1, 'main.js', '        main app logic, include modules, needs ^bright^build``'],
				[1, 'tabee3ah.slang', '   glatteis configure, represents a managed directory'],
				[1, 'database.slang', ' database schema'],
				[1, 'network.slang', '  network schema, allows uglification of json transport'],
				[0, 'node_modules', '   contains required symlinks to central repo'],
				[1, 'package.json', '   unused by glatteis'],
			];
			
			Cli.echo();

			for (var i in structure) {
				
				var entry = structure[i];
				Repl.directoryinfo( entry[0], entry[1], entry[2] );
			
			}

			Cli.echo();

		},
		currentfolder: function () {
			return Repl.currentpath.split('/').pop();
		},
		dummyargs: {
			one: [],
			two: [],
			raw: [],
			keys: {},
		},
		getconfig: function () {
			var configslang = Repl._isinstalled(),
				conf = configslang.toString();

			conf = Slang.parse( conf );
			conf = Slang.config.parse( conf );
			
			return conf;
		},
		_isinstalled: function () {
			var configslang = false;
			try {
				configslang = Files.get.file('tabee3ah.slang');
			} catch (e) {
				Cli.echo(' tabee3ah.slang not found, try ^bright^glatteis configure~~ ')
				Repl.prompt();
				return;
			}
			return configslang;
		},
		engine: function () {
			var mods = [
//				'shims', 
				'frontend', 
				'log',
				'taxeer',
				'regexp', 
				'mod-concat',
				'modules',
				'use',
				'preload',
				'array',
				'queue',
				'require'
			];
			var concat = '';
			var dest = glatteisroot+'index.js';
			for (var i in mods) {
				var mod = mods[i];
				var path = glatteisroot+'src/engine/' + mod + '.js';
				concat +=	'\n//' + mod + '\n'
						+	Files.get.file( path ) + '\n';
			}

			Files.set.file(dest, concat);
		},
		/*
		 * imports server side backend modules
		 * */
		/*
		 * imports frontend modules
		 * */
		importdev: function (conf, pathprefix) {
			// create new symlinks
			if (conf.local) {
				pathprefix = pathprefix+'src/';
			} else {
				pathprefix = pathprefix+'dev-public/';
			}

			if (conf.import.dev instanceof Array) {
				
				Files.set.folder(pathprefix);
				Files.set.folder(pathprefix+'linked');
				/* EXPLAINING ABOVE
				 * src/linked can be shared between server & frontend mod because
				 * server mods are always named ge-(name).js
				 * frontend mods are always named (name)[.feature].js
				 * */
				
				// empty the directory
				var mods = Files.get.folder(pathprefix+'linked');
				for (var i in mods) {
					if (!mods[i].startsWith('ge-')) // don't delete server mods
						Files.pop.file(pathprefix+'linked/'+mods[i]);
				}

				mods = Files.get.folder(devroot);
				for (var i in conf.import.dev) {
					var modname = conf.import.dev[i];

					for (var j in mods) {
						var mod = mods[j]; // full name
						var devname = mod.split('.')[0];
						if (devname === modname) { // if the first part match
							Files.set.symlink(devroot+mod, pathprefix+'linked/'+mod);
						}
					}
				}
			}
		},
		/*
		 * links glatteisroot/taraajim/<lang>.modules.slang files to taraajim/linked/
		 * */
		managedincludes: function (conf, args) {
			// manage auto +include for css|js|htm dev-imports
			var pathprefix = '';
			if (conf.local) {
				pathprefix = 'src/';
			} else {
				pathprefix = 'dev-public/';
			}

			var includesjs = '', includescss = '', includeshtm = '';
			if (conf.include instanceof Array) {
				for (var i in conf.include) {
					var yes = 1, name = conf.include[i];
					if ( !args.keys.production && conf.include[i].startsWith(':') ) {
						name = conf.include[i].substr(1);
					}
					
					if (yes) {
						includescss	+= '+include linked/'+name+'.css.slang\n';
						includeshtm	+= '+include linked/'+name+'.htm.slang\n';
						includesjs	+= '+include linked/'+name+'.js\n';
					}
				}

				Files.set.file( pathprefix+'managed.htm.slang', includeshtm );
				Files.set.file( pathprefix+'managed.css.slang', includescss );
				Files.set.file( pathprefix+'managed.js.slang', includesjs );
			}
		},
		importnode: function (conf, pathprefix) {
			// create new symlinks
			if (conf.import.node instanceof Array) {
				Files.set.folder(pathprefix+'node_modules');
				
				// empty the directory
				var nodemods = Files.get.folder(pathprefix+'node_modules');
				for (var i in nodemods) {
					Files.pop.file(pathprefix+'node_modules/'+nodemods[i]);
				}

				Files.set.folder(pathprefix+'node_modules');
				
				for (var i in conf.import.node) {
					var modname = conf.import.node[i];
					
					Files.set.symlink(nmodulesroot+modname, pathprefix+'node_modules/'+modname);
				}
			}
		},
		_templates: {
			index:	function (conf) {
				var txt = '+htm'
						+	'\n!doctype @html'
						+	'\nhtml'
						+	'\n\t+include linked/head.htm.slang'
						+	'\n\t+include main.htm.slang'
						+	'\n+css';
				/* TODO
				 * Slang still doesn't support intelligent \t detection for +include
				 * if +css +js is tabbed (\t) here, Slang can't find its parent.
				 * */
//				if (conf.webapp)
//					txt += '\n+include webapp.css.slang';

				txt		+=	'\n+include style.css.slang'
						+	'\n+js';

				if (conf.local) // offline app
					txt +=	'\n+include glatteis.tmp.js';
				else
					txt +=	'\n+include glatteis.js';

				txt		+=	'\n+include script.js.slang'
						+	'\n+svg'
						+	'\n+include eqonaat.svg'
						+	'\n';
				return txt;
			},
			manifest: {
				name: '',
				short_name: '',
				eqonaat: [{
					src: 'icon.png',
					sizes: 'any',
				}],
				share_target: {
				  action: '/share-target/',
				  params: {
					title:	'title'	,
					text:	'text'	,
					url:	'url'
				  }
				},
				start_url: '.',
//				gcm_sender_id: '103953800507',
				display: 'standalone',
				background_color: 'black',
				theme_color: 'black'
			},
			head:	function (conf) {
				return '+htm\n'
				+	'\nhead'
//				+	'\n\tmeta @name(apple-mobile-web-app-capable) @content(yes)'
//				+	'\n\tmeta @name(apple-mobile-web-app-status-bar-style) @content(black)'
//				+	'\n\tmeta @name(apple-mobile-web-app-title) @content('+conf.name+')'
				+	'\n\tmeta @charset(utf-8)'
				+	'\n\tmeta @name(viewport) @content(width=device-width,initial-scale=1)'
				+	'\n\tmeta @name(theme-color) @content(black)'
				+	'\n\tmeta @name(background-color) @content(black)'
//				+	'\n\tmeta @rel(apple-touch-icon) @href(/icon.png)'
				+	'\n\tlink @rel(manifest) @href(/manifest.json)'
				+	'\n\tlink @rel(icon) @href(/icon.png) @type(image/x-icon)'
				+	'\n'
			},
			main:	function (conf) {
				var txt = '+htm'
						+	'\nbody';
				
				if (conf.import.dev)
					txt += '\n\t+include managed.htm.slang';
	
				return txt;
			},
			mainjs:	function (conf) {
				var mainjs =';(function(){'
							+'\n	\'use strict\';'
							+'\n'
				mainjs +='\n	var main = {'
						+'\n	};'
						+'\n';
						+'\n'

				mainjs +='\n})();'
						+'\n';
				return mainjs;
			},
			script:	function (conf) {
				var txt = '\'use strict\';';
					txt += '\nvar Hooks = $(\'hooks\');';

				if (conf.taraajim)
					txt += '\n+include taraajim.js';

				if (conf.import.dev)
					txt += '\n+include managed.js.slang';
				
				txt += '\n+include main.js';

				return txt;
			},
			style:	function (conf) {
				var txt = '';

				if (conf.import.dev)
					txt += '+include managed.css.slang';

				if (conf.server && conf.perms)
					txt += '\n+include permissions.css.slang';
				return txt;
			},
		},
		_mainjs: function (conf) {
			var mainjs =';(function(){'
						+'\n	\'use strict\';'
						+'\n'
			
			if (conf.webapp)
				mainjs +='\n	var Web = $(\'web\');'
						+'\n';

			mainjs +='\n	var M = {'
					+'\n	};'
					+'\n';
					+'\n'

			if (conf.webapp)
				mainjs += '\n	Web.init();';
					
			mainjs +='\n	module.exports = M;'
					+'\n})();'
					+'\n';

			return mainjs;
		},
		_indexjs: function (conf, pathprefix) {
			var indexjs =';(function(){'
						+'\n	\'use strict\';\n'
						+'\n	global.$ = require(\'./etc/glatteis.js\');\n'
						+'\n	// auto generated'
						+'\n	$.path = __dirname;'
						+'\n';
						
			if (conf.import && conf.import.src instanceof Array) {
				for (var i in conf.import.src) {
					var srcname = conf.import.src[i];
					
					indexjs += '\n	$.cache(\''+srcname+'\', $.path+\'/src/linked/ge-'+srcname+'.js\');';
				}
			}
			
			if (conf.import && conf.import.use instanceof Array) {
				for (var i in conf.import.use) {
					var usename = conf.import.use[i];
					var Usename = usename[0].toUpperCase() + usename.substr(1);
					
					indexjs += '\n	$.'+Usename+' = $.use(\''+usename+'\');';
				}
			}

			indexjs +='\n\n	var Files = $(\'files\');'
					+'\n'
					+'\n	$.conf = \'\';'
					+'\n	try {'
					+'\n		$.conf = Files.get.file(\'tabee3ah.slang\').toString();'
					+'\n	} catch (e) {'
					+'\n		$.log.s(\' tabee3ah.slang not found, try glatteis configure \');'
					+'\n		$.log.s( e );'
					+'\n		return;'
					+'\n	}'
					+'\n'
					+'\n	$.conf = $.Slang.parse( $.conf );'
					+'\n	$.conf = $.Slang.config.parse( $.conf );'
					+'\n';
					
			/*
			 * abstract away what files/folders should be watched
			 * this should be dynamically set in the target app
			 * */
			if (conf.watch) {
				indexjs +='\n	$._watched = [];';
			}
			
			if (conf.uglify) {
				indexjs +='\n	var updatenet = function () {'
						+'\n		$.xpo = \'\';'
						+'\n		try {'
						+'\n			$.xpo = Files.get.file(\'network.slang\').toString();'
						+'\n		} catch (e) {'
						+'\n			$.log.s(\' network.slang not found, try glatteis build \');'
						+'\n		}'
						+'\n'
						+'\n		$.xpo = $.Slang.parse( $.xpo );'
						+'\n		$.xpo = $.Slang.config.parse( $.xpo );'
						+'\n'
						+'\n		$.raw = {};'
						+'\n		for (var i in $.xpo) {'
						+'\n			$.raw[ $.xpo[i] ] = i;'
						+'\n		}'
						+'\n'
						+'\n		$.perms = \'\';'
						+'\n		try {'
						+'\n			$.perms = Files.get.file(\'permissions.slang\').toString();'
						+'\n		} catch (e) {'
						+'\n			$.log.s(\' permissions.slang not found, try glatteis build \');'
						+'\n		}'
						+'\n'
						+'\n		$.perms = $.Slang.parse( $.perms );'
						+'\n		$.perms = $.Slang.config.parse( $.perms );'
						+'\n		$.log.s( \'schema updated\' );'
						+'\n		$(\'hooks\').run( \'schema-updated\' );'
						+'\n'
						+'\n		if ( Object.keys($.perms).length ) {'
						+'\n'
						+'\n			var permscss = \'\', comma = false;'
						+'\n			for (var i in $.perms) {'
						+'\n				if (comma)'
						+'\n					permscss += \', \';'
						+'\n				else'
						+'\n					comma = true;'
						+'\n'
						+'\n				permscss += \'.O\'+$.perms[i];'
						+'\n			}'
						+'\n'
						+'\n			permscss += \'\\n	display		none\\n\';'
						+'\n'
						+'\n			comma = false;'
						+'\n			for (var i in $.perms) {'
						+'\n				if (comma)'
						+'\n					permscss += \', \';'
						+'\n				else'
						+'\n					comma = true;'
						+'\n'
						+'\n				permscss += \'.P\'+$.perms[i] + \' .O\'+$.perms[i];'
						+'\n			}'
						+'\n'
						+'\n			permscss += \'\\n	display		initial\';'
						+'\n'
						+'\n		}'
						+'\n'
						+'\n		Files.set.file(\'dev-public/permissions.css.slang\', permscss);'
						+'\n	};'
						+'\n	updatenet();'
						+'\n	var watchto	= false;'
						+'\n	var watchfn	= function () {'
						+'\n		clearTimeout(watchto);'
						+'\n		watchto = setTimeout(function () {'
						+'\n			$.log.s( \'schema updating...\' );'
						+'\n			updatenet();'
						+'\n		}, 1500);'
						+'\n	};'
						+'\n	Files.fs.watch(\'network.slang\', watchfn);'
						+'\n	Files.fs.watch(\'permissions.slang\', watchfn);'
						+'\n';
			}
			
			/*if (conf.database === true) {
				indexjs +='\n	var Data = $(\'data\');'
						+'\n	Data.init($.conf.username, $.conf.password)'
						+'\n';
			}
						
			if (conf.server === true) {
				indexjs +='\n	var Server = $(\'server\');'
						+'\n	Server.init($.conf.port);'
						+'\n';
			}*/
			
			indexjs +='\n'
					+'\n	module.exports = require(\'./main.js\');'
					+'\n';

			indexjs +='\n})();'
					+'\n';
					
			return indexjs;
		},
		create: function (args) {
			
			if (!Repl.cache.dir('src')) {

				Cli.echo( 'src/ doesn\'t exist, try ^bright^install`` or ^bright^info``' );
				Repl.prompt();

			} else {

				if ( !args.keys.name ) {
					Cli.question('name of your module: ', args, 'name', Repl.currentfolder() );
				} else
				if ( args.keys.hooks === undefined ) {
					Cli.question('needs hooks events? ', args, 'hooks', 'yes');
				} else
				if ( !args.keys.files === undefined ) {
					Cli.question('needs files? ', args, 'files', 'yes');
				} else
				if ( typeof args.keys.data === undefined ) {
					Cli.question('needs data (db)? ', args, 'data', 'no');
				} else
				{
					Cli.echo( '\nrequirements' );
					Cli.echo( 'name: '+ args.keys.name );
					Cli.echo( 'isdb: '+ args.keys.isdb );
					Cli.echo( 'isserver: '+ args.keys.isserver );
					Cli.echo( 'database '+ args.keys.database );
					Repl.prompt();
				}

			}

		},
		_create: function (conf) {
			var mod =';(function(){'
						+'\n	\'use strict\';'
						+'\n'
						+'\n	var _mod = {'
						+'\n	};'
						+'\n'
						+'\n	module.exports = _mod'
						+'\n})();'
						+'\n';
					
			return mod;
		},
		list: function (title, items) {

			var gemods, output = '', width = Cli.width, line = '';

			output += '\n ~blue~^bright^ '+title+' ~~';

			gemods = items;
			
			for (var i in gemods) {
					
				var modname = gemods[i];
				if (line !== '') {
					line += '^dim^,~~';
				}
				line += ' '+ modname;
					
				if (line.length >= width) {
					output += line+'\n';
					line = '';
				}
	
			}
			
			output += line;
				
			Cli.echo(output);

		},
		listdevmods: function (args, exclude) {

			var path, gemods, shims, filteredmods = [], exclude = exclude || [],
				mods = {}, feats = {};
			path		= glatteisroot+'/dev-public/',
			gemods		= Files.get.folder( path );
			
			for (var i in gemods) {
				var modname = gemods[i];
				modname = modname.split('.');
				
				var name = modname[0],
					ext = modname[modname.length-1],
					feature = modname[1];
				
				if (ext == 'slang') ext = modname[modname.length-2];
				
				feats[name] = feats[name] || [];
				if (feats[name].indexOf(feature) == -1
				&& !['htm', 'js', 'css', 'slang'].includes(feature))
					feats[name].push(feature);
				
				mods[name] = mods[name] || [];
				if (mods[name].indexOf(ext) == -1
				&& !['slang'].includes(ext))
					mods[name].push(ext);
			}
			for (var i in mods) {
				feats[name] = feats[name].sort();
				
				filteredmods.push( i+' `white`^dim^' + feats[i].join(' ')
								+ ( feats[name].length ? ' ' : '' )
								+ mods[i].join(':') + '~~' );
			}
			Repl.list('dev', filteredmods);
		},
		listenginemods: function (args, exclude) {

			var path, gemods, shims, filteredmods = [], exclude = exclude || [],
				filteredshims = [];
			path		= glatteisroot+'/src/engine/',
			gemods		= Files.get.folder( path );
			shims		= Files.get.folder( path+'shims/' );
			
			for (var i in shims) {
				
				if (shims[i].endsWith('.js')) {
					var modname = shims[i].slice( 0, shims[i].length-3 );
					if (!exclude.includes(modname)) {
						filteredshims.push(modname);
					}
				}
			}
			
			for (var i in gemods) {
				
				if (gemods[i].endsWith('.js') && !gemods[i].startsWith('shims')) {
					var modname = gemods[i].slice( 0, gemods[i].length-3 );
					if (!exclude.includes(modname)) {
						filteredmods.push(modname);
					}
				}
			}
			
			Repl.list('shims', filteredshims);
			Repl.list('engine', filteredmods);
		},
		listlibmods: function (args, exclude) {
			
			var path, gemods, filteredmods = [], exclude = exclude || [];
			path		= (args.keys.root || args.keys.r) ? glatteisroot+'/src/' : 'src/',
			gemods		= Files.get.folder( path );
			
			for (var i in gemods) {
				
				if ( gemods[i].startsWith('ge-') && gemods[i].endsWith('.js') ) {
					var modname = gemods[i].slice( 3, gemods[i].length-3 );
					if (!exclude.includes(modname)) {
						filteredmods.push(modname);
					}
				}
			}
			
			Repl.list('library', filteredmods);
			
/*			var path, gemods, fill, lastmodname	= '', output = '';
//			output += '\n ~blue~^bright^ modules ~~ \n';
//
//			path		= args.keys.root ? glatteisroot+'/src/' : 'src/',
//			gemods		= Files.get.folder( path ),
//			fill		= Cli.getfiller(gemods),
//			lastmodname	= '';
//			
//			for (var i in gemods) {
//				
//				if ( gemods[i].startsWith('ge-') && gemods[i].endsWith('.js') ) {
//					
//					var modname = gemods[i].slice( 3, gemods[i].length-3 ),
//						details = '';
//					
//					if (args.keys.full || args.keys.f) {
//						details = '\n^dim^'
//								+ Wrap.hard(6, Cli.width-6)('no info')
//								+ '~~\n';
//						output += ' ^bright^ ' + fill(modname).slice(0, -5) + '~~' + details;
//					} else {
//						if (modname[0] !== lastmodname[0]) output += '\n';
//						lastmodname = modname;
//						output += ' ' + fill(modname).slice(0, -5) + ' ' + details;
//					}
//					
//					
//				}
//				
//			}
//				
//			Cli.echo(output+'\n');
*/
			
		},
		modules: function (args) {
			
			if (args.keys.r || args.keys.root) {
				Repl.listenginemods(args);
				Repl.listlibmods(args);
				Repl.listdevmods(args);
			} else {
				if ( !Repl.cache.dir('src') )
					Cli.echo( 'src/ doesn\'t exist, try ^bright^install`` or ^bright^info``' );
				else {
					Repl.listenginemods(args);
					Repl.listlibmods(args);
					Repl.listdevmods(args);
				}
			}
			Repl.prompt();

		},
		init: function () {

			Hooks.set(Cli.events.hint, function (options) {
				var line	= options.line,
					cb		= options.callback,
					hints	= Repl.commands;
				
				if (line.startsWith('modules ')) {
					line = line.substr('modules '.length);
					hints = [
						'--full'	,	'-f'	,
						'--source'	,	'-s'	,
					];
				}
				if (line.startsWith('install ')) {
					line = line.substr('install '.length);
					hints = [
								'--missing'		,	'-m',
								'--overwrite'	,	'-o',
								'--database'	,	'-d',
								'--server'		,	'-s',
							];
				}
				if (line.startsWith('import ')) {
					line = line.substr('import '.length);
					hints = [
								'--eng'	,	'-e',
								'--lib'	,	'-l',
							];
				}
				if (line.startsWith('cd ')) {
					
					line = line.substr('cd '.length);
					var suffix = '', newpath = '';
					
					if (line.indexOf('/') > -1) {
						newpath = line.split('/').slice(0, -1).join('/');
						line = line.split('/').pop();
					}

					var path = Repl.currentpath+'/'+newpath;
					var ispath = false;
					try {
						ispath = Files.realpath( path );
					} catch (e) {
					} finally {
						if (ispath) {
							hints = Files.get.folder( path );
						} else {
							hints = Files.get.folder( Repl.currentpath );
						}
					}
					
				}

				var hits = hints.filter(function(c) { return c.indexOf(line) == 0 });
				cb( null, [hits.length ? hits : hints, line] );

			});

			Hooks.set(Cli.events.answer, function (options) {
				Repl.commandprocessor( options );
			});

			Hooks.set(Cli.events.init, function (options) {

				Repl.changeprompt(process.cwd(), false);
				
				Repl.getdirdetails( Repl.currentpath );

				if (options.iscli && options.cmd.length === 0) {
				
					Repl.mode = 1; // multiple commands mode
					Repl.changeprompt(process.cwd());

				} else {
					
					Repl.commandprocessor(options);

				}

			});
			
			Hooks.set(Cli.events.command, function (options) {

				Repl.commandprocessor(options);

			});

			Cli.init();

		}
	};
	

	global.$ = require('./nawaat.js');
	$.path = __dirname;
	$.preload( [ 'files', 'hooks', 'cli', 'wordwrap', 'tabee3ah', 'wuqu3aat',
				 'wuqu3aat.asaas', 'ansha' ], function() {

		Wrap		= $('wordwrap')			,
		Cli			= $('cli')				,
		Hooks		= $('hooks')			,
		Files		= $('files')			,
		Configure	= $('tabee3ah')			,
		Data		= $('wuqu3aat')			,
		Database	= $('wuqu3aat.asaas')	,
		Release		= $('ansha')			,
		Uglify		= require('./uglify-js'),
		Slang		= $.use('slang')		;

		Repl.init();

	} );

	module.exports = Repl;

})();
