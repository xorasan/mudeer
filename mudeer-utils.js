/*
 * creates a .gitignore file with important directives
 * */
global.$ = require(__dirname+'/kernel.js');
$.path = __dirname; // this is the mudeer root directory
var Cli, Files, Weld,
	dummyargs = { one: [], two: [], raw: [], keys: {}, };
var currentfolder = function () { return process.cwd().split('/').pop(); };
function print_help() {
	Cli.echo(' ^bright^mudeer-utils~~ needs at least command ');
	Cli.echo('    ^bright^ gitignore~~ creates a .gitignore file with important directives ');
	Cli.echo('    ^bright^ get-icons~~ takes icon names and gives a compressed string ');
}
var do_install = function (args) {
	var pathprefix = './';
	
	if (args.raw.length === 0) {
		print_help();
		return;
	}
	
	if (args.raw[0] == 'gitignore') {
		try {
			var rootfolder = Files.get.folder(pathprefix) || [];
//			if ( !rootfolder.includes('.gitignore') ) // if file .gitignore is not there
				Files.set.file( pathprefix+'.gitignore', Files.get.file($.path+'/.gitignore').toString() );

			Cli.echo(' .gitignore created ');
		} catch (e) {}
	} else if (args.raw[0] == 'get-icons') {
		var icons = args.raw.slice(1);
		if (icons.length === 0) {
			Cli.echo(' ^bright^ get-icons~~ needs at least one icon names ');
			return;
		}

		try {
			var icon_files = {};
			icons.forEach(function (o, i) {
				try {
					var file = Files.get.file($.path+'/icons/'+o+'.svg');
					if (file) {
						icon_files[ o ] = file.toString().replace(/\n/g, '').replace(/  /g, '').trim();
					}
				} catch (e) {}
			});
//			var rootfolder = Files.get.folder(pathprefix) || [];
//				Files.set.file( pathprefix+'.gitignore', Files.get.file($.path+'/.gitignore').toString() );
//
			Cli.echo( JSON.stringify( icon_files ) );
		} catch (e) {}
	} else {
		print_help();
	}
};
$.preload( [ 'files', 'hooks', 'cli' ], function() {
	Cli			= $('cli')				,
	Hooks		= $('hooks')			,
	Files		= $('files')			,
	Weld		= require('./weld')		;
	Hooks.set(Cli.events.answer, function (options) { do_install(options); });
	Hooks.set(Cli.events.init, function (options) { do_install(options); });
	Hooks.set(Cli.events.command, function (options) { do_install(options); });
	Cli.init();
} );
