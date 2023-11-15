;(function(){
	/*
	 * don't gen this using *glatteis install*
	 * find a way to decompose this into parts and require them in order
	 * or try removing dependency on glatteis altogether (bad idea!)
	 * 
	 * either way, i'd like this to be as independent and build-free as possible
	 * */
	global.$ = require('./etc/glatteis.js');
	$.path = __dirname;
	
	$.cache('files', '/home/nano/Documents/projects/glatteis/src/ge-files.js');
	$.cache('cli', '/home/nano/Documents/projects/glatteis/src/ge-cli.js');
	$.cache('hooks', '/home/nano/Documents/projects/glatteis/src/ge-hooks.js');
	
	$.preload
	(
		[
			'hooks',
			'cli',
			'files',

			// local mods
			'slang', 
			'htm', 
			'css', 
			'sql', 
		],
		function() {
			var Cli = $('cli'),
				Slang = $('slang'),
				Files = $('files');
			
			$('cli').init();

			// since this is always used
			$('slang').init();
			
			/*
			 * this command mainly handles these things
			 * 		gens whatever kinda file is thrown at it using +markers
			 * 		-o[utput] determines target file name to gen to
			 * 
			 * 		gens a pwa using .multi if -pwa is specified
			 * 
			 * any arguments at the beginning that don't start with '-' are
			 * treated as ordered filepaths
			 * */
			 
			var args = process.argv.slice(2);
			
			if (args.length === 0) {
				$.log.s( 'needs more args' );
				process.exit();
			}
			else {
				var allfiles			= [],
					filesconcat			= '',
					ispwa				= false,
					output				= false,
					outputspecified		= false;
				
				args.forEach(function (arg) {
					if ( arg.startsWith('-o') || arg.startsWith('--o') ) {
						outputspecified = true;
						// output path is set on next iteration
					}
					else if ( arg.startsWith('-pwa') || arg.startsWith('--pwa') ) {
						ispwa = true;
					}
					else {
						if (outputspecified)
							output = arg;
						else
							allfiles.push(arg);
					}
				});
				
				if (allfiles.length === 0) {
					$.log.s( 'no files specified' );
					process.exit();
				}

				/*
				 * this code was to allow specifying multiple file names
				 * but for now i'm limiting it to only one, the last one spec'd
				 * will be passed to multi
				 * */
//				allfiles.forEach(function (path) {
//					$.log.s( 'getting file:', path );
//
//					try {
//						filesconcat += Files.get.file( path ).toString();
//					} catch (e) {
//						Cli.echo( '~yellow~`black`\t not found ~~' );
//					}
//				});
				
				filesconcat = Slang.multi( allfiles.pop(), {
					uglify:		true,
					compress:	true,
//					savetemp:	true,
					jsmode:		true,
				} );

				if (output) {
					$.log.s( 'writing to:', output );
					Files.set.file( output, filesconcat.parsed );
				} else
					$.log.s( filesconcat.parsed );
			}

//			var parsedoutput = $('slang').multi( 'test.slang', null, {compress: false} );
//			$.log.s( parsedoutput.map );
//			$.log.s( parsedoutput.parsed );

		}
	);

	var _mod = {
		
	};

	module.exports = _mod;

})();
