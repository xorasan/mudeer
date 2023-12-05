/*
	Data - 01 Aug 2016
		 - 03 Jun 2017 rev2
		 - 16 May 2018 rev3
		  * handles mysql/postgresql databases
		  * provides ge compatible apis
		  * simple, efficient and tiny footprint
*/

var wuqu3aat;
;(function () {
	'use strict';
	var _mod = {
		/* TODO: in ge-sql alters
		 * ALTER TABLE `u_vot` CHANGE `read` `read` INT(2) NOT NULL;
		 */
		_alias: function (string, length) {
			string = string || '';
			if (string.length === 0) return '';
			
			length = length || 255;
			
			var alias = string;
			
//			var automaton = $.regex('\\pL\\pN|[^\W]', 'gi'); // L: Letter
			
//			alias = $.regex.replace(alias, automaton, '');
//			$.log.s(alias);
			
			alias = alias.substr(0, length)
						 .replace(/\%/g,						' pct'			)
						 .replace(/\@/g,						' at '			)
						 .replace(/\&/g,						' and '			)
						 .replace(/[$-\-/:-?\{\}-~!"^_`\[\]@#]/g,	'-'				) // symbols
						 .replace(/[^.\d\wa-zA-Z0-9ا-ےÄäÜüÖößЀ-ҁҊ-ӿÇçĞğŞşIıÜüﻙ]+/g,					'-'				) // most alphanums
						 .replace(/\s[\s]+/g,					'-'				)
						 .replace(/[\s]+/g,						'-'				)
						 .replace(/^[\-]+/g,					''				)
						 .replace(/[\-]+$/g,					''				)
						 .replace(/\-\-/g,						'-'				)
						 .replace(/\.\-/g,						'.'				)
						 .replace(/\-\./g,						'.'				)
						 .replace(/^\./g,						''				)
						 .replace(/\.$/g,						''				)
						 .trim()
						 .toLowerCase();
			
//			$.log.s(alias);
			
//			var unicodeWord = $.regex('^\\pL+$'); // L: Letter
//			$.log.s($.regex.replace); // true
//			$.log.s(unicodeWord.test("Русский")); // true
//			$.log.s(unicodeWord.test("日本語")); // true
//			$.log.s(unicodeWord.test("العربية")); // true
			
			return alias;
		},

		_host: false,
		_username: false,
		_password: false,
		_database: false,
		_connection: false,
		
		/* init the connection to the mysql server, select the database
		 * start reporting errors
		 * 
		 * @todo multipleStatements: security vuln
		 */
		init: function (host, username, password, database, errcb) {
			
			var multiple = false, charset;

			if (typeof host === 'object') {
				errcb		= host.errcb	;
				database	= host.database	;
				password	= host.password || host.pass || host.p ;
				username	= host.username || host.user || host.u ;
				multiple	= host.multiple	;
				charset		= host.charset	;
				host		= host.host		;
			}
			
			_mod._host		= ( host || '127.0.0.1' );
			_mod._username	= username;
			_mod._password	= password;
			_mod._database	= database;

			var mysql		= require('./xudoo3/mysql');
			_mod._connection = mysql.createConnection({
				multipleStatements	: multiple,
				host				: _mod._host,
				user				: _mod._username,
				password			: _mod._password,
				database			: _mod._database,
				charset				: charset,
				debug				: false
			});
			
			_mod.connect(errcb);
			
			// this is async, wait for the reply
			return null;
		},
		
		/* sql can be string or array, if array, it is flattened into the args
		 * ['title = ?', title], fn, errfn
		 * 'title = ?', title, cb
		 * 
		 * @todo
		 * node-mysql supports INSERT *** SET ?, {key: value, ...}
		 * test & support this neat feature
		 * this can make coding this stuff 100 times easier
		 */
		query: function (sql, fn, errfn) {
			var response	= false,
				thencb		= false,
				thenfn		= function (callback) {
					if (response) {
						if (typeof callback === 'function') callback(response);
					} else {
						thencb = callback;
					}
				};

			if (_mod._connection) {
				
				var args = [];
				if (sql instanceof Array) {
					args = args.concat(sql);
				} else  {
					args.push(sql);
				}
				if (typeof fn === 'object') {
					args.push(fn);
				}
				var sql = false;
				var cb = function (err, rows, fields) {
					if (err && typeof errfn === 'function') {
						errfn(err);
						rows = fields = false;
					}

					if (typeof fn === 'function') {
						fn(rows, fields);
					} else if (typeof thencb === 'function') {
						thencb({
							err: err,
							rows: rows || [],
							fields: fields,
							sql: sql.sql
						});
					}
				};
				args.push(cb);
				sql = _mod._connection.query.apply(_mod._connection, args);

			}

			return {
				then: thenfn
			};
		},
		
		connect: function (errcb) {
			_mod._connection.connect(errcb);
		},
		disconnect: function () {
			_mod._connection.end();
		}
	};
	
//	var a = 'us--,,.`~<>?/\er_aa_a_nameфываعفئٰےٹääü!@#$%^&*()0 987 6 4 32';
//	var a = '-کیا حال ہے آپ کا واہ خئا ْ کَدَر پُوْپ'; // urdu
//		a+= '1This is some english text';
//		a+= '@!#$ (*&*(^("~`_____   ------';
//	$.log.s(a);
//	_mod._alias(a)

	_mod.alias = _mod._alias;
	
	module.exports = _mod;
	wuqu3aat = _mod;
})();
Web.during_init(function (done, queue) {
	$.log.s( 'connecting to database' );
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