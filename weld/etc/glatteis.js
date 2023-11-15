
//shims
//### /home/nano/Documents/projects/glatteis/src/engine/shims.js
/* 01 Jan 2017
 * these are on demand
 * included in the custom engine build process
 * standard ECMA/JS shims
 * don't include shims for non-standard JS features
 * or vendor specific features here
 * index   engine/shims.js
 * 				  shims/node.js
 * 				  shims/dom-removenode.js
 * 				  shims/object-create.js
 * 				  shims/object-assign.js
 * 				  shims/string-trim.js
 */

if (typeof module !== 'object') { module = {}; }
if (typeof module.exports !== 'object') { module.exports = {}; }
if (typeof window !== 'object') { window = global||{}; }
if (typeof document !== 'object') {
	document = {
		body: {},
		getElementsByTagName: function () { return []; }
	};
}


//frontend-srv
//### /home/nano/Documents/projects/glatteis/src/engine/frontend-srv.js
var glatteis = {
};

// if fn is not provided, that means the user is expecting immediate response and no deferring
// in that case, return false if the module is not loaded
// otherwise load the module and then run fn(mod)
/*
 * a move to .then(cb) would be awesome or nuh?
 * @todo indeed.
 */
var glatteisfn = function (name, fn) {
	if (name) {

		// if the mod is loaded or it's a core module
		var mod = (glatteis._mods[name] || glatteis[name]);

		if (mod) {
			if (typeof fn === 'function') {
				fn(mod);
				return null;
			} else {
				return (mod || false);
			}
		} else {
			var path = glatteis._paths[name] || ( $.path + '/src/ge-' + name + '.js' );
			
			if (typeof fn === 'function') { // defer execution
				glatteis.require(path, function(mod) {
					glatteis._mods[name] = mod;
					fn(mod);
				});
			} else {
				glatteis._mods[name] = glatteis.require( path );
				return glatteis._mods[name];
			}
		}

	}
	// if name wasn't provided
	return false;
};

var $ = $$ = glatteis = Object.assign(glatteisfn, glatteis);

if (typeof module === 'object') {
	module.exports = glatteis;
}

//log
//### /home/nano/Documents/projects/glatteis/src/engine/log.js
$.log = {
	history: [],
	add: function (p, t) {
		if (this.history.length > 9) {
			this.history.splice(1);
		}
		this.history.unshift({p:p, t:t});
//		if (glatteis.l) {
//			var hcount = 0;
//			for (var i in this.history) {
//				if (hcount < 5) {
//					var hi = this.history[i];
//					var str = hi.p + ': ' + (hi.t||'');
//					var strcolor = 'rgba(255, 255, 255, '+(0.6-(hcount*0.1))+')';
//					glatteis.l.ui.set('__log'+hcount, 
//						{
//							type: 't', x:'uw-20', y:6+(glatteis.l.fontSize*(hcount+1)),
//							t: str, al: 'right', layer: 99999,
//							fold: true, fgc: strcolor
//						}
//					);
//				}
//				++hcount;
//			}
//		}
	},
	s: function () {
		var a = '', str = '';
		for (var b in arguments) {
			if (b > 0) {
				a = a+', ';
			}
			a = a+'arguments['+b+']';
			str += ' '+ arguments[b];
		}
		this.add('s', str);
		eval('console.log('+a+');');
	},
	e: function () {
		var a = '', str = '';
		for (var b in arguments) {
			if (b > 0) {
				a = a+', ';
			}
			a = a+'arguments['+b+']';
			str += ' '+ arguments[b];
		}
		this.add('e', str);
		eval('console.error('+a+');');
	},
	i: function () {
		var a = '';
		for (var b in arguments) {
			if (b > 0) {
				a = a+', ';
			}
			a = a+'arguments['+b+']';
		}
		this.add('i:', a.toString());
		eval('console.info('+a+');');
	}
};

//mod-concat
//### /home/nano/Documents/projects/glatteis/src/engine/mod-concat.js
/*
 * this restores the initial module.exports = {} from
 * = glatteis by ._c
 * inclusion in other parent scripts after concatenation &
 * uglification
 */
$._r = function () {
	module.exports = glatteis;
};

/* 
 * used only when mods are concat'd
 * if no ._name property is present in mod, use the name argument
 * if no name argument, return false
*/
$._c = function (name) {
	var mod = module.exports;
	module.exports = {};

	if (mod instanceof Object 
		&& (typeof(name) === 'string' || typeof(mod._name) === 'string')
	) {
		if (typeof(mod._name) === 'string') {
			glatteis._mods[mod._name] = mod;
		} else {
			glatteis._mods[name] = mod;
		}
		
		return true;
	}
	
	return false;
};

