/* 04 Jun 2018
 * events-code: 3129*
 * common command line interface for linux terminals
 * basic building blocks, ansi codes, colors, basic formatting
 * emits using hooks
 * 		cli-resize	{ rows, cols }
 * 		cli-close	sync function
 * 		cli-command	{ raw, args{} }
 * 		cli-hint	{ line }
 * 		cli-answer	{ line }
 * 		gets you the -* & --* & commands & everything in raw
 * 		cli-init	{ raw (args), one, two, commands }
 * listens using hooks
 * 		cli-ask		{ question, options } returns answer
 */

Cli = {};
;(function () {
	var _ = {
		events: {
			cli:		3129,

			resize:		3129010,
			close:		3129020,
			command:	3129030,
			hint:		3129040,
			answer:		3129050,
			init:		3129060,

			ask:		3129500,
		},
		code: {
			Reset		: "\x1b[0m"		,
			_bright		: "\x1b[1m"		,
			_dim		: "\x1b[2m"		,
			_underscore	: "\x1b[4m"		,
			_blink		: "\x1b[5m"		,
			_reverse	: "\x1b[7m"		,
			_hidden		: "\x1b[8m"		,
								
			Fgblack		: "\x1b[30m"	,
			Fgred		: "\x1b[31m"	,
			Fggreen		: "\x1b[32m"	,
			Fgyellow	: "\x1b[33m"	,
			Fgblue		: "\x1b[34m"	,
			Fgmagenta	: "\x1b[35m"	,
			Fgcyan		: "\x1b[36m"	,
			Fgwhite		: "\x1b[37m"	,
								
			Bgblack		: "\x1b[40m"	,
			Bgred		: "\x1b[41m"	,
			Bggreen		: "\x1b[42m"	,
			Bgyellow	: "\x1b[43m"	,
			Bgblue		: "\x1b[44m"	,
			Bgmagenta	: "\x1b[45m"	,
			Bgcyan		: "\x1b[46m"	,
			Bgwhite		: "\x1b[47m"	
		},
		/*
		 * ^cmd^	= command: blink, bright, underscore...
		 * `color`	= fg color
		 * ~color~	= bg color
		 * ``		= reset
		 * ~~		= reset
		 */
		ansi: function (str) {
			var rs = /\`\`/,
				r2 = /\~\~/,
				cm = /\^([\w]+)\^/,
				fg = /\`([\w]+)\`/,
				bg = /\~([\w]+)\~/;
			
			while (fg.test(str)) {
				str = str.replace(fg, function () {
					return _.code[ 'Fg'+arguments[1] ];
				});
			}
			
			while (bg.test(str)) {
				str = str.replace(bg, function () {
					return _.code[ 'Bg'+arguments[1] ];
				});
			}
			
			while (cm.test(str)) {
				str = str.replace(cm, function () {
					return _.code['_'+arguments[1]];
				});
			}
			
			while (rs.test(str)) {
				str = str.replace(rs, function () {
					return _.code.Reset;
				});
			}
			
			while (r2.test(str)) {
				str = str.replace(r2, function () {
					return _.code.Reset;
				});
			}
			
			return str;
		},
		echo: function () {
			var args = [];
			
			for (var i in arguments) {
				args.push( _.ansi( arguments[i] ) );
			}
			
			console.log.apply(console, args);
		},
		write: function () {
			var str = '';
			
			for (var i in arguments) {
				str += _.ansi( arguments[i] );
			}
			
			process.stdout.write(str);
		},
		rl: false,
		rli: false,
		width: 80,
		height: 24,
		/* my format, if this is defined, commands send parsed arguments
		 * install: {
		 * 		--			 -		 details						 type 		default
		 * 		overwrite:	['o',	'overwrite existing files',		'true',		false	],
		 * 		public:		['p',	'create /public folder',		'true',		false	],
		 * 		public:		['p',	'create /public folder',		'true',		false	],
		 * },
		 * */
		define: function () {
			
		},
		// remember the sizes internally
		sizes: function () {

			_.width = process.stdout.columns,
			_.height = process.stdout.rows;
		
		},
		// clear the terminal screen completely
		clear: function () {
			if (!_.rl || !_.rli) {
				_.setonresize();
				_.sizes();
				process.stdout.cursorTo(0, 0);
				var str = '';
				
				for (var i = 0; i < _.width; ++i) {
					for (var j = 0; j < _.height; ++j) {
						str += ' ';
					}
					str += '\n';
				}
				
				_.write(str);

			} else {
				_.rl.cursorTo(process.stdout, 0, 0);
				_.rl.clearScreenDown(process.stdout);
			}
		},
		commands: 'exit '.split(' '),
		completer: function (line, callback) {
			Hooks.run( _.events.hint, {
				line:		line,
				callback:	callback
			});
		},
		_prompt: '~magenta~ > ~~ ',
		_autoprompt: false,
		setautoprompt: function (auto) {
			_._autoprompt = !!auto;
		},
		/*
		 * off by setting text to false
		 * on by specifying the actual text
		 */
		prompt: function (text) {
			if (!_.rl || !_.rli) _.cli();
			
			if (text === false) {
				_.rli.prompt(false);
			} else if (text === true) {
				_.setprompt( _.ansi( _._prompt ) );
				_.rli.prompt(true);
			} else {
				_.setprompt( text );
				_.rli.setPrompt( _.ansi(_._prompt) );
				_.rli.prompt(true);
			}
		},
		setprompt: function (text) {
			_._prompt = text === undefined ? _._prompt : text;
		},
		/*
		 * **as-is:** What you enter, is what you get
		 *  - 'string', 1,  true
		 * - **int:** Is converted to an Integer wrapped in a Number Object
		 *  - 'int', 'number', 'num',
		 *  - 'time', 'seconds', 'secs', 'minutes', 'mins'
		 *  - 'x', 'n'
		 * - **date:** Is converted to a Date Object
		 *  - 'date', 'datetime', 'date_time'
		 * **float:** Is converted to a Float wrapped in a Number Object
		 *  - 'float', 'decimal'
		 * **file:** Is converted to a String Object if it is a valid path
		 *  - 'path', 'file', 'directory', 'dir'
		 * **email:** Converted to a String Object if it is a valid email format
		 *  - 'email'
		 * **url:** Converted to a String Object if it is a valid URL format
		 *  - 'url', 'uri', 'domain', 'host'
		 * - **ip:** Converted to a String Object if it is a valid IP Address format
		 *  - 'ip'
		 * - **true:** Converted to true if argument is present on command line
		 *  - 'bool', 'boolean', 'on'
		 * **false:** Converted to false if argument is present on command line
		 *  - 'false', 'off', false, 0
		 */
		gettype: function (type) {
			if (typeof type !== 'string') return 's';
			if (type.startsWith('fl')) {
				return 'f';
			} else
			if (type.startsWith('int') || type.startsWith('num')) {
				return 'n';
			} else
			if (type.startsWith('bool')) {
				return 'b';
			} else {
				return 's';
			}
		},
		parsetype: function (type, value) {
			type = _.gettype(type);
			if (type == 'f') {
				var result = parseFloat(value);
				if (result !== NaN) return result;
			} else
			if (type == 'n') {
				var result = parseInt(value);
				if (result !== NaN) return result;
			} else
			if (type == 'b') {
				var no = ['no', 'false', 'n', '0', 'nope', 'off', 'f'],
					yes = ['yes', 'true', 'y', '1', 'yep', 'on', 't'];
				if (no.includes(value)) return false;
				if (yes.includes(value)) return true;
			}
			return value;
		},
		answerlogic: function (ans, def, type) {
			type = _.gettype(type);
			if (['f', 'n'].includes(type)) {
				return ans || def;
			} else
			if (type == 'b') {
				return ans === '' ? def : ans;
			} else
			if (type == 's') {
				return ans === '' ? def : ans;
			}
			return value;
		},
		/*
		 * finds the biggest string in an [], returns a function that fills any
		 * string provided with spaces to make it as big as the biggest string
		 */
		getfiller: function (obj) {
			var biggest = 0;
			if (obj instanceof Array) {
				for (var i in obj) {
					var len = (obj[i] || '').length;
					
					if ( len > biggest ) {
						biggest = len;
					}
				}
			} else
			if (obj instanceof Object) {
				for (var i in obj) {
					if ( obj.hasOwnProperty(i) ) {
						var len = (i || '').length;
						
						if ( len > biggest ) {
							biggest = len;
						}
					}
				}
			} else
			if (obj instanceof String) {
				biggest = obj.length;
			}
				
			return function (str) {
				if (str.length < biggest) {
					str = str+( ' '.repeat( biggest-str.length ) );
				}
				return str;
			};
		},
		_inquestion: false,
		/*
		 * callback Function || Object, treated as args if not function
		 * 
		 * */
		question: function (query, callback, key, def, type) {
			if (!_.rl || !_.rli) _.cli();
			
			_._inquestion = true;
			
			var defstr = def === undefined || def === null ? '' : '~black~^dim^('+def+')~~ ';
			if ([0, '', '?', 'null', undefined, null].includes(query)) {
				query = _._prompt;
			}
			
			_.rli.question(_.ansi( query + defstr ), function () {
				_._inquestion = false;
				var ans = _.parsetype(type, arguments[0]);
				
				def = _.parsetype(type, def);
				
				// if answer is ^C, don't callback
				if (ans === '^C') {
					if (_.iscli) process.exit();
					return false;
				}
				
				if (typeof callback === 'function') {
					callback( ans );
				} else {
					// callback is an {}
					callback = callback || {};
					callback.answer		= _.answerlogic(ans, def, type);
					callback.question	= query;
					if (key !== undefined) {
						callback.keys[key] = _.answerlogic(ans, def, type);
					}
					Hooks.run( _.events.answer, callback);
				}

			});
		},
		_onresize: false,
		setonresize: function () {
			if (!_._onresize) {
				_._onresize = true;
				process.stdout.on('resize', function () {
					_.sizes();
					// new and approved
					Hooks.run('cli-resize', {
						rows: _.height,
						cols: _.width
					});
					// deprecated
					Hooks.run(_.events.resize, {
						rows: _.height,
						cols: _.width
					});
				});
			}
		},
		cli: function () {

			var readline = require('readline'),
				rl = readline.createInterface(
									process.stdin,
									process.stdout,
									_.completer
							);
							
			/* @todo
			 * If terminal is true for this instance then the output stream will
			 * get the best compatibility if it defines an output.columns property,
			 * and fires a "resize" event on the output if/when the columns ever
			 * change (process.stdout does this automatically when it is a TTY).
			 * */
			
			_.rl = readline;
			_.rli = rl;

			rl.on('line', function(line) {

				line = line.trim();

				switch(line) {
					case 'quit':
					case 'exit':
						process.exit(0);
						break;
				}
				
				Hooks.run( _.events.command, _.processargs(line.split(' ')) );

				if (_._autoprompt) {
					_.prompt(true);
				}
			
			}).on('SIGINT', function() {

				Hooks.set(_.events.close, _.events.cli, function () {
					if (_._inquestion) {
						_._inquestion = false;
						_.echo('^C'); // @todo better way to cancel a question
//						if (_.iscli) _.prompt(); else
						process.exit(0);
					} else {
						_.echo('exit');
						process.exit(0);
					}
				});
				Hooks.rununtilconsumed(_.events.close);
			
			});
			
			_.setonresize();
			
		},
		processargs: function (raw) {
			var args		= {
					raw:	[],
					one:	[],
					two:	[],
					cmd:	[],
					keys:	[],
				},
				lastkey = false;
			
			args.raw = raw;
			
			for (var i in raw) {
				var arg = raw[i];
				
				if ( arg.startsWith('--') || arg.match(/^-\w.*/) ) {
					lastkey = arg.startsWith('--') ? arg.substr(2) : arg.substr(1);
					
					// @todo if keytype = bool, assign it immediately
					args.keys[lastkey] = args.keys[lastkey] || true;
					
				} else {
					if (lastkey) {
						// @todo if len > 1 check key's mapping to short version
						
						if ( args.keys[lastkey] === true ) {
							args.keys[lastkey] = [];
						}
						args.keys[lastkey].push(arg);
					} else {
						args.cmd.push(arg);
					}
				}
				
				// @todo phase these out if they have no use
				if (arg.startsWith('--')) {
					args.two.push(arg);
				} else
				if (arg.match(/^-\w.*/)) {
					args.one.push(arg);
				}

			}
			
			for (var i in args.keys) {
				if (args.keys[i].length === 1) {
					args.keys[i] = args.keys[i][0];
				}
			}

			args = _.parseargs(args);
			
			return args;
		},
		parseargs: function (args) {
			for (var i in args.keys) {
				args.keys[i] = _.parsetype( null, args.keys[i] );
			}
			
			return args;
		},
		/*
		 * takes options object
		 * 		prompt:		defautl '>'
		 * 		autoprompt:	false
		 * 		cli:		boolean, default false, enters cli and waits for input
		 * this will start generating hooks events
		 */
		init: function (options) {

			var options		= options || {},
				raw			= process.argv.slice(2),
				iscli		= process.stdout.isTTY;
			
			var args = _.processargs(raw);
			args.iscli = iscli;
			
			_.iscli = iscli;
			_.setautoprompt(options.autoprompt);
			_.sizes();
			
			// if it's a tty, setup the cli
			if (iscli && options.cli) {

				_.cli();
				_.prompt(options.prompt);

			}
			
			// generate the first event
			Hooks.run(_.events.init, args);

		}
	};
	
	module.exports = Cli = _;
})();
