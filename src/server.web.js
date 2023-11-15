/*
 * this technology belongs to Allah, so fear Him and seek His approval
 * 
 * this project 'webapp' is to moved to glatteis core
 * just like you can import src/ mods
 * you'll be able to link dev-public/ mods as well
 * the difference is, dev-public/ mods will be dynamically linked 
 * */
// requires Server, Files, Polling
//+ adaaf
var Web;
;(function(){
	'use strict';
		
	var loadedmodules = [], Cache = {};

	Web = {
		_out: function (req, res, obj, extra) {
			obj = obj || {};
			
//			var host = req.headers.host.split(':');
//			obj.host = host[0];
//			obj.port = host[1];
			/*
			 * only the perm and nashar channels are allowed to send waqt
			 * and they handle it elsewhere :p
			 * this was for the on-demand channel and that one doesn't send waqt
			 * anymore
			 * */
//			obj.XPO.waqt = obj.XPO.waqt || new Date().getTime();
			
			try {
				res.json(obj);
			} catch (e) {
				$.log.s(e);
			}
		},
		adaaf: function (callback) {
			loadedmodules.push(callback);
		},
		api: function (req, res) {
//			$.log( 'api', req.headers );
			res.setHeader('Access-Control-Allow-Origin', '*');

			var host = req.headers.host.split(':'),
				extra = {
					payload:		{}		,
					obj:			{}		,
					boxdatabase:	WUQU3AATNAME,
					database:		WUQU3AATNAME,
					host:			host[0]	,
					port:			host[1]	,
					req:			req		,
					res:			res		,
					Cache:			Cache	,
				};
			
			var q = $.queue();
			q.set(function (done, queue) {
				if ( (req.body || {}).XPO.json ) {
					try {
						extra.payload = JSON.parse( req.body.XPO.json );

//						$.log( req.files );
						
						extra.files = req.files;
						
						if (req.headers) {
							if (req.headers.XPO.kaleed)
								extra.payload.XPO.kaleed = req.headers.XPO.kaleed;
							if (req.headers.XPO.rafa3)
								extra.payload.XPO.rafa3 = req.headers.XPO.rafa3;
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
		init: function (mods) {
			var q = $.queue();
			if (mods instanceof Array)
				q.set(function (done, queue) {
					$.log.s( 'loading modules' );
					$.preload(mods, function () {
						mods.forEach(function (mod) {
							loadedmodules.push( $(mod) );
						});
						done(queue);
					});
				});
			if (WUQU3AAT)
				q.set(function (done, queue) {
//					$.log.s( 'connecting to database' );
					wuqu3aat.init({
						host: 'localhost',
						multiple: true,
						u: WUQU3AATUSERNAME,
						p: WUQU3AATPASSWORD,
						charset: 'utf8mb4',
						errcb: function (e) {
							if (e && e.code === 'ER_NOT_SUPPORTED_AUTH_MODE') {
								$.log.s( 'mysql server connection not supported' );
								$.log.s( 'maybe you forgot to add your user:pass to mysql?' );
								process.exit();
							}
							else if (e && e.code === 'ER_ACCESS_DENIED_ERROR') {
								$.log.s( 'mysql server username password incorrect' );
								$.log.s( e.sqlMessage );
								process.exit();
							}
							else if (e && e.code === 'ECONNREFUSED') {
								$.log.s( 'mysql server is down' );
								process.exit();
							}
							else if (e && e.fatal) {
								$.log.s( 'mysql server unknown error dying' );
								process.exit();
							}
							else {
								$.log.s( 'mysql connected' );
							}
							done(queue);
						}
					});
				});
			q.set(function (done, queue) {
//				$.log.s( 'registering controller intercepts' );
				var intercept = function (req, res) {
//					$.log( 'intercept', req.headers );
					var path = $.path+'/',
						file = path+'index.html';

					if (req.url === '/icon.png')
						file = path+'icon.png';
					else if (req.url.startsWith('/m3') || req.url.startsWith('/qss')) {
						var file = process.cwd()+req.url;

						/* 
						 * make uploads get cached
						 * for an avg of 30 days or something
						 * 
						 * chrome doesn't cache content from bad
						 * certs
						 * */
						res.setHeader('Cache-Control', 'private, max-age=2592000, must-revalidate');

						var ifmodsince = req.headers['if-modified-since'];
						if (ifmodsince) {
							Files.stats(file, function (err, stats) {
								if (err)
									res.sendStatus(404);
								else if (stats.mtime) {
//											$.log.s( stats.mtime.toUTCString() === new Date(ifmodsince).toUTCString() );

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
					if (/*isallowed && */file === false)
						file = path+'index.html';
//					else if (file === false)
//						file = path+'index.html';
					
					if (typeof file === 'number') {
						res.sendStatus(file);
					} else {
						// these files are the same for all sites
						if ( [	'robots.txt', '/_.js', '/20.js', '/a.js',
								'/mb.css', '/mb.js', '/mbdr.css', '/mbdr.js',
								'/manifest.webapp', '/insaan.shakl', '/pallete.js',
								'/kmr.otf', '/kmb.otf', '/kml.otf'].includes( req.url ) ) {
							req.next();
						}
						// this files needs some changes
						else if ( '/favicon.ico' === req.url) {
							res.sendStatus(404);
						}
						else if ( '/manifest.json' === req.url) {
							Files.get.file(path+'manifest.json', function (data, err) {
								if (err) {
//									$.log.s( err );
									res.sendStatus(404);
								} else if (data) {
									data = data.toString();
									res.setHeader('Last-Modified', new Date().toUTCString() );
									try {
										data = JSON.parse(data);
										data.name		= "APPNAME";
										data.short_name	= "APPNAME";
										
										res.json(data);
									} catch (ignore) {
										$.log.e( ignore );
										res.sendStatus(500);
									}
								}
							});
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
						port: XAADIMPORT,
						name: "APPNAME"
					});
				$.log.s( 'insha: '+BUILDNUMBER );
				$.log.s( 'xaadim port: '+XAADIMPORT );
				
//				Tests.isaliasunique();
//				Tests.permstest();
			});
		}
	};
	
	module.exports = Web;
})();