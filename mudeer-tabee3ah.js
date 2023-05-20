/*
 * used by glatteis-repl
 * checks and edits tabee3ah.slang step-by-step
 * mods specified are added by default; to remove prefix with -modulename
 * mods passed to install are temp, and don't modify tabee3ah.slang
 * 
 * */
global.$ = require(__dirname+'/nawaat.js');
$.path = __dirname; // this is the mudeer root directory
var Cli, Files, Slang;

var cache = {};
var list = function (title, items) {
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
};
var currentfolder = function () { return process.cwd().split('/').pop(); };
var tabee3ah = function (args) {
	if (args.keys.proceed === undefined) {
		cache.eqonaat	= []; // icons
		cache.taraajim	= []; // translations i18n
		cache.ishtamal	= [ // managed ishtamals
			'hooks'
		];
		cache.xudoo3	= []; // dependence
		cache.nawaat	= []; // kernel or engine
		cache.masdar	= [ // library mods or tools
			'hooks'
		];
	}
	
	if (args.keys.proceed === false) {
		cache = {};
		process.exit();
		return false;
	}
	
	var configslang = '', conf = false;
	try {
		configslang = Files.get.file('tabee3ah.slang');
	} catch (e) {
		conf = {
			nawaat: [],
			masdar: [],
		};
	}
	if (conf === false) {
		conf = Slang.parse(configslang.toString());
		conf = Slang.config.parse(conf);
	}
//	$.log.s( conf );
//	return;
	
	/*
	 * in the cur dir? yes
	 * proj name, same
	 * server+pwa needed?	yes	-> ishtamal pwa, server
	 * database needed?		yes	-> ishtamal mysql, data
	 * these are the mods that'll be pre-ishtamal'd
	 * okay? yes, exit if no
	 * do you need any more mods? yes, no skip
	 * eng mods? ...
	 * lib mods? ...
	 * these are the settings, overwrite? yes, no (exit)
	 * write to config
	 * 
	 * REMEMBER
	 * args.keys are fresh values
	 * conf.* are old values
	 * */
	if ( ['x', '1'].includes(args.keys.sinf) ) args.keys.sinf = 'xaadim';
	if ( ['z', '2'].includes(args.keys.sinf) ) args.keys.sinf = 'zaboon';
	if ( !['xaadim', 'zaboon'].includes(args.keys.sinf) ) {
		args.keys.sinf = undefined;
	}

	if ( typeof args.keys.proceed !== 'boolean' ) {
		Cli.question('install in dir ^bright^'+currentfolder()+'/~~ ? ',
					args, 'proceed', 'no', 'bool' );
	} else
	if ( !args.keys.name ) {
		Cli.echo('\nif you want to install in the current directory, leave this as is.' );
		Cli.question('^bright^name~~ of your project: ', args, 'name', currentfolder() );
	} else
	if ( !args.keys.sinf ) {
		Cli.question('\nsinf: ^bright^1 x~~aadim or ^bright^2 z~~aboon? ', args,
					'sinf', conf.sinf || 'zaboon');
	} else
	if ( args.keys.sinf == 'xaadim' && typeof args.keys.port !== 'number' ) {
		Cli.question('\nxaadim will listen on port? ', args, 'port', conf.port, 'number');
	} else
	if ( args.keys.mutassil === undefined ) {
		if (args.keys.sinf == 'xaadim')
			Cli.echo('\nthis will add ^bright^server.web, polling~~ awzaar');
		if (args.keys.sinf == 'zaboon')
			Cli.echo('\nthis will add ^bright^network~~ awzaar');
		Cli.question('is mutassil? ', args, 'mutassil', !!conf.mutassil);
	} else
	if ( args.keys.sinf == 'zaboon' && args.keys.lamsah === undefined ) {
		Cli.echo('\nthis will add ^bright^webapp.touch, softkeys.touch~~ awzaar');
		Cli.question('is lamsah capable? ', args, 'lamsah', !!conf.lamsah);
	} else
	if ( args.keys.sinf == 'xaadim' && args.keys.isdb === undefined ) {
		Cli.question('\nneeds a database? ', args, 'isdb', !!conf.database, 'bool');
	} else
	if ( args.keys.username === undefined && args.keys.isdb === true ) {
		var username; if (conf.database) username = conf.database.username;
		Cli.question('database username: ', args, 'username', username);
	} else
	if ( args.keys.password === undefined && args.keys.isdb === true ) {
		var password; if (conf.database) password = conf.database.password;
		Cli.question('database password: ', args, 'password', password);
	} else
	{
		if (args.keys.sinf === 'zaboon') {
			cache.masdar.push(
				'reset', 'menu', 'profiles', 'webapp', 'softkeys', 'themes', 'sheet',
				'preferences', 'translate', 'time', 'dialog', 'backstack', 'list',
				'templates', 'headings', 'helpers', 'offline', 'shabakah', 'head',
				'settings', 'activity', 'view'
			);
			cache.ishtamal.push(
				'reset', 'reset.zaboon', 'webapp', 'webapp.3inch', 'list', 'backstack',
				'preferences', 'activity', 'view', 'time', 'settings', 'translate',
				'templates', 'softkeys', 'softkeys.list', 'sheet', 'themes', 'dialog'
			);
			cache.taraajim.push(
				'en'
			);
			cache.eqonaat.push(
				'search', 'settings', 'theme', 'help', 'done', 'close', 'arrowback'
			);
			cache.nawaat.push('frontend');
			
			if (args.keys.lamsah) {
				cache.eqonaat.push('morevert');
				cache.ishtamal.push('webapp.touch', 'softkeys.touch');
			}

			if (args.keys.mutassil) {
				cache.masdar.push('shabakah');
				cache.ishtamal.push('shabakah');
			}
		}
		if (args.keys.sinf === 'xaadim') {
			cache.masdar.push('server', 'files');
			cache.nawaat.push('frontend-srv');
			cache.ishtamal.push('server', 'files');

			if (args.keys.mutassil) {
				cache.masdar.push('polling', 'shabakah');
				cache.ishtamal.push('server.web', 'polling', 'shabakah.xaadim');
			}
			
			// TODO make this optional
			cache.xudoo3.push('express', 'express-fileupload', 'body-parser');
		}
		if (args.keys.isdb === true) {
			cache.masdar.push('wuqu3aat');
			cache.ishtamal.push('wuqu3aat', 'wuqu3aat.asaas');
			// dependence on kaafir modules
			cache.xudoo3.push('mysql');
		}
		
		// merge with previous values & remove duplicates
		cache.nawaat	= $.array( cache.nawaat  .concat( conf.nawaat  || [] ) ).unique();
		cache.masdar	= $.array( cache.masdar  .concat( conf.masdar  || [] ) ).unique();
		cache.ishtamal	= $.array( cache.ishtamal.concat( conf.ishtamal|| [] ) ).unique();
		cache.taraajim	= $.array( cache.taraajim.concat( conf.taraajim|| [] ) ).unique();
		cache.eqonaat	= $.array( cache.eqonaat .concat( conf.eqonaat || [] ) ).unique();
		cache.xudoo3	= $.array( cache.xudoo3  .concat( conf.xudoo3  || [] ) ).unique();
		
		// show a legend of changes to be made
		// ? overwrite
		conf.name			= args.keys.name	;
		conf.mutassil		= args.keys.mutassil;
		conf.eqonaat		= cache.eqonaat		;
		conf.taraajim		= cache.taraajim	;
		conf.ishtamal		= cache.ishtamal	;
		conf.nawaat			= cache.nawaat		;
		conf.xudoo3			= cache.xudoo3		;
		conf.masdar			= cache.masdar		;
		conf.sinf			= args.keys.sinf	;
		if (args.keys.port > -1 && args.keys.port < 65536) {
			conf.port		= args.keys.port;
		}
		if (args.keys.isdb) {
			conf.database		= {
				username: args.keys.username || '',
				password: args.keys.password || ''
			};
		} else {
			delete conf.database;
		}
		
		var confdata = Slang.toslang( conf );
		Files.set.file('tabee3ah.slang', confdata);
		
		Cli.echo( '\n^bright^saved:~~\n' );
		$.log( confdata );
		process.exit();
	}
};
$.preload( [ 'files', 'hooks', 'cli' ], function() {
	Cli			= $('cli')				,
	Hooks		= $('hooks')			,
	Files		= $('files')			,
	Uglify		= require('./uglify-js'),
	Slang		= $.use('slang')		;
	Hooks.set(Cli.events.answer, function (options) { tabee3ah(options); });
	Hooks.set(Cli.events.init, function (options) { tabee3ah(options); });
	Hooks.set(Cli.events.command, function (options) { tabee3ah(options); });
	Cli.init();
});
