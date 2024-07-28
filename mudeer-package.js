/*
 * checks if released/ exists, tars it into project-name-build.tgz
 * */

'use strict';
var Hooks, Cli, Files, Weld;
var echo;

var do_build = require('./mudeer-build'); // this also loads mudeer kernel $ $$
var tar = require('./deps/node-tar');
var node_path = require('path');

var do_package = function (args) {

	try {
		Files.get.folder('released');
	} catch (e) {
		if (e.code == 'ENOENT') {
			echo( '\n ~red~ no released/ dir, try ^bright^mudeer-release~~~red~ first ~~ \n' );
		}
		process.exit();
	}

	Files.set.folder('packages');

	// this is the release-wide build number, independent of sub projects
	var BUILDNUMBER = args.keys.buildnum || 0;
	if (args.keys.buildnum == undefined) {
		try {
			BUILDNUMBER = Files.get.file('released/number.w');
			BUILDNUMBER = BUILDNUMBER.toString();
		} catch (e) {
			// ignore because we can make do without both these files
		}
	}
	
	echo( '\n ~blue~^bright^ build number ~~ '+BUILDNUMBER+'\n' );

	var project_name = node_path.basename( process.cwd() );
	var package_path = process.cwd() +'/packages/'+ project_name +'-'+BUILDNUMBER+'.tgz';

	var no_deps = (args.keys.nodeps || args.keys.n);
	var released = (args.keys.released || args.keys.r);
	var filter_function;
	filter_function = function (path, stat) {
		if (path.match(/addons.*\/data/g)) {
			return false;
		}
		if (no_deps) { // exclude the deps folder
			if (path.startsWith('./deps')) {
				return false;
			}
		}
		if (path.startsWith('./media')) { // TODO make this dynamically specifiable in package.w
			return false;
		}
		return true;
	};

	// TODO print total size and files at the end
	tar.c(
		{
			gzip: true,
			file: package_path,
			filter: filter_function,
			cwd: 'released',
			prefix: released ? 'released' : (project_name +'-'+BUILDNUMBER),
		},
		['.']
	).then(_ => {
		echo( '\n ~blue~^bright^ Packaged into ~~ '+package_path+'\n' );
	});

};
$.preload( [ 'files', 'hooks', 'cli' ], function() {
	Cli			= $('cli')				,
	Hooks		= $('hooks')			,
	Files		= $('files')			,
	Weld		= require('./weld')		;
	Hooks.set(Cli.events.answer, function (options) { do_package(options); });
	Hooks.set(Cli.events.init, function (options) { do_package(options); });
	Hooks.set(Cli.events.command, function (options) { do_package(options); });

	echo = Cli.echo;
	Cli.init();
});
