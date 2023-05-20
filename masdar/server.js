/*
 * listen on conf.port, serve-static from /public, both accepted as args
 * watch for changes to /src and restart automatically after a few secs
 * optionally accept a db handle that is passed as extra.db
 * 		this allows multiple dbs to be queried easily
 * emits hooks: request
 * listens on hooks: response, session, ...
 * session handling convention:
 * a request comes in, server emits request
 * ge-accounts uses the .db, .name, .pass and emits result
 * 		session on success, server emits 
 * 		response on failure, server _out's it.
 * 
 * 
 * 
 * 
 * */

var Server;
;(function(){
	'use strict';
	
	var routes = [];
	var types = {
		post: 100,
		get: 200,
	};

	Server = {
		post: function (url, fn) {
			routes.push({
				type: types.post,
				url: url,
				fn: fn
			});
			return Server;
		},
		get: function (url, fn) {
			routes.push({
				type: types.get,
				url: url,
				fn: fn
			});
			return Server;
		},
		init: function (options) {
			options = options || {};
			options.port = options.port || 3000;
			process.title = options.name || 'xaadim';
			
			var express			= require('./xudoo3/express');			// web framework external module
			var fileupload		= require('./xudoo3/express-fileupload');
//			var serveStatic		= require('serve-static');		// serve static files
//			var socketIo		= require('socket.io');			// web socket external module

			var app = express();

			app.use(fileupload());
			app.disable('x-powered-by');

			// this helps parse the POST data both json and url-encoded
			var bodyParser = require('./xudoo3/body-parser');
			app.use( bodyParser.json() );
			app.use( bodyParser.urlencoded({ extended: true }) );
			
			app.options('*', function (req, res) {
//				$.log( 'options', req.headers );
				if (req.headers['access-control-request-method']) {
//					res.setHeader('Access-Control-Allow-Origin', req.headers['origin']);
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
					res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
					res.setHeader('Access-Control-Max-Age', 86400 );
					res.end();
				}
			});

			routes.forEach(function (route) {
				if (route.type === types.get) {
					app.get(route.url, function (req, res) {
						route.fn(req, res);
					});
				}
				if (route.type === types.post) {
					app.post(route.url, function (req, res) {
						route.fn(req, res);
					});
				}
			});

			app.use(express.static($.path+'/'));
			app.get('*', function (req, res) {
				res.sendFile( $.path+'/index.html' );
			});

			app.listen(options.port);
		}
	};

	module.exports = Server;

})();