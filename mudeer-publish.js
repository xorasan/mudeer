/*
 * uploads selected files and folder hierarchy to an ssh server
 * 
 * specify a xaadim dir and a zaboon dir
 * check their manaashir/ dirs
 * if nothing in there, mudeer-nashar them
 * takes xpo files from both dirs and merge them
 * stores all files in rafa3 (upload) of the last project
 * then uploads them using an ssh+ftp connection
 * asks before overwrites (shows dates for comparison)
 * 
 * */

'use strict';
var Hooks, Cli, Files, Uglify, Slang;

var ansha = require('./mudeer-build');
var nashar = function (args) {
	var nasharslang = false, nasharfile = 'nashar.slang';
	if (nasharfile && nasharfile.length) {
		try {
			nasharslang = Files.get.file(nasharfile);
			nasharslang = nasharslang.toString();
			nasharslang = Slang.parse( nasharslang );
			nasharslang = Slang.config.parse( nasharslang );
		} catch (e) {
			Cli.echo(' ^bright^'+nasharfile+'~~ not found ');
			return;
		}
	}
	
	var ugl = false, min = false, cmp = false, vrb = false, pro = false, dbg = false;
	if (args.keys.pro || args.keys.p) ugl = true, min = true, cmp = true, pro = true;
	if (args.keys.vrb || args.keys.v) vrb = args.keys.vrb || args.keys.v || false;
	if (args.keys.ugl || args.keys.u) ugl = true;
	if (args.keys.cmp || args.keys.c) cmp = true;
	if (args.keys.min || args.keys.m) min = true;
	if (args.keys.dbg || args.keys.d) dbg = true;
	
	var topath = process.cwd();
	var BUILDNUMBER = args.keys.buildnum || 0;
	if (args.keys.buildnum == undefined) {
		try {
			BUILDNUMBER = Files.get.file('number.slang');
			BUILDNUMBER = BUILDNUMBER.toString();
		} catch (e) {
			// ignore because we can make do without both these files
		}
	}
	
	try {
		process.chdir( nasharslang.xaadim );
		Cli.echo( '\n ~blue~^bright^ xaadim ~~ '+nasharslang.xaadim );
	} catch (e) {
		Cli.echo(' ^bright^'+nasharslang.xaadim+'~~ not found ');
		return;
	}
	
	Files.pop.file(topath+'/xudoo3');
	Files.set.symlink(process.cwd()+'/manaashir/xudoo3', topath+'/xudoo3');
	
	var xpo = ansha({
		keys: {
			uglify: ugl, minify: min, compress: cmp, debug: dbg, xpath: topath,
			verbose: vrb, pro: pro, buildnum: BUILDNUMBER,
		}
	}, {});
	
	try {
		process.chdir( nasharslang.zaboon );
		Cli.echo( '\n ~blue~^bright^ zaboon ~~ '+nasharslang.zaboon );
	} catch (e) {
		Cli.echo(' ^bright^'+nasharslang.zaboon+'~~ not found ');
		return;
	}

	xpo = ansha({
		keys: {
			uglify: ugl, minify: min, compress: cmp, debug: dbg, xpath: topath,
			verbose: vrb, pro: pro, buildnum: BUILDNUMBER,
		}
	}, xpo);
	
	try {
		process.chdir( topath );
		Cli.echo( '\n ~blue~^bright^ nashar ~~ '+topath+'\n' );
	} catch (e) {
		Cli.echo(' ^bright^'+topath+'~~ not found ');
		return;
	}

	Files.set.file( 'xpo.slang', Slang.toslang(xpo) );
	++BUILDNUMBER;
	Files.set.file( 'number.slang', ''+( BUILDNUMBER || '' ) );
};
$.preload( [ 'files', 'hooks', 'cli' ], function() {
	Cli			= $('cli')				,
	Hooks		= $('hooks')			,
	Files		= $('files')			,
	Uglify		= require('./uglify-js'),
	Slang		= $.use('slang')		;
	Hooks.set(Cli.events.answer, function (options) { nashar(options); });
	Hooks.set(Cli.events.init, function (options) { nashar(options); });
	Hooks.set(Cli.events.command, function (options) { nashar(options); });
	Cli.init();
});
