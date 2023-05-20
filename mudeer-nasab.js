/*
 * imports dynamically generated nawaat based on tabee3ah.slang
 * links masdar files
 * creates directory structure
 * ...
 * */
global.$ = require(__dirname+'/nawaat.js');
$.path = __dirname; // this is the mudeer root directory
var Cli, Files, Slang,
	dummyargs = { one: [], two: [], raw: [], keys: {}, };
var nawaatpreset = [
	'shims', 'log', 'taxeer', 'regexp', 'mod-concat', 'modules', 'array', 'queue', 'fetch'
];
var _templates = {
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
//		if (conf.webapp)
//			txt += '\n+include webapp.css.slang';

		txt		+=	'\n+include style.css.slang'
				+	'\n+js';

		txt +=	'\n+include nawaat.js';

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
		+	'\n\tlink @rel(manifest) @href('+(conf.jazar||'')+'/manifest.json)'
		+	'\n\tlink @rel(icon) @href('+(conf.jazar||'')+'icon.png) @type(image/x-icon)'
		+	'\n'
	},
	main:	function (conf) {
		var txt = '+htm'
				+	'\nbody';
		
		if (conf.ishtamal)
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
		if (conf.sinf == 'xaadim')
			txt += '\n$.path = __dirname;';

		if (conf.taraajim)
			txt += '\n+include taraajim.js';

		txt += '\n+include managed.js.slang';
		
		txt += '\n+include main.js';

		return txt;
	},
	style:	function (conf) {
		var txt = '';
		txt += '+include managed.css.slang';
		return txt;
	},
};
var currentfolder = function () { return process.cwd().split('/').pop(); };
var importmasdar = function (conf, pathprefix) {
	// create new symlinks
	pathprefix = pathprefix+'masdar/';

	if (conf.masdar instanceof Array) {
		Files.set.folder(pathprefix);
		Files.set.folder(pathprefix+'linked');
		/* EXPLAINING ABOVE
		 * masdar/linked can be shared between server & frontend mod because
		 * server mods are always named ge-(name).js
		 * frontend mods are always named (name)[.feature].js
		 * */
		
		// empty the directory
		var mods = Files.get.folder(pathprefix+'linked');
		for (var i in mods) Files.pop.file(pathprefix+'linked/'+mods[i]);

		var masdarroot = $.path+'/masdar/';
		mods = Files.get.folder(masdarroot);
		for (var i in conf.masdar) {
			var modname = conf.masdar[i];

			for (var j in mods) {
				var mod = mods[j]; // full name
				var devname = mod.split('.')[0];
				if (devname === modname) { // if the first part match
					Files.set.symlink(masdarroot+mod, pathprefix+'linked/'+mod);
				}
			}
		}
	}
};
var importtaraajim = function (conf) {
	// create new symlinks
	var pathprefix = 'taraajim/';

	if (conf.taraajim instanceof Array && conf.masdar instanceof Array) {
		Files.set.folder(pathprefix);
		Files.set.folder(pathprefix+'linked');
		
		var taraajimroot = $.path+'/taraajim/';
		var taraajimfiles = Files.get.folder(taraajimroot);
		var oldones = Files.get.folder(pathprefix+'linked');
		oldones.forEach(function (name) {
			Files.pop.file(pathprefix+'linked/'+name);
		});
		
		var mods = conf.masdar;
		for (var i in conf.taraajim) {
			var language = conf.taraajim[i];

			for (var j in mods) {
				var mod = mods[j]; // full name
				var newname = language+'.'+mod+'.slang';

				if ( conf.masdar.indexOf(mod) > -1
				&& taraajimfiles.indexOf(newname) > -1 ) {
					Files.set.symlink(taraajimroot+newname, pathprefix+'linked/'+newname);
				}
			}
		}
	}
};
var importeqonaat = function (conf) {
	// create new symlinks
	var pathprefix = 'eqonaat/';

	if (conf.eqonaat instanceof Array) {
		Files.set.folder(pathprefix);
		
		eqonaatroot = $.path+'/eqonaat/';
		var oldones = Files.get.folder(pathprefix);
		oldones.forEach(function (name) {
			Files.pop.file(pathprefix+name);
		});
		
		for (var i in conf.eqonaat) {
			var mod = conf.eqonaat[i]+'.svg';
			Files.set.symlink(eqonaatroot+mod, pathprefix+mod);
		}
	}
};
var importnawaat = function (mods, to) {
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
			var path = $.path+'/nawaat-masdar/' + mod + '.js';
			concat +=	'\n//' + mod + '\n'
//					+	'//### ' + path + '\n'
					+	Files.get.file( path ) + '\n';
		}
		// this exports mudeer
		concat +=	'$._r();';
		
		if (to) Files.set.file(to, concat);
	}
	return concat;
};
var importxudoo3 = function (conf, pathprefix) {
	// create new symlinks
	if (conf.xudoo3 instanceof Array) {
		var nmodulesroot = $.path+'/xudoo3/';
		
		Files.set.folder(pathprefix+'xudoo3');
		
		// empty the directory
		var nodemods = Files.get.folder(pathprefix+'xudoo3');
		for (var i in nodemods) {
			Files.pop.file(pathprefix+'xudoo3/'+nodemods[i]);
		}

		Files.set.folder(pathprefix+'xudoo3');
		
		for (var i in conf.xudoo3) {
			var modname = conf.xudoo3[i];
			
			Files.set.symlink(nmodulesroot+modname, pathprefix+'xudoo3/'+modname);
		}
	}
};
var nasab = function () {
	var args = Object.assign( dummyargs, args ), configslang = false;
	try {
		configslang = Files.get.file('tabee3ah.slang');
	} catch (e) {
		Cli.echo(' tabee3ah.slang not found, try ^bright^mudeer-tabee3ah~~ ');
		return;
	}
	if (configslang === false) return;
	
	var pathprefix = './', conf = configslang.toString();
	
	if (conf.length === 0) {
		Cli.echo(' tabee3ah.slang is empty, install aborted! ');
		return;
	}
		
	conf = Slang.parse( conf );
	conf = Slang.config.parse( conf );
	
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
		Files.set.folder(pathprefix+'insha');		// build
		Files.set.folder(pathprefix+'manaashir');	// releases
		Files.set.folder(pathprefix+'masdar');		// source
		Files.set.folder(pathprefix+'fitan');		// tests
	} catch (e) {
		
	}

	var root = Files.get.folder(pathprefix) || [];

	if (conf.sinf == 'zaboon') {
		Files.set.folder(pathprefix+'eqonaat');
		Files.set.folder(pathprefix+'taraajim');
		Files.set.folder(pathprefix+'taraajim/linked');
	}

	if (conf.sinf) {
		var nawaatmods = $.array( conf.nawaat.concat( nawaatpreset ) ).unique();
		// TODO -[name] should remove that mod from this array
		importnawaat(nawaatmods, pathprefix+'masdar/nawaat.js');
		
		var masdar = Files.get.folder(pathprefix+'masdar') || [];
		if ( !masdar.includes('script.js.slang') )
			Files.set.file( pathprefix+'masdar/script.js.slang', _templates.script(conf) );

		Files.set.file( pathprefix+'masdar/index.htm.slang', _templates.index(conf) );

		if (conf.sinf == 'zaboon') {
//			if ( !masdar.includes('head.htm.slang') )
//				Files.set.file( pathprefix+'masdar/head.htm.slang', _templates.head(conf) );

			if ( !masdar.includes('style.css.slang') )
				Files.set.file( pathprefix+'masdar/style.css.slang', _templates.style(conf) );
			
			if ( !masdar.includes('main.htm.slang') )
				Files.set.file( pathprefix+'masdar/main.htm.slang', _templates.main(conf) );
		}
		if ( !masdar.includes('main.js') )
			Files.set.file( pathprefix+'masdar/main.js', _templates.mainjs(conf) );
	}
	/* masdar/linked */
	conf.masdar		&& importmasdar(conf, pathprefix);

	if (conf.sinf == 'xaadim') {
		conf.xudoo3		&& importxudoo3(conf, pathprefix+'manaashir/');
	}

	if (conf.sinf == 'zaboon') {
		/* taraajim/linked */
		conf.taraajim	&& importtaraajim(conf);
		/* eqonaat */
		conf.eqonaat	&& importeqonaat(conf);
	}
};
$.preload( [ 'files', 'hooks', 'cli' ], function() {
	Cli			= $('cli')				,
	Hooks		= $('hooks')			,
	Files		= $('files')			,
	Slang		= $.use('slang')		;
	Hooks.set(Cli.events.answer, function (options) { nasab(options); });
	Hooks.set(Cli.events.init, function (options) { nasab(options); });
	Hooks.set(Cli.events.command, function (options) { nasab(options); });
	Cli.init();
} );
