/*
 * Takes data from specified projects, merges it in specified folders, turns symlinks into real copies
 * Basically prepares a self-contained portable folder from the server+client+... folders of a full stack mudeer app
 * 
 * 
 * specify a server dir and a client dir and any others
 * check their pub/ dirs
 * if nothing in there, mudeer-build them
 * takes xpo files from both dirs and merge them
 *
 * config specifies which sub project's config.w is copied into the target directory
 * 
 * format:
 * include
 *   database
 *     disabled y
 *     minify y
 *     target released/dewaan-db
 *   server
 *   client
 *   ...
 * target released
 * config server
 * icon   icon.png
 * */

'use strict';
var Hooks, Cli, Files, Uglify, Weld;
var echo;

var do_build = require('./mudeer-build'); // this also loads mudeer kernel $ $$

var get_configw = function (path) {
	var configw = false;
	try {
		configw = Files.get.file(path+'/config.w').toString();
	} catch (e) {
		Cli.echo(' '+path+' ');
		Cli.echo(' config.w not found, try ^bright^mudeer-create~~ ');
		return false;
	}
	if (configw === false) return false;
	
	if (configw === false || configw.length === 0) {
		Cli.echo(' config.w in '+path+' is empty, release aborted! ');
		return false;
	}
		
	return Weld.config.parse( Weld.parse( configw ) );
};
var do_release = function (args) {
	var releasew = false, releasefile = 'release.w';
	if (releasefile && releasefile.length) {
		try {
			releasew = Files.get.file(releasefile);
			releasew = releasew.toString();
			releasew = Weld.parse( releasew );
			releasew = Weld.config.parse( releasew );
		} catch (e) {
			Cli.echo(' ^bright^'+releasefile+'~~ not found ');
			return;
		}
	}
	
	var ugl = false, min = false, cmp = false, vrb = false, pro = false, dbg = false;
	if (args.keys.pro || args.keys.p) ugl = true, min = true, cmp = true, pro = true;
	if (args.keys.vrb || args.keys.v) vrb = args.keys.vrb || args.keys.v || releasew.verbose || false;
	if (args.keys.ugl || args.keys.u) ugl = true;
	if (args.keys.cmp || args.keys.c || releasew.compress) cmp = true;
	if (args.keys.min || args.keys.m) min = true;
	if (args.keys.dbg || args.keys.d) dbg = true;
	
	var target_path = releasew.target || 'released';
	Files.set.folder(target_path);
	
	var combined_deps = [], sub_projects = releasew.include;
	if (releasew.include) {
		if (!(sub_projects instanceof Array)) {
			sub_projects = Object.keys( releasew.include );
		}
		for (var i in sub_projects) {
			var configw = get_configw( sub_projects[i] );
			if (configw.deps instanceof Array) {
				configw.deps.forEach(function (o) {
					if (!combined_deps.includes(o)) combined_deps.push(o);
				});
			}
		}
	}

	// if there's no sub projects then quit
	if (sub_projects.length === 0) {
		echo( ' ~red~^bright^ release.w has no sub projects~~, please ^bright^include~~ at least one sub project ' );
		return;
	}
	
	// TODO allow 'update-only', 'always-copy'; default mode is 'missing-only'
	// copy deps recursively
	if (combined_deps.length) {
		echo( ' ^bright^'+combined_deps.length+' dependencies~~' );
		Files.set.folder(target_path+'/deps');
		var previous_deps = Files.get.folder(target_path+'/deps');

		combined_deps.forEach(function (o) {
			if (previous_deps.includes(o)) {
				if (vrb) echo( '   '+o+' ^dim^already copied, skipping~~ ' );
			} else {
				echo( '   '+o+' ^dim^copying~~' );
				Files.copy_recursive( $.path+'/deps/'+o, target_path+'/deps/'+o );
			}
		});
	}

	// change to target directory to get the build number
	try {
		process.chdir( target_path );
	} catch (e) {
		Cli.echo(' ~red~^bright^ '+target_path+'~~ not found ');
		return;
	}

	// this is the release-wide build number, independent of sub projects
	var BUILDNUMBER = args.keys.buildnum || 0;
	if (args.keys.buildnum == undefined) {
		try {
			BUILDNUMBER = Files.get.file('number.w');
			BUILDNUMBER = BUILDNUMBER.toString();
		} catch (e) {
			// ignore because we can make do without both these files
		}
	}

	// go back to the root directory
	process.chdir( '..' );

	// copy the icon if any is specified
	if (releasew.icon) {
		Cli.echo( '\n copying ^bright^'+releasew.icon+'~~ to ^bright^'+target_path+'~~ ' );
		try {
			Files.copy( releasew.icon, target_path+'/e.png' );
		} catch (e) {
			$.log( e );
			Cli.echo(' ~red~^bright^ '+releasew.icon+' ~~ not found ');
			return;
		}
	}
	
	// go through each sub project, build it with the previous xpo and output the pub to target_path
	var xpo = {};
	var remove_comments = releasew.remove_comments || false;
	sub_projects.forEach(function (o) {
		try {
			process.chdir( o );
			Cli.echo( '\n ~blue~^bright^ sub project ~~ '+o );
		} catch (e) {
			Cli.echo(' ~red~^bright^ '+o+'~~ error ');
			$.log( e );
			return;
		}
		
		xpo = do_build({
			keys: {
				uglify: ugl, minify: min, compress: cmp, debug: dbg, xpath: '../'+target_path,
				verbose: vrb, pro: pro, buildnum: BUILDNUMBER, prepad: 2,
				remove_comments: remove_comments,
			}
		}, xpo);

		process.chdir( '..' );
	});

	// copy config from specified sub project to the target directory
	if (releasew.config) {
		Cli.echo( '\n copying ^bright^config.w~~ from ^bright^'+releasew.config+'~~ to ^bright^'+target_path+'~~ ' );
		try {
			Files.copy( releasew.config+'/config.w', target_path+'/config.w' );
		} catch (e) {
			$.log( e );
			Cli.echo(' ~red~^bright^ '+releasew.config+'/config.w ~~ not found ');
			return;
		}
	}
	
	try {
		process.chdir( target_path );
		Cli.echo( '\n ~blue~^bright^ release path ~~ '+target_path+'\n' );
	} catch (e) {
		Cli.echo(' ~red~^bright^ '+target_path+'~~ not found ');
		return;
	}

	Files.set.file( 'xpo.w', Weld.toslang(xpo) );
	++BUILDNUMBER;
	Files.set.file( 'number.w', ''+( BUILDNUMBER || '' ) );
};
$.preload( [ 'files', 'hooks', 'cli' ], function() {
	Cli			= $('cli')				,
	Hooks		= $('hooks')			,
	Files		= $('files')			,
	Uglify		= require('./deps/uglify-js'),
	Weld		= require('./weld')		;
	Hooks.set(Cli.events.answer, function (options) { do_release(options); });
	Hooks.set(Cli.events.init, function (options) { do_release(options); });
	Hooks.set(Cli.events.command, function (options) { do_release(options); });

	echo = Cli.echo;
	Cli.init();
});