//modules
//### /home/nano/Documents/projects/glatteis/src/engine/modules.js
$._modulePrototype = {
};

$._hooksPrototype = {
};

$._paths = {
};

$._mods = {
};

$.cache = function (name, path) { // cache a module's path
	this._paths[name] = path;
};

$.unload = function (mods, fn) {
	/*
	 * @TODO:	delete/unload mods from memory
	 * 			run ._unload per mod for a graceful exit
	 * 			once all mods are unloaded in a chain/order -> call fn
	 */
};

//use
//### /home/nano/Documents/projects/glatteis/src/engine/use.js
;(function (){
	$.use = function (project) {
		var glatteisprojects = process.env.HOME+'/Documents/projects/';

		/*
		 * improve this using native ge scripts
		 * once a dependency resolver is built-into ge
		 * then this 'use' engine module can be included alone in scripts
		 * and the repl will also include 'files'
		 * since it queries folders and gets files from them synchronously
		 * */
		var temp = $;
		var mod = require(glatteisprojects+project);
		global.$ = temp;
		return mod;
	};

})();


//preload
//### /home/nano/Documents/projects/glatteis/src/engine/preload.js
$.preload = function (mods, fn) { // loads mods then calls the fn
	if (mods instanceof Array) {
		var modnum = 0; // start by loading the first mod
		var increment = function () {
			++modnum;
			if (modnum < mods.length) {
				loadmod();
			} else {
				if (typeof fn === 'function') {
					fn();
				}
			}
		};
		/*
		 * load mods in order, get the name, see if its path is cached
		 * if we dont know where it's located or if it's already loaded
		 * move on -> increment()
		 * give ge require mod-path and receive mod's contents in callback
		 * cache the contents and move on -> increment()
		 */
		var loadmod = function () {
			var name = mods[modnum];
			
			// if already loaded
			if (glatteis._mods[name]) {
				// then move on
				increment();

			// not loaded but has cached path
			} else if (glatteis._paths[name]) {
				
				// require it from that cached path
				glatteis.require(glatteis._paths[name], function(mod) {
					glatteis._mods[name] = mod;
					increment();
				});
				
			// not loaded, no cached path
			} else {
				
				// require from a default path
				glatteis.require($.path + '/src/ge-' + name + '.js', function(mod) {
					glatteis._mods[name] = mod;
					increment();
				});
//			} else {
//				increment();
			}
		};
		loadmod();
	}
};

//array
//### /home/nano/Documents/projects/glatteis/src/engine/array.js
;(function (){
	var _arrayPrototype = {
		set: function (id, object) {
			if (this._keys[id] > -1) {
				if (typeof object === 'function') {
					this._array[this._keys[id]] = object(this._array[this._keys[id]]);
				} else {
					this._array[this._keys[id]] = object;
				}
			} else {
				if (typeof object === 'function') {
					this._keys[id] = this._array.push(
												object(this._array[this._keys[id]])
											) - 1;
				} else {
					this._keys[id] = this._array.push(object) - 1;
				}
				++this.length;
			}
			return this;
		},
		pop: function (id) {
			if (this._keys[id] > -1) {
				this._array[this._keys[id]] = undefined;
				delete this._keys[id];
				--this.length;
			}
			return this;
		},
		get: function (id) {
			if (this._keys[id] > -1) {
				return this._array[this._keys[id]];
			} else {
				return undefined;
			}
		},
		unique: function () {
			return this._array.sort().filter(function(item, pos, ary) {
				return !pos || item != ary[pos - 1];
			});
		},
		order: function (order) {
			var ordered = [];

			for (var i in order) {
				var val = order[i];
				
				var index = this._array.indexOf(val);
				if (index > -1) {
					ordered.push( this._array[index] );
					this._array.splice(index, 1);
				}
			}
			
			return ordered.concat(this._array);
		},
		toNative: function () {
			var arr = [];
			for (var i in this._array) {
				if (this._array[i] !== undefined) {
					arr.push(this._array[i]);
				}
			}
			return arr;
		}
	};
	
	$.array = function (prearray) {
		var newqueue = Object.create(_arrayPrototype);
		
		newqueue._array = prearray || [];
		newqueue._keys = {};

		newqueue.length = 0;
		
		return newqueue;
	};

})();


