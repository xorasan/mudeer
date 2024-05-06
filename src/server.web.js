// requires Server, Files, Polling
/*
 *
 */
var Web;
;(function(){
	'use strict';

	var loadedmodules = [], init_modules = [], Cache = {};
	var node_path = require('path');
	var public_path = node_path.resolve( Config.public || $.path )+'/';
	var echo = Cli.echo;
	function print_prop(a, b) {
		echo( ' ^bright^'+a+'~~ '+b+' ' )
	}

	Web = {
		get_public_path: function () {
			return public_path;
		},
		_out: function (req, res, obj, extra) {
			obj = obj || {};
			
//			var host = req.headers.host.split(':');
//			obj.host = host[0];
//			obj.port = host[1];
			/*
			 * only the perm and nashar channels are allowed to send time
			 * and they handle it elsewhere :p
			 * this was for the on-demand channel and that one doesn't send time
			 * anymore
			 * */
//			obj.time = obj.time || new Date().getTime();
			
			try {
				res.json(obj);
			} catch (e) {
				$.log.s(e);
			}
		},
		add: function (callback) { // adaaf
			loadedmodules.push(callback);
		},
		during_init: function (callback) {
			init_modules.push(callback);
		},
		api: function (req, res) {
//			$.log( 'api', req.headers );
			res.setHeader('Access-Control-Allow-Origin', '*');

			var host = req.headers.host.split(':'),
				extra = {
					payload:		{}		,
					obj:			{}		,
					boxdatabase:	Config.database.name,
					database:		Config.database.name,
					host:			host[0]	,
					port:			host[1]	,
					req:			req		,
					res:			res		,
					Cache:			Cache	,
				};
			
			var q = $.queue();
			q.set(function (done, queue) {
				if ( (req.body || {}).json ) {
					try {
						extra.payload = JSON.parse( req.body.json );

//						$.log( req.files );
						
						extra.files = req.files;
						
						if (req.headers) {
							if (req.headers.kaleed)
								extra.payload.kaleed = req.headers.kaleed;
							if (req.headers.upload)
								extra.payload.upload = req.headers.upload;
							if (req.headers.e$)
								extra.payload.e$ = req.headers.e$;
						}
						
						/*
						 * if the client is running a different build than this
						 * send an expiredbuild (e$) hint to force them out and onto
						 * the current build
						 * */
//						if (extra.payload.e$ !== BUILDNUMBER && !extra.files) {
//							extra.obj.e$ = true;
//							Web._out(req, res, extra.obj, extra.payload);
//							return;
//						}
					} catch (e) {
						$.log( e, 'invalid json payload' );
						// TODO dont process further
//						res.sendStatus(500);
					}
				}
//				$.log.s( '________________________________________' );
//				$.log.s( extra.payload );
//				var ipaddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//				$.log.s( new Date().toISOString(), ipaddr/*, req.headers['user-agent']*/ );

				done(queue, extra);
			});
			try {
				loadedmodules.forEach(function (mod) {
					q.set(mod);
				});
			} catch (e) {
				$.log.s( 'q.set*', e );
			}
			q.run(function (queue, obj) {
				Web._out(req, res, extra.obj, extra.payload);
			});
		},
		init: function (callback) {
			var q = $.queue();
			if (isarr(callback)) {
				$.log.e( ' Web.init( mods.. ) is deprecated ' );
				$.log.s( ' Use Web.add( fn ) instead ' );
			}

			try {
				init_modules.forEach(function (mod) {
					q.set(mod);
				});
			} catch (e) {
				$.log.s( 'q.set*', e );
			}

			q.set(function (done, queue) {
//				$.log.s( 'registering controller intercepts' );
				var intercept = function (req, res) {
//					$.log( 'intercept', req.headers );
					var path = public_path,
						file = path+'index.html';

					if (req.url.startsWith('/media') || req.url.startsWith('/qss')) {
						var file = process.cwd()+req.url;

						/* 
						 * make uploads get cached
						 * for an avg of 30 days or something
						 * 
						 * chrome doesn't cache content from bad certs
						 * */
						res.setHeader('Cache-Control', 'private, max-age=2592000, must-revalidate');

						var ifmodsince = req.headers['if-modified-since'];
						if (ifmodsince) {
							Files.stats(file, function (err, stats) {
								if (err)
									res.sendStatus(404);
								else if (stats.mtime) {
//									$.log.s( stats.mtime.toUTCString() === new Date(ifmodsince).toUTCString() );

									res.setHeader('Last-Modified', stats.mtime.toUTCString() );
									if (stats.mtime.toUTCString() === new Date(ifmodsince).toUTCString()) {
										res.sendStatus(304);
									} else {
										res.sendFile(file);
									}
								}
							});
							
							// response needs an async io req :/
							return;
						} // otherwise check the very last else clause
					} else {
						if ( ['/qr.js'].includes( req.url ) ) {
							req.next();
							return;
						} else {
							file = false;
						}
					}
					
//					var isallowed = $.conf.admin.includes(req.headers.host);
					if (/*isallowed && */file === false) {
						file = path+'index.html';
//					} else if (file === false) {
//						file = path+'index.html';
					}

					if (typeof file === 'number') {
						res.sendStatus(file);
					} else {
						// these files are the same for all sites
						if ( [	'robots.txt', '/_.js', '/20.js', '/a.js', '/e.png', '/0.png', '/1.png',
								'/mb.css', '/mb.js', '/mbdr.css', '/mbdr.js',
								'/manifest.webapp', '/insaan.shakl', '/pallete.js',
								'/kmr.otf', '/kmb.otf', '/kml.otf'].includes( req.url ) ) {
							req.next();
						}
						// this files needs some changes
						else if ( '/favicon.ico' === req.url) {
							res.sendStatus(404);
						}
						else {
							res.sendFile(file, null, function (err) {
								if (err) {
//									$.log.s( 'error sending file', file );
									if (!res.headersSent)
										res.sendStatus(404);
								}
							});
						}
					}
				};
				
				Server.get('*', intercept);
				
				done(queue);
			});
			q.set(function (done, queue) {
//				$.log.s( 'registering post -> api' );
				Server.post('*', Web.api);

				done(queue);
			});
			q.run(function () {
//				$.log.s( 'starting server' );
				Server.init({
					port: Config.port,
					name: "APPNAME"
				});
				print_prop( 'Public Path', public_path );
				print_prop( 'Build', BUILDNUMBER );
				print_prop( 'Server Port', Config.port );
				
				if (isfun(callback)) callback();
			});
		}
	};

	module.exports = Web;
})();
