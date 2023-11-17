/* understands .sql.slang
 * 
 * can do database configuration from .slang
 * can also translate databases' schema to .slang
 * 
 * 27 May 2018
 * 
 */

;(function () {
	'use strict';
	var d; // $('data')
	
	var getdefault = function (f, pri) {
		if (f.key == 'pri') return '';
		if (f.type == 'text') return ' default \'\'';
		if ( f.type.includes('int') || f.type.includes('dec') )
			return ' default 0';
		return ' default \'\'';
	};
	
	var _mod = {
		_getfields: function (databases, callback) {
			var fields = databases;
			
			var dbtables	= [],
				i			= 0;
			
			var q = $.queue();
			
			for (var db in databases) {
				
				for (var table in databases[db]) {
					dbtables.push( [db, table] )

					q.set(function (done, queue) {
						
						d.query( 'use ' + dbtables[i][0] + '; show fields from ' + dbtables[i][1] + ';' )
						 .then(function (showfields) {
							fields[dbtables[i][0]]
									[dbtables[i][1]] = {};
							
							for (var j in showfields.rows[1]) {
								
								var raw		= showfields.rows[1][j],
									fld	= {
										type:		raw.Type,
										'null':		(raw.Null !== 'NO'),
										key:		raw.Key.toLowerCase(),
										'default':	raw.Default	|| '',
										extra:		raw.Extra	|| ''
									};
								
								fields[dbtables[i][0]]
										[dbtables[i][1]]
											[raw.Field]
												= fld;

							}

							i = i+1;
							done(queue);

						});

					});
					
				}
			}
			
			q.run(function () {
				if (typeof callback === 'function') callback( fields );
				
//				process.exit();
			});
		},		
		/*
		 * get tables from databases [name, name, ...]
		 * also automatically gets the fields inside each table
		 */
		gettables: function (databasenames, callback) {
			
			if (typeof databasenames === 'string') databasenames = [databasenames];

			var databases = {};

			var q = $.queue();

			var i = 0;
			
			for (var irrelevant in databasenames) {
				
				q.set(function (done, queue) {
					var db = databasenames[i];
					
					d.query( 'use ' + db + '; show tables;' )
					 .then(function (showtables) {
						if (showtables.err) {
							callback(false);
//							$.log.s( showtables.err.message );
						} else {
							 
							databases[db] = {};
							
							for (var j in showtables.rows[1]) {

								databases[db][showtables.rows[1][j]['Tables_in_' + db]] = {};

							}
							
							i = i+1;
							done(queue);
						}
					});
				});

			}

			q.run(function () {
				_mod._getfields( databases, callback );
			});
			
		},
		/*
		 * this neatly puts db names in an array and passes them to gettables
		 */
		rootschema: function (callback) {

			d.query( 'show databases;' )
			 .then(function (showdb) {
				var databasenames = [];

				for (var i in showdb.rows) {
					databasenames.push(
						showdb.rows[i].Database
					);
				}
				
				_mod.gettables( databasenames, callback );

			});
		},
		toslang: function (databases) {
			var slang = '+data\n';

			for (var db in databases) {

				slang += db + '\n';
				var tables = databases[db];
				
				for (var tbl in tables) {
					
					slang += '	'+tbl + '\n';
					var fields = tables[tbl];
					for (var fld in fields) {

						slang += '		'+fld + '\n';
						var fldschema	=	'			';
						fldschema		+=	' '+ fields[fld].type;
						if (fields[fld]['null']) {
							fldschema		+=	' null';
						}
						fldschema		+=	' '+ fields[fld].key;
						if (fields[fld]['default']) {
							fldschema		+=	' def('+ fields[fld].default+')';
						}
						if (fields[fld].extra) fldschema += ' '+ fields[fld].extra;

						slang += fldschema + '\n';
						
					}
					
					
				}
				
			}
			
			return slang;

		},
		parse: function (parsedslang) {

			var databases = {}, lastdatabase = false, lasttable = false,
				lastfield = false;
			
			for (var i in parsedslang) {
				
				var tag = parsedslang[i];

				if (tag.line.startsWith('+data')) { //+data
				} else
				if (tag.level === 0) { //db
					lastdatabase = {};
					databases[tag.line] = lastdatabase;
				} else
				if (tag.level === 1) { //tbl
					lasttable = {};
					lastdatabase[tag.line] = lasttable;
				} else
				if (tag.level === 2) { //fields
					lastfield = tag.line;
					lasttable[tag.line] = '';
				} else
				if (tag.level === 3) { //schema
					var splat		= tag.line.split(' '),
						type		= splat[0],
						extra		= '',
						key			= '',
						Default		= '',
						Null		= false;

					if (tag.line.indexOf('unsigned') > -1) {
						type += ' unsigned';
					}
					if (tag.line.indexOf('def(') > -1) {
						Default = tag.line.match(/'def\((.*)\)'/);
					}
					if (tag.line.indexOf('pri') > -1) {
						key = 'pri';
					}
					if (tag.line.indexOf('null') > -1) {
						Null = true;
					}
					if (tag.line.indexOf('auto_increment') > -1) {
						extra = 'auto_increment';
					}
				
					lasttable[lastfield] = {
						type		: type,
						'null'		: Null,
						key			: key,
						'default'	: Default,
						extra		: extra,
					};
				}

			}
			
			return databases;
			
		},
		/*
		 * takes in { db: { table: {}, table: {}, ... }
		 * returns { table: {}, ... } except [table, table, ...]
		 * */
		tablesexcept: function (dbobj, except) {
			except = except || [];
			var tables = {};
			
			var dbobj = dbobj[ Object.keys(dbobj)[0] ];
			if (dbobj) {
				for (var i in dbobj) {
					if (!except.includes(i)) {
						tables[i] = dbobj[i];
					}
				}
			}
			
			return tables;
		},
		fieldsql: function (table, field, name) {
			var f = field;
			
			var sql =	'\nalter table `'+table+'`	add `'+name+'` '+f.type;
			
			if (f['default'].length) sql +=	' default '+f['default'];
			else sql +=	getdefault(f);
			if (!f['null']) sql +=	' not null';
			if (f.extra.length) sql +=	' '+f.extra;
			if (f.key === 'pri') sql +=	',\n			add unique key `'+name+'` (`'+name+'`)';
			
			return sql+';';
		},
		/*
		 * takes in a dbs object (one you get from rootschema/gettables)
		 * checks if db !exists, if not creates one, inserts everything
		 * if db exists
		 * 		checks for each table and if it's the same skips
		 * 		if not the same, updates it
		 * this is a dry run and only returns the sql queries
		 * */
		tablesql: function (name, table, databases, dbname, suf) {
			var sql = '';
			var desttable = false;
			suf = suf || '';
			if (typeof databases === 'object') desttable = (databases[dbname] || {})[name+suf];
			
			if (desttable instanceof Object) {
				
				// check fields and alter/add them
				for (var j in table) {
//					$.log.s(
//						dbname+'.'+name+suf+'.'+j+suf,
//						!!_mod.exists(dbname+'.'+name+suf+'.'+j+suf, databases)
//					);
					
					if ( !_mod.exists(dbname+'.'+name+suf+'.'+j+suf, databases) ) {
						sql += _mod.fieldsql( name+suf, table[j], j+suf );
					}
					
					// TODO someday: target(field), source -> dest, type based rows migration
				}
				
			} else {

				// create the whole table from scratch
				sql +=	'create table `'+name+suf+'` (\n';
				
				var commadone = false;
				for (var j in table) {

					var f = table[j];
					
					if (commadone) sql +=	',\n';

					sql +=	'	`'+j+suf+'` '+f.type;
					
					if (f['default'].length) sql +=	' default '+f['default'];
					else sql +=	getdefault(f);
					if (!f['null']) sql +=	' not null';
					if (f.extra.length) sql +=	' '+f.extra;
					if (f.key === 'pri') sql +=	',\n	unique key `'+j+suf+'` (`'+j+suf+'`)';
					
					commadone = true;
				}

				sql +=	'\n) default charset=utf8mb4 collate utf8mb4_unicode_ci;\n'

			}
			
			return sql;
		},
		tosql: function (dbname, source, databases, suffix) {
			var sql = '';
			
			var sourcedb = source[Object.keys(source)[0]];
			if (sourcedb instanceof Object) {
				if (databases === false) {
					// create everything
					sql +=	'create database `'+dbname+'` character set utf8mb4 collate utf8mb4_unicode_ci;\n'
				}
				sql +=	'use `'+dbname+'`;\n'
				for (var i in sourcedb) {
					var table = sourcedb[i];
					
					sql += _mod.tablesql(i, table, databases, dbname, suffix);
				}
			}
			
			return sql;
		},
		/*
		 * db.table.field
		 */
		exists: function (sqlpath, databases) {
			sqlpath = sqlpath || '';
			
			sqlpath = sqlpath.split('.');
//			for (var i in sqlpath) {
//				sqlpath[i] = '_'+sqlpath[i];
//			}
			
			if (typeof databases === 'object') {
				
				// db
				if (sqlpath.length > 0) {
					
					var db = databases[sqlpath[0]];
					if (db) {
						
						// table
						if (sqlpath.length > 1) {
							
							if (db[ sqlpath[1] ]) {
								
								// field
								if (sqlpath.length > 2) {
									
									if (db[ sqlpath[1] ][ sqlpath[2] ]) {
										
										return db[ sqlpath[1] ][ sqlpath[2] ];
									}

								} else {
									
									return db[ sqlpath[1] ];

								}

							}

						} else {
							return db;
						}

					}

				}
				
			}
			
			return false;
		},
		/* 
		 * slang > database schema commands
		 * database schema > slang
		 */
		init: function (data) {
			d = data || $('data');
			
			return _mod;
		},
	};
	
	module.exports = _mod;
})();