//queue
//### /home/nano/Documents/projects/glatteis/src/engine/queue.js
;(function (){
	var _queuePrototype = {
		_init: function () {
			if (!this._didinit) {
//				console.log('_init');
				this._didinit = true;
				this._didrun = false;
				
				this.queuearray = [];
				this.active = false;
				this.count = 0;
				this.uid = false;
				this._onnext = false;
				this._onfinish = false;
			}
		},
		_next: function (queue) {
//			console.log('_next');
			++queue.count;
			queue._process(queue);
			queue.active = false;
			return queue.count;
		},
		_process: function (queue) {
//			console.log('_process');
			if (typeof queue._onnext === 'function') {
				if (queue.queuearray.length > 0) {
					queue.uid = queue.queuearray.length;
					queue.active = true;
					
					var worker = queue.queuearray.pop();
					var done = function (queue, extra) {
						queue._onnext(queue._next, queue, extra);
					};
					
					worker(done, queue);
					
					return false;
				} else {
					queue.active = false;
					--queue.count;
					if (typeof queue._onfinish === 'function') {
						queue._onfinish(queue);
					}
					return false;
				}
			}
		},
		set: function (worker) {
//			console.log('set');
			this._init();
			
			if (typeof worker === 'function') {
				this.queuearray.unshift(worker);
			}
			
			return this;
		},
		run: function (_onfinish) {
//			console.log('run');

			this.onfinish(_onfinish);

			var queue = this;
			queue._init();
			
			// if there's no _onnext fn set, use the built in one
			if (typeof queue._onnext !== 'function') {
				queue.onnext(function (done, _queue) {
					done(_queue);
				});
			}
			
			// TODO, _onnext can be made optional
			if (!queue._didrun
			&&	typeof queue._onnext === 'function') {
				queue._didrun = true;
				
				queue._process(queue);
			}
		},
		onnext: function (cb) {
			if (typeof cb === 'function') {
				this._onnext = cb;
			}
		},
		onfinish: function (cb) {
			if (typeof cb === 'function') {
				this._onfinish = cb;
			}
		}
	};
	
	$.queue = function (onnext, onfinish) {
		var newqueue = Object.create(_queuePrototype);
		newqueue._init();
		
		if (typeof onnext === 'function') {
			newqueue._onnext = onnext;
		}
		if (typeof onfinish === 'function') {
			newqueue._onfinish = onfinish;
		}
		
		return newqueue;
	};
	
//	var ourarray = [
//		{text: 'one', num: 1},
//		{text: 'two', num: 2},
//		{text: 'three', num: 3},
//		{text: 'four', num: 4}
//	];
//	
//	var finalarray = [];
//	
//	var ourworker = function (done, queue) {
//		$.log.s('ourworker', queue.count, ourarray[queue.count].text);
//		var extra = {com: ourarray[queue.count].text+ourarray[queue.count].num};
//		done(queue, extra);
//	};
//	
//	var ouronnext = function (done, queue, extra) {
//		$.log.s('ouronnext', queue.count, ourarray[queue.count].text);
//		finalarray.push(extra);
//		done(queue);
//	};
//	
//	var ouronfinish = function (queue) {
//		$.log.s('ouronfinish', queue.count);
//		for (var i in finalarray) {
//			console.log(finalarray[i]);
//		}
//	};
//	
//	var queue = $.queue(ouronnext, ouronfinish);
//	for (var i in ourarray) {
//		queue.set(ourworker);
//	}
//	queue.run();

})();


