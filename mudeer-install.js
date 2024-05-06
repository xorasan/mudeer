/*
 * imports dynamically generated kernel based on config.w
 * kernel's build number is in version.w
 * links src files
 * creates directory structure
 * ...
 * */
global.$ = require(__dirname+'/kernel.js');
$.path = __dirname; // this is the mudeer root directory
var Cli, Files, Weld, echo,
	dummyargs = { one: [], two: [], raw: [], keys: {}, };
var kernelpreset = [
	'shims', 'log', 'taxeer', 'regexp', 'mod-concat', 'modules', 'array', 'queue', 'fetch'
];
var _templates = {
	index:	function (conf) {
		var txt = '+htm'
				+	'\n!doctype @html'
				+	'\nhtml'
				+	'\n\t+include linked/head.htm.w'
				+	'\n\t+include main.htm.w'
				+	'\n+css';
		/* TODO
			* Weld still doesn't support intelligent \t detection for +include
			* if +css +js is tabbed (\t) here, Weld can't find its parent.
			* */
//		if (conf.webapp)
//			txt += '\n+include webapp.css.w';

		txt		+=	'\n+include style.css.w'
				+	'\n+js';

		txt +=	'\n+include kernel.js';

		txt		+=	'\n+include script.js.w'
				+	'\n+svg'
				+	'\n+include icons.svg'
				+	'\n';
		return txt;
	},
	manifest: {
		name: '',
		short_name: '',
		icons: [{
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
//		gcm_sender_id: '103953800507',
		display: 'standalone',
		background_color: 'black',
		theme_color: 'black'
	},
	head:	function (conf) {
		return '+htm\n'
		+	'\nhead'
//		+	'\n\tmeta @name(apple-mobile-web-app-capable) @content(yes)'
//		+	'\n\tmeta @name(apple-mobile-web-app-status-bar-style) @content(black)'
//		+	'\n\tmeta @name(apple-mobile-web-app-title) @content('+conf.name+')'
		+	'\n\tmeta @charset(utf-8)'
		+	'\n\tmeta @name(viewport) @content(width=device-width,initial-scale=1)'
		+	'\n\tmeta @name(theme-color) @content(black)'
		+	'\n\tmeta @name(background-color) @content(black)'
//		+	'\n\tmeta @rel(apple-touch-icon) @href(/icon.png)'
		+	'\n\tlink @rel(manifest) @href('+(conf.root||'')+'/manifest.json)'
		+	'\n\tlink @rel(icon) @href('+(conf.root||'')+'icon.png) @type(image/x-icon)'
		+	'\n'
	},
	main:	function (conf) {
		var txt = '+htm'
				+	'\nbody';
		
		if (conf.include)
			txt += '\n\t+include managed.htm.w';
	
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
		if (conf.kind == 'server')
			txt += '\n$.path = __dirname;';

		if (conf.langs)
			txt += '\n+include langs.js';

		txt += '\n+include managed.js.w';
		
		txt += '\n+include main.js';

		return txt;
	},
	style:	function (conf) {
		var txt = '';
		txt += '+include managed.css.w';
		return txt;
	},
};
var currentfolder = function () { return process.cwd().split('/').pop(); };
var importsrc = function (conf, pathprefix) {
	// create new symlinks
	pathprefix = pathprefix+'src/';

	if (conf.src instanceof Array) {
		Files.set.folder(pathprefix);
		Files.set.folder(pathprefix+'linked');
		/* EXPLAINING ABOVE
		 * src/linked can be shared between server & frontend mod because
		 * server mods are always named ge-(name).js
		 * frontend mods are always named (name)[.feature].js
		 * */
		
		// empty the directory
		var mods = Files.get.folder(pathprefix+'linked');
		for (var i in mods) Files.pop.file(pathprefix+'linked/'+mods[i]);

		var srcroot = $.path+'/src/';
		mods = Files.get.folder(srcroot);
		for (var i in conf.src) {
			var modname = conf.src[i];

			for (var j in mods) {
				var mod = mods[j]; // full name
				var devname = mod.split('.')[0];
				if (devname === modname) { // if the first part match
					Files.set.symlink(srcroot+mod, pathprefix+'linked/'+mod);
				}
			}
		}
	}
};
var importlangs = function (conf) {
	// create new symlinks
	var pathprefix = 'langs/';

	if (conf.langs instanceof Array && conf.src instanceof Array) {
		Files.set.folder(pathprefix);
		Files.set.folder(pathprefix+'linked');
		
		var langsroot = $.path+'/langs/';
		var langsfiles = Files.get.folder(langsroot);
		var oldones = Files.get.folder(pathprefix+'linked');
		oldones.forEach(function (name) {
			Files.pop.file(pathprefix+'linked/'+name);
		});
		
		var mods = conf.src;
		for (var i in conf.langs) {
			var language = conf.langs[i];

			for (var j in mods) {
				var mod = mods[j]; // full name
				var newname = language+'.'+mod+'.w';

				if ( conf.src.indexOf(mod) > -1
				&& langsfiles.indexOf(newname) > -1 ) {
					Files.set.symlink(langsroot+newname, pathprefix+'linked/'+newname);
				}
			}
		}
	}
};
var importicons = function (conf) {
	// create new symlinks
	var pathprefix = 'icons/';

	if (conf.icons instanceof Array) {
		Files.set.folder(pathprefix);
		
		iconsroot = $.path+'/icons/';
		var oldones = Files.get.folder(pathprefix);
		oldones.forEach(function (name) {
			Files.pop.file(pathprefix+name);
		});
		
		for (var i in conf.icons) {
			var mod = conf.icons[i]+'.svg';
			Files.set.symlink(iconsroot+mod, pathprefix+mod);
		}
	}
};
var importkernel = function (mods, to) {
	mods = mods || [];
	var concat	= '';
	if (mods.length > 0) {
		var preset = [
			'shims'			,
			'frontend'		,
			'frontend-srv'	,
			'log'			,
			'taxeer'		,
			'regexp'		,
			'mod-concat'	,
			'modules'		,
			'use'			,
			'preload'		,
			'array'			,
			'queue'			,
			'require'		,
			'fetch'
		];
		// sort them first, engine requires sorted code
		mods = $.array(mods).order(preset);
		for (var i in mods) {
			var mod = mods[i];
			var path = $.path+'/kernel/' + mod + '.js';
			concat +=	'\n//' + mod + '\n'
//					+	'//### ' + path + '\n'
					+	Files.get.file( path ) + '\n';
		}
		// this exports mudeer
		concat +=	'$._r();';

		var KERNEL_BUILD_NUMBER = 0;
		try {
			KERNEL_BUILD_NUMBER = Files.get.file($.path+'/version.w');
			KERNEL_BUILD_NUMBER = parseInt( KERNEL_BUILD_NUMBER.toString() || 0 );
		} catch (e) {
			// ignore because we can make do without this file
		}
		concat += '\n$.b = '+KERNEL_BUILD_NUMBER+';\n';
		
		if (to) Files.set.file(to, concat);
	}
	return concat;
};
var importdeps = function (conf, pathprefix) {
	// create new symlinks
	if (conf.deps instanceof Array) {
		var nmodulesroot = $.path+'/deps/';
		
		Files.set.folder(pathprefix+'deps');
		
		// empty the directory
		var nodemods = Files.get.folder(pathprefix+'deps');
		for (var i in nodemods) {
			Files.remove_recursive(pathprefix+'deps/'+nodemods[i], 0, 1);
		}

		Files.set.folder(pathprefix+'deps');
		
		echo( ' ^bright^'+conf.deps.length+' dependencies~~' );

		var previous_deps = Files.get.folder(pathprefix+'deps');

		for (var i in conf.deps) {
			var modname = conf.deps[i];
			
			if (conf.copy_deps) {
				if (previous_deps.includes(modname)) {
					if (vrb) echo( '   '+modname+' ^dim^already copied, skipping~~ ' );
				} else {
					echo( '   '+modname+' ^dim^copying~~' );
					Files.copy_recursive( nmodulesroot+modname, pathprefix+'deps/'+modname );
				}
			} else {
				Files.set.symlink( nmodulesroot+modname, pathprefix+'deps/'+modname );
			}
		}
	}
};
var do_install = function () {
	var args = Object.assign( dummyargs, args ), configw = false;
	try {
		configw = Files.get.file('config.w');
	} catch (e) {
		Cli.echo(' '+process.cwd()+' ');
		Cli.echo(' config.w not found, try ^bright^mudeer-create~~ ');

		configw = false
	}
	if (configw === false) {
		// check for a release file and do an install on all includes
		var releasew = false, releasefile = 'release.w';
		if (releasefile && releasefile.length) {
			try {
				releasew = Files.get.file(releasefile);
				releasew = releasew.toString();
				releasew = Weld.parse( releasew );
				releasew = Weld.config.parse( releasew );
				Cli.echo(' but found a ^bright^'+releasefile+'~~ file ');
			} catch (e) {
				Cli.echo(' ^bright^'+releasefile+'~~ not found ');
				return;
			}
		}
		
		if (releasew) {
			if (releasew.include instanceof Array) {
				releasew.include.forEach(function (o) {
					try {
						process.chdir( o );
						Cli.echo(' '+process.cwd()+' ');
						
						do_install();
						
						process.chdir( '..' );
					} catch (e) {
						Cli.echo(' ~red~^bright^ '+target_path+'~~ not found ');
						return;
					}
				});
			}
		}
		
		return;
	}
	
	var pathprefix = './', conf = configw.toString();
	
	if (conf.length === 0) {
		Cli.echo(' config.w is empty, install aborted! ');
		return;
	}
	
	Cli.echo(' mudeer-install... ');
		
	conf = Weld.parse( conf );
	conf = Weld.config.parse( conf );
	
	// show a legend of changes to be made
	// ? overwrite
	
	if (conf.name !== true && currentfolder() !== conf.name ) {
		pathprefix = conf.name + '/';
		try {
			Files.set.folder(conf.name);
		} catch (e) {
			
		}
//		Repl.cd( conf.name+'/' );
	}
	
	try {
		Files.set.folder(pathprefix+'build');		// build
		Files.set.folder(pathprefix+'pub');			// public
		Files.set.folder(pathprefix+'src');			// source
		Files.set.folder(pathprefix+'tests');		// tests
		
	} catch (e) {
		
	}

	var root = Files.get.folder(pathprefix) || [];

	if (conf.kind == 'client') {
		Files.set.folder(pathprefix+'icons');
		Files.set.folder(pathprefix+'langs');
		Files.set.folder(pathprefix+'langs/linked');
	}

	if (conf.kind) {
		var kernelmods = $.array( conf.kernel.concat( kernelpreset ) ).unique();
		// TODO -[name] should remove that mod from this array
		importkernel(kernelmods, pathprefix+'src/kernel.js');
		
		var src = Files.get.folder(pathprefix+'src') || [];
		if ( !src.includes('script.js.w') )
			Files.set.file( pathprefix+'src/script.js.w', _templates.script(conf) );

		Files.set.file( pathprefix+'src/index.htm.w', _templates.index(conf) );

		if (conf.kind == 'client') {
//			if ( !src.includes('head.htm.w') )
//				Files.set.file( pathprefix+'src/head.htm.w', _templates.head(conf) );

			if ( !src.includes('style.css.w') )
				Files.set.file( pathprefix+'src/style.css.w', _templates.style(conf) );
			
			if ( !src.includes('main.htm.w') )
				Files.set.file( pathprefix+'src/main.htm.w', _templates.main(conf) );
		}
		if ( !src.includes('main.js') )
			Files.set.file( pathprefix+'src/main.js', _templates.mainjs(conf) );
	}
	/* src/linked */
	conf.src		&& importsrc(conf, pathprefix);

	// this used to be limited to server only before 29apr2024, see if this breaks any projects
	conf.deps		&& importdeps(conf, pathprefix+'pub/');

	if (conf.kind == 'client') {
		/* langs/linked */
		conf.langs	&& importlangs(conf);
		/* icons */
		conf.icons	&& importicons(conf);
	}
	
	Cli.echo(' done');
};
$.preload( [ 'files', 'hooks', 'cli' ], function() {
	Cli			= $('cli')				,
	Hooks		= $('hooks')			,
	Files		= $('files')			,
	Weld		= require('./weld')		;
	
	echo = Cli.echo;
	
	Hooks.set(Cli.events.answer, function (options) { do_install(options); });
	Hooks.set(Cli.events.init, function (options) { do_install(options); });
	Hooks.set(Cli.events.command, function (options) { do_install(options); });
	Cli.init();
} );
