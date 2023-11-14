/*
 * uploads selected files and folder hierarchy to an ssh server
 * 
 * it can also optionally create databases on the server side
 * using 'mudeer-wuqu3aat' on the server
 * 
 * rafa3.slang is divided into multiple sections
 * 
 * // for files + directory structure
 * files
 * 		etc/		<- '/' forces it to be a directory, even if it's a file on dev-server
 * 					// without the hint, it'll check root dir stats...
 * 			*		<- everything in the dir should be copied, recursively
 * 		index.js
 * 		main.js
 * // for database installation + upgrades
 * database		yes
 * */

;(function(){
	var Cli		= false,
		Repl	= false,
		Files	= false,
		Slang	= false;
	
	var _mod = {
		_cache: {},
		install: function (args) {
			
			_mod.init();
			
			var configslang = '', conf = false;
			try {
				configslang = Files.get.file('rafa3.slang');
			} catch (e) {
				conf = {
				};
				$.log.s( 'rafa3.slang doesn\'t exist' );
				process.exit();
			}
			if (conf === false) {
				conf = Slang.parse(configslang.toString());
				conf = Slang.config.parse(conf);
			}

			/*
			 * allow a dry run to show conflicts in a real awesome way
			 * algorithm
			 * 
			 * 
			 * 
			 * 
			 * 
			 * 
			 * */

			if (_mod._cache.conn === undefined) {
				var path, node_ssh, ssh, fs

				fs = require('fs')
				path = require('path')
				node_ssh = require('node-ssh')
				ssh = new node_ssh()

				ssh.connect({
					host: '119.159.147.96',
					username: 'nano',
					port: 9922,
//					privateKey: '/home/steel/.ssh/id_rsa'
					password: 'love rpi',
					tryKeyboard: true,
					onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
						if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
							finish( [password] );
						}
					}
				}).then(function() {
					// Command
					ssh.execCommand('ls -hopa', { cwd:'/home/nano/Documents/projects/almudeer' }).then(function(result) {
						console.log('STDOUT: ' + result.stdout)
						console.log('STDERR: ' + result.stderr)
					});
				});

			} else {

				if ( args.keys.name === undefined ) {
					Cli.question('destination database name: ', args, 'name', Object.keys(dbjson)[0] );
				} else
				if ( args.keys.drop === undefined ) {
					Cli.question('drop old database? ', args, 'drop', 'no' );
				} else
				if ( args.keys.install === undefined ) {
					Cli.question('install new database? ', args, 'install', 'no' );
				} else
				if ( args.keys.save === undefined ) {
					Cli.question('save changes? ', args, 'save', 'no' );
				} else
				if ( typeof args.keys.name === 'string' )
					Repl.prompt();
				else
					Repl.prompt();
				
			}
		},
		init: function (repl, cli, files, slang) {
			Cli		= Cli	|| cli		||	$('cli')		,
			Repl	= Repl	|| repl		||	$('repl')		,
			Files	= Files	|| files	||	$('files')		,
			Slang	= Slang	|| slang	||	$.use('slang')	;
			
			return _mod;
		}
	};

	module.exports = _mod;

})();