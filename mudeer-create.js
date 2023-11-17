/*
 * used by glatteis-repl
 * checks and edits config.w step-by-step
 * mods specified are added by default; to remove prefix with -modulename
 * mods passed to install are temp, and don't modify config.w
 * 
 * */
global.$ = require(__dirname+'/kernel.js');
$.path = __dirname; // this is the mudeer root directory
var Cli, Files, Weld;

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
var do_config = function (args) {
	if (args.keys.proceed === undefined) {
		cache.icons	= []; // icons
		cache.langs	= []; // translations i18n
		cache.include	= [ // managed includes
			'hooks'
		];
		cache.deps	= []; // dependence
		cache.kernel	= []; // kernel or engine
		cache.src	= [ // library mods or tools
			'hooks'
		];
	}
	
	if (args.keys.proceed === false) {
		cache = {};
		process.exit();
		return false;
	}
	
	var configw = '', conf = false;
	try {
		configw = Files.get.file('config.w');
	} catch (e) {
		conf = {
			kernel: [],
			src: [],
		};
	}
	if (conf === false) {
		conf = Weld.parse(configw.toString());
		conf = Weld.config.parse(conf);
	}
//	$.log.s( conf );
//	return;
	
	/*
	 * in the cur dir? yes
	 * proj name, same
	 * server+pwa needed?	yes	-> include pwa, server
	 * database needed?		yes	-> include mysql, data
	 * these are the mods that'll be pre-include'd
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
	if ( ['s', '1'].includes(args.keys.kind) ) args.keys.kind = 'server';
	if ( ['c', '2'].includes(args.keys.kind) ) args.keys.kind = 'client';
	if ( !['server', 'client'].includes(args.keys.kind) ) {
		args.keys.kind = undefined;
	}

	if ( typeof args.keys.proceed !== 'boolean' ) {
		Cli.question('install in dir ^bright^'+currentfolder()+'/~~ ? ',
					args, 'proceed', 'no', 'bool' );
	} else
	if ( !args.keys.name ) {
		Cli.echo('\nif you want to install in the current directory, leave this as is.' );
		Cli.question('^bright^name~~ of your project: ', args, 'name', currentfolder() );
	} else
	if ( !args.keys.kind ) {
		Cli.question('\nkind: ^bright^1 s~~erver or ^bright^2 c~~lient? ', args,
					'kind', conf.kind || 'client');
	} else
	if ( args.keys.kind == 'server' && typeof args.keys.port !== 'number' ) {
		Cli.question('\nserver will listen on port? ', args, 'port', conf.port, 'number');
	} else
	if ( args.keys.connected === undefined ) {
		if (args.keys.kind == 'server')
			Cli.echo('\nthis will add ^bright^server.web, polling~~ modules');
		if (args.keys.kind == 'client')
			Cli.echo('\nthis will add ^bright^network~~ modules');
		Cli.question('is connected? ', args, 'connected', !!conf.connected);
	} else
	if ( args.keys.kind == 'client' && args.keys.touch === undefined ) {
		Cli.echo('\nthis will add ^bright^webapp.touch, softkeys.touch~~ modules');
		Cli.question('is touch capable? ', args, 'touch', !!conf.touch);
	} else
	if ( args.keys.kind == 'server' && args.keys.isdb === undefined ) {
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
		if (args.keys.kind === 'client') {
			cache.src.push(
				'reset', 'menu', 'profiles', 'webapp', 'softkeys', 'themes', 'sheet',
				'preferences', 'translate', 'time', 'dialog', 'backstack', 'list',
				'templates', 'headings', 'helpers', 'offline', 'network', 'head',
				'settings', 'activity', 'view'
			);
			cache.include.push(
				'reset', 'reset.client', 'webapp', 'webapp.3inch', 'webapp.13inch',
				'list', 'backstack',
				'preferences', 'activity', 'view', 'time', 'settings', 'translate',
				'templates', 'softkeys', 'softkeys.list', 'sheet', 'themes', 'dialog'
			);
			cache.langs.push(
				'en'
			);
			cache.icons.push(
				'search', 'help', 'done', 'close', 'arrowback', 'settings', 'daterange', 'timer',
				'bugreport', 'featuredplaylist', 'formatsize', 'translate', 'playarrow', 'theme',
				'brightness7', 'tab', 'bluron', 'mudeer'
			);
			cache.kernel.push('frontend');
			
			if (args.keys.touch) {
				cache.icons.push('morevert');
				cache.include.push('webapp.touch', 'softkeys.touch');
			}

			if (args.keys.connected) {
				cache.src.push('network');
				cache.include.push('network');
			}
		}
		if (args.keys.kind === 'server') {
			cache.src.push('server', 'files');
			cache.kernel.push('frontend-srv');
			cache.include.push('server', 'files');

			if (args.keys.connected) {
				cache.src.push('polling', 'network');
				cache.include.push('server.web', 'polling', 'network.server');
			}
			
			// TODO make this optional
			cache.deps.push('express', 'express-fileupload', 'body-parser');
		}
		if (args.keys.isdb === true) {
			cache.src.push('wuqu3aat');
			cache.include.push('wuqu3aat', 'wuqu3aat.asaas');
			// dependence on external modules
			cache.deps.push('mysql');
		}
		
		// merge with previous values & remove duplicates
		cache.kernel	= $.array( cache.kernel .concat( conf.kernel  || [] ) ).unique();
		cache.src		= $.array( cache.src    .concat( conf.src     || [] ) ).unique();
		cache.include	= $.array( cache.include.concat( conf.include || [] ) ).unique();
		cache.langs		= $.array( cache.langs  .concat( conf.langs   || [] ) ).unique();
		cache.icons		= $.array( cache.icons  .concat( conf.icons   || [] ) ).unique();
		cache.deps		= $.array( cache.deps   .concat( conf.deps    || [] ) ).unique();
		
		// show a legend of changes to be made
		// ? overwrite
		conf.name			= args.keys.name		;
		conf.connected		= args.keys.connected	;
		conf.icons			= cache.icons			;
		conf.langs			= cache.langs			;
		conf.include		= cache.include			;
		conf.kernel			= cache.kernel			;
		conf.deps			= cache.deps			;
		conf.src			= cache.src				;
		conf.kind			= args.keys.kind		;
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
		
		var confdata = Weld.to_weld( conf );
		Files.set.file('config.w', confdata);
		
		Cli.echo( '\n^bright^saved:~~\n' );
		$.log( confdata );
		process.exit();
	}
};
$.preload( [ 'files', 'hooks', 'cli' ], function() {
	Cli			= $('cli')				,
	Hooks		= $('hooks')			,
	Files		= $('files')			,
	Uglify		= require('./deps/uglify-js'),
	Weld		= require('./weld')		;
	Hooks.set(Cli.events.answer, function (options) { do_config(options); });
	Hooks.set(Cli.events.init, function (options) { do_config(options); });
	Hooks.set(Cli.events.command, function (options) { do_config(options); });
	Cli.init();
});
