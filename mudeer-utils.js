/*
 * creates a .gitignore file with important directives
 * */
global.$ = require(__dirname+'/kernel.js');
$.path = __dirname; // this is the mudeer root directory
var Cli, Files, Weld,
	dummyargs = { one: [], two: [], raw: [], keys: {}, };
var currentfolder = function () { return process.cwd().split('/').pop(); };
function print_help() {
	Cli.echo(' ^bright^mudeer-utils~~ needs at least one argument ');
	Cli.echo('    ^bright^ gitignore~~ creates a .gitignore file with important directives ');
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