//require
//### /home/nano/Documents/projects/glatteis/src/engine/require.js
;(function (){
	/*	queue requests
	 *	first one has to timeout for the next one to work
	 *	TODO: implement duktape xhrs
	 */

	var qr = {
		atv: false,
		cnt: 0,
		id: false,
		qA: [],
		queue: function (oP) {
			this.qA.unshift(oP);
			this.id = this.qA.length;
			if (this.atv == true) { return this.cnt; }
			return this.process();
		},
		process: function (a) {
			if (this.qA.length) {
				this.id = this.qA.length;
				this.atv = true;
				var oP = this.qA.pop();
				{
					/*
					 * TODO
					 * this solves the local includes prob on linux
					 * test on windows and figure out a cross platform way of doing
					 * this
					*/
					if (oP.s.match(/http.*\:\/\//) === null) {
						if (typeof nw === 'object') {
							oP.s = 'file://'+oP.s;
						}
					}
					
					var rq;
//					var shorty = oP.s.replace(glatteis.sys.path, '');
					var shorty = oP.s;
					if (window.XMLHttpRequest) { 
						rq = new XMLHttpRequest();
					}
					/* 
					 * TODO
					 * replace "require" with http.request, code in a/server.js
					*/
					else if (typeof require === 'function') {
						rq = require(oP.s);
						if (typeof oP.c === "function") {
							oP.c(rq);
						}
						qr.cnt++; qr.process(); qr.atv = false; return qr.cnt;
					}
					else { rq = new ActiveXObject("Microsoft.XMLHTTP"); }

					rq.timeout = 10*1000;

					if (oP.t == 'get') {
						if (glatteis.sys.dbg === true) { glatteis.log.s('get', shorty); }
						rq.open("GET", oP.s, true);
						rq.send(null);
					} else {
						if (glatteis.sys.dbg === true) { glatteis.log.s('post', shorty); }
						rq.open("POST", oP.s, true);
						rq.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset = UTF-8");
						rq.send(oP.v);
					}
					rq.onreadystatechange = function() {
						if (rq.readyState == 4 && rq.status !== 404) {
							if (typeof oP.c === "function") {
								oP.c(rq.responseText);
							}
							qr.cnt++; qr.process(); qr.atv = false; return qr.cnt;
						} else if (rq.readyState == 4 && rq.status !== 200) {
							qr.cnt++; qr.process(); qr.atv = false; return qr.cnt;
						}
					}
				}
				return false;
			} else {
				this.atv = false; this.cnt = 0;
				return false;
			}
		}
	};

	/*
	 * if no callback is given, uses synchronous node require
	 * 
	 * 
	 * */
	$.require = function (path, callback) {
		if (typeof callback === 'function') {
			qr.queue({
				s: path,
				v: null,
				t:'get',
				c: function (rT) {
					try {
						if (typeof document.createElement === 'function') {
							var e = document.createElement('script');
							e.setAttribute('type', 'text/javascript');
							e.innerHTML = rT;
							document.head.appendChild(e);
							document.head.removeChild(e);
						} else {
							module.exports = rT;
						}
						/*
						 * get the exported module and reset exports
						 * pass the module to user callback
						 */
						var exports = module.exports;
						module.exports = {};
						callback( exports );
					} catch (e) {
						glatteis.log.e(e);
					}
				}
			});
		} else {
			var temp = $;
			var mod = require(path);
			global.$ = temp;
			return mod;
		}
	};
})();


//files
//### /home/nano/Documents/projects/glatteis/src/ge-files.js
/*
	Files - 02 Aug 2016
		  - 11 Nov 2016
		  - 22 May 2018	add sync retrieval support
*/
;(function () {
	'use strict';
	var _mod = {
		data: {},
		cache: {},
		fs: false,
		path: false,
		basepath: false,
		s: false,
		init: function () {
			if (_mod.fs === false) {
				if (typeof require === 'function') { // use node fs
					_mod.fs = require('fs');
					_mod.path = require('path');
					_mod.s = _mod.path.sep;
					var __dirname = '';
						if (typeof process === 'object') {
							__dirname = process.execPath.match(/(.*)\/.*$/)[1];
						}
					_mod.basepath = __dirname;
				} else { // use h5 file api
					
				}
			}
		},
		// dummy function
		exists: function (path, cb) {
			return false;
		},
		stats: function (path, cb) {
			if (typeof cb === 'function') {
				_mod.fs.lstat(path, cb);
				return true;
			} else {
				return _mod.fs.lstatSync(path);
			}
		},
		realpath: function (path, cache, cb) {
			if (typeof cache === 'function') {
				cb = cache;
				cache = {};
			}
			
			if (typeof cb === 'function') {
				_mod.fs.realpath(path, cache, cb);
				return true;
			} else {
				return _mod.fs.realpathSync(path, cache);
			}
		},
		/*
		 * if cb is not a func, uses sync methods
		 */
		get: {
			file: function (path, cb, options) {
				if (typeof cb === 'function') {
					var innercb = function (err, data) {
						cb(data, err); // data, err
					}
					_mod.fs.readFile(path, innercb);
					return true;
				} else {
					return _mod.fs.readFileSync(path);
				}
				return false;
			},
			folder: function (path, cb, options) {
				if (typeof cb === 'function') {
					var innercb = function (err, data) {
						cb(data);
						if (err) throw err;
					}
					_mod.fs.readdir(path, innercb);
					return true;
				} else {
					return _mod.fs.readdirSync(path);
				}
				return false;
			}
		},
		set: {
			file: function (path, cb, data) {
				if (typeof cb === 'function') {

					var innercb = function (b, c) {
						cb(c);
						if (b) throw b;
					}

					// if data is not set
					if (data === undefined) {

						// check if file exists
						_mod.get.file(path, function (data, err) {
							
							// if it doesn't exist
							if (err) {
								
								// create it with an empty body
								_mod.fs.writeFile(path, '', innercb);

							} else {
								
								innercb(null);
								
							}
							
						});
						
					} else {
						
						_mod.fs.writeFile(path, data, innercb);
						
					}
					return true;
				} else {
					return _mod.fs.writeFileSync(path, cb);
				}
				return false;
			},
			folder: function (path, mask, cb) {
				if (typeof mask == 'function') { // allow the `mask` parameter to be optional
					cb = mask;
					mask = '0777';
				}
				_mod.fs.mkdir(path, mask, function(err) {
					if (err) {
						if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
						else cb(err); // something else went wrong
					} else cb(null); // successfully created folder
				});
			}
		},
		move: function (oldPath, newPath, callback) {
			function copyunlink () {
				var readStream = _mod.fs.createReadStream(oldPath);
				var writeStream = _mod.fs.createWriteStream(newPath);

				readStream.on('error', callback);
				writeStream.on('error', callback);

				readStream.on('close', function () {
					_mod.fs.unlink(oldPath, callback);
				});

				readStream.pipe(writeStream);
			}

			_mod.fs.rename(oldPath, newPath, function (err) {
				if (err) {
					if (err.code === 'EXDEV') {
						copyunlink();
					} else {
						callback(err);
					}
					return;
				}
				callback();
			});
		},
		pop: {
			file: function (path, cb) {
				if (typeof cb === 'function') {
					_mod.fs.unlink(path, cb);
					return true;
				}
				return false;
			},
			folder: function (path, cb) {
				if (typeof cb === 'function') {
					_mod.fs.rmdir(path, cb);
					return true;
				}
				return false;
			}
		}
	};
	_mod.init();
	module.exports = _mod;
})();

$._c('files');

//cli
//### /home/nano/Documents/projects/glatteis/src/ge-cli.js
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

;(function () {
	'use strict';
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
			var str = '';
			
			for (var i in arguments) {
				str += _.ansi( arguments[i] );
			}
			
			console.log(str);
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
			$('hooks').run( _.events.hint, {
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
			_._prompt = text || _._prompt;
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
		parsetype: function (type, value) {
			var no = ['no', 'false', 'n', '0', 'nope', 'off'],
				yes = ['yes', 'true', 'y', '1', 'yep', 'on'];
			
			if (no.includes(value)) return false;
			if (yes.includes(value)) return true;
			
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
		question: function (query, callback, key, def, type) {
			if (!_.rl || !_.rli) _.cli();
			
			_._inquestion = true;
			
			_.rli.question(_.ansi( query + '(' +def+ ') ' ), function () {
				_._inquestion = false;
				var ans = _.parsetype(type, arguments[0]);
				
				def = _.parsetype(type, def);
				
				// if answer is ^C, don't callback
				if (ans === '^C') return;
				
				if (typeof callback === 'function') {
					callback( ans );
				} else {
					callback.answer		= ans || def;
					callback.question	= query;
					if (key !== undefined) {
						callback.keys[key] = ans || def;
					}
					$('hooks').run( _.events.answer, callback);
				}

			});
		},

		_onresize: false,
		setonresize: function () {
			
			if (!_._onresize) {
				_._onresize = true;
				process.stdout.on('resize', function () {
					_.sizes();
					$('hooks').run(_.events.resize, {
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
				
				$('hooks').run( _.events.command, _.processargs(line.split(' ')) );

				if (_._autoprompt) {
					_.prompt(true);
				}
			
			}).on('SIGINT', function() {

				$('hooks').set(_.events.close, _.events.cli, function () {
					if (_._inquestion) {
						_._inquestion = false;
						_.echo('^C'); // @todo better way to cancel a question
						_.prompt();
					} else {
						_.echo('exit');
						process.exit(0);
					}
				});
				$('hooks').rununtilconsumed(_.events.close);
			
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
				} else {
					if (lastkey) {
						// @todo if len > 1 check key's mapping to short version
						
						args.keys[lastkey] = args.keys[lastkey] || [];
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
			
			_.setautoprompt(options.autoprompt);
			_.sizes();
			
			// if it's a tty, setup the cli
			if (iscli && options.cli === true) {

				_.cli();
				_.prompt(options.prompt);

			}
			
			// generate the first event
			$('hooks').run(_.events.init, args);

		}

	};
	
	module.exports = _;
})();

$._c('cli');
$._r();