/*
 * these are helper functions for the almudeer project, but try to keep them
 * as abstract as easily possible, but not if it puts a strain on the proj dev
 * 
 * abstractions can be ported to something like ge-crypto or ge-serverhelpers
 * or ge-pwaserver or something else
 * */
var helpers;
var tbl_pops = 'pops0';
;(function(){
	'use strict';
	var Data		= wuqu3aat,
		hashalgo	= new require('./xudoo3/easy-pbkdf2').EasyPbkdf2();
	
	var Helpers = {
		tree: function (root, folders, cb) {
			if (typeof cb !== 'function') return;

			var result = {
				total: 0,
				counts: {},
				tree: {},
			};
			
			if (folders && folders.length) {
				var q = $.queue(), i = 0;
				folders.reverse(); // newer folders first
				folders.forEach(function () {
					q.set(function (done, queue) {
						var path = folders[i];
						Files.get.folder( root + path, function (files) {
							result.total += files.length;
							result.tree[ path ]		= files.reverse();
							result.counts[ path ]	= files.length;
							++i;
							done(queue);
						} );
					});
				});
				q.run( function () {
					cb(result)
				} );
			} else {
				cb(result);
			}
		},
		usernameisvalid: function (username) {
			var result = {
				code: false
			};

			result.username = username = Data.alias(username);
			
			if (result.username.length >= 3) {
				if (result.username.length <= 24) {
					result.code = false;
				} else {
					result.code = 'XPO.usernameover';
				}
			} else {
				result.code = 'XPO.usernameunder';
			}
			return result;
		},
		usernameexists: function (username, cb) {
			if (typeof cb !== 'function') return;
			
			var sql = ['SELECT * FROM accounts WHERE `name` = ?',
						[username]];
						
			$('data').query(sql, function (rows) {
				cb((rows && rows.length === 1));
			}, function (err) {
				console.log(err);
			});
		},
		passwordisvalid: function (password) {
			var result = {
				code: false
			};
			
			// 8 to ... chars
			if (password.length >= 8) {
				if (password.length <= 64) {
					result.code = false;
				} else {
					result.code = 'XPO.passwordover';
				}
			} else {
				result.code = 'XPO.passwordunder';
			}
			return result;
		},
		hashpassword: function (password, callback) {
			if (typeof callback === 'function') {
				hashalgo.hash(password, function (err, hash, salt) {
					if (err) throw err;
					
					callback({
						err: err,
						salt: salt,
						hash: hash
					});
				});
			}
		},
		verifypassword: function (salt, hash, password, cb) {
			if (typeof cb !== 'function') return;
			
			hashalgo.verify(salt, hash, password, function (err, matched) {
				if (err) throw err;
				
				cb(matched);
			});
		},
		weakhash: function (value) {
			return hashalgo.weakHash(
				value
				||
				(
					$.random(0, 99999) +""+ new Date().getTime()
				)
			);
		},
		monthnames: 'january february march april may june july august september october november december'.split(' '),
		toymd: function (intdate) {
			intdate = parseInt(intdate);
			
			var day = new Date(intdate);
			
			var month = Helpers.monthnames[ day.getMonth() ] || ''.substr(0, 3);
			
			var ymd = day.getFullYear()+'-'+month+'-'+day.getDate();

			return ymd;
		},
		// strips time '22:06:38' and returns day '11 aug 2018'
		striptime: function (time) {
			var parsed = new Date(time||new Date().getTime());
			
			parsed = (parsed.getDate()) + ' ' + Helpers.monthnames[parsed.getMonth()] + ' ' + parsed.getFullYear() + ' GMT';
			parsed = new Date(parsed);
			if (parsed.toString() === 'Invalid Date') parsed = false;
			
			return parsed;
		},
		stripday: function (time) {
			var parsed = new Date(time||new Date().getTime());
			
			parsed = Helpers.monthnames[parsed.getMonth()] + ' ' + parsed.getFullYear() + ' GMT';
			parsed = new Date(parsed);
			if (parsed.toString() === 'Invalid Date') parsed = false;
			
			return parsed;
		},
		stripmonth: function (time) {
			var parsed = new Date(time||new Date().getTime());
			
			parsed = parsed.getFullYear() + ' GMT';
			parsed = new Date(parsed);
			if (parsed.toString() === 'Invalid Date') parsed = false;
			
			return parsed;
		},
		uuid: function (seed) {
			var defaultseed = ( new Date().getTime() )+($.random(0,1484719))+'';
			defaultseed = $.random(0, 8359)+'-'+defaultseed;
			
			seed = seed || defaultseed;
			
			var uuid = seed
					.replace(/26/g, 'z')
					.replace(/25/g, 'y')
					.replace(/24/g, 'x')
					.replace(/23/g, 'w')
					.replace(/22/g, 'v')
					.replace(/21/g, 'u')
					.replace(/20/g, 't')
					.replace(/19/g, 's')
					.replace(/18/g, 'r')
					.replace(/17/g, 'q')
					.replace(/16/g, 'p')
					.replace(/15/g, 'o')
					.replace(/14/g, 'n')
					.replace(/13/g, 'm')
					.replace(/12/g, 'l')
					.replace(/11/g, 'k')
					.replace(/10/g, 'j')
					.replace(/9/g, 'i')
					.replace(/8/g, 'h')
					.replace(/7/g, 'g')
					.replace(/6/g, 'f')
					.replace(/5/g, 'e')
					.replace(/4/g, 'd')
					.replace(/3/g, 'c')
					.replace(/2/g, 'b')
					.replace(/1/g, 'a')
					;
			
			return {
				seed: seed,
				uuid: uuid
			};
		},
		/*
		 * for each record, search using this combo in a single go
		 * index like this
		 * class-day-account : <uid>
		 * if a uid is found, use that when inserting
		 * 
		 * returns an object where the keys are <prop+prop+prop+...>
		 * values are uids or false or -1
		 * 
		 * if -1 is returned for a value, then that means don't insert it
		 * */
		iscombounique: function (database, table, values, combo, callback) {
			var querystr = '', asmaa = [], args = [], unique = {}, uniqueindexed = [];
				
			if (values instanceof Array && combo instanceof Array) {
				values.forEach(function (elt, j) {
					var where = {};
					var ismstr = '';
					
					combo.forEach(function (key) {
						if (elt[key] !== undefined) {
							if (ismstr)
								ismstr += '_'+elt[key];
							else
								ismstr += elt[key];
							
							where[key] = elt[key];
						}
					});
					
					where = Helpers.where(where);

					querystr += 'select * from `'+database+'`.`'+table+'` '+where.str+';';
					
					unique[ismstr] = false;
					
					args = args.concat(where.args);

					asmaa.push(ismstr);
				});
				
				// mark duplicate asmaa in the provided values as nonunique
				asmaa.forEach(function (ism, j) {
					var count = 0;
					asmaa.filter(function (elt) {
						if (ism === elt) ++count;
					});
					if (count > 1) uniqueindexed[j] = false;
				});
				
				Data.query(querystr, args).then(function (result) {
					
					// in case only one row is returned
					if (!(result.rows instanceof Array))
						result.rows = [result.rows];
						
					values.forEach(function (elt, j) {
						var rows = result.rows[ j ],
							isunique = (uniqueindexed[j] === undefined);
						
						// no rows with ism found
						if ( rows === undefined || rows.length === 0 ) {
							if (isunique) {
//								$.log.s( 'a' );
								unique[ asmaa[j] ] = elt.uid0;
								uniqueindexed[j] = elt.uid0;
							}
						// what if it is just one row object
						} else if ( rows && rows.uid0 ) {
							if ( rows.uid0 === parseInt( elt.uid0 ) ) {
								if (isunique) {
//									$.log.s( 'b' );
									unique[ asmaa[j] ] = elt.uid0;
									uniqueindexed[j] = elt.uid0;
								}
							} else {
//								$.log.s( 'c' );
								unique[ asmaa[j] ] = rows.uid0;
								uniqueindexed[j] = rows.uid0;
							}
						// if there's one or more rows with this ism
						// one of them is the current item.uid0 then it's unique
						} else if ( rows instanceof Array ) {
							rows.forEach(function (row) {
								if ( row.uid0 === parseInt( elt.uid0 ) ) {
									if (isunique) {
//										$.log.s( 'd' );
										unique[ asmaa[j] ] = row.uid0;
										uniqueindexed[j] = elt.uid0;
									}
								} else {
									if (typeof uniqueindexed[j] !== 'number') {
										unique[ asmaa[j] ] = row.uid0;
										uniqueindexed[j] = row.uid0;
									}
								}
							});
						}
						
						// if database results didn't mark some as unique
						// and if they weren't marked nonunique earlier
						// then assume they're unique
						if (uniqueindexed[j] === undefined) {
//							$.log.s( 'e' );
							uniqueindexed[j] = false;
						}
					});

//					asmaa.forEach(function (ism, j) {
//						uniqueindexed[j] = ism+':'+uniqueindexed[j];
//					});
					
					typeof callback === 'function' && callback(uniqueindexed, unique);
				});
				
			} else {
				typeof callback === 'function' && callback(uniqueindexed, unique);
			}
		},
		/*
		 * 11nov2018 does it still have bugs?
		 * this has bugs, rethink this code, maybe there's a simpler way to do
		 * unique ism checks
		 * */
		isismunique: function (database, table, values, callback) {
			if (values instanceof Array) {
				
				var querystr = '', asmaa = [], unique = {}, uniqueindexed = [];
				values.forEach(function (elt) {
					querystr += 'select * from `'+database+'`.`'+table+'` where `ism0` = ?;';
					
					var ismstr = typeof elt === 'string' ? elt : elt.ism0;
					unique[ismstr] = false;
					
					asmaa.push(ismstr);
				});
				
				// mark duplicate asmaa in the provided values as nonunique
				asmaa.forEach(function (ism, j) {
					var count = 0;
					asmaa.filter(function (elt) {
						if (ism === elt) ++count;
					});
					if (count > 1) uniqueindexed[j] = false;
				});
				
				Data.query(querystr, asmaa).then(function (result) {
					
					// in case only one row is returned
					if (!(result.rows instanceof Array))
						result.rows = [result.rows];
						
						
					values.forEach(function (elt, j) {
						var rows = result.rows[ j ],
							isunique = (uniqueindexed[j] === undefined);
							
						// no rows with ism found
						if ( rows === undefined || rows.length === 0 ) {
							if (isunique) {
//								$.log.s( 'a' );
								unique[ elt.ism0 ] = true;
								uniqueindexed[j] = elt.uid0;
							}
						// what if it is just one row object
						} else if ( rows && rows.uid0 ) {
							if ( rows.uid0 === parseInt( elt.uid0 ) ) {
								if (isunique) {
//									$.log.s( 'b' );
									unique[ elt.ism0 ] = true;
									uniqueindexed[j] = elt.uid0;
								}
							} else {
//								$.log.s( 'c' );
								unique[ elt.ism0 ] = false;
								uniqueindexed[j] = false;
							}
						// if there's one or more rows with this ism
						// one of them is the current item.uid0 then it's unique
						} else if ( rows instanceof Array ) {
							rows.forEach(function (row) {
								if ( row.uid0 === parseInt( elt.uid0 ) ) {
									if (isunique) {
//										$.log.s( 'd' );
										unique[ elt.ism0 ] = true;
										uniqueindexed[j] = elt.uid0;
									}
								} else {
									if (typeof uniqueindexed[j] !== 'number') {
										unique[ elt.ism0 ] = false;
										uniqueindexed[j] = false;
									}
								}
							});
						}
						
						// if database results didn't mark some as unique
						// and if they weren't marked nonunique earlier
						// then assume they're unique
						if (uniqueindexed[j] === undefined) {
//							$.log.s( 'e' );
							uniqueindexed[j] = true;
						}
					});

//					asmaa.forEach(function (ism, j) {
//						uniqueindexed[j] = ism+':'+uniqueindexed[j];
//					});
					
					typeof callback === 'function' && callback(uniqueindexed, unique);
				});
				
			} else {
				// eliminate or improve this code

				Data.query('select * from `'+database+'`.`'+table+'` where `ism0` = ?', [values.ism0]).then(function (result) {
					var unique = false;
					if (result.rows && result.rows.length === 0) {
						unique = true;
					} else {
						for (var i in result.rows) {
							var row = result.rows[i];
							if ( row.uid0 === parseInt(values.uid0) ) {
								unique = true;
							}
						}
					}
					
					typeof callback === 'function' && callback(unique);
				});

			}
				
		},
		// value prop names starting with _ are only used when inserting
		filtervalues: function (values) {
			var _values = {};
			for (var i in values) {
				if (i.startsWith('_')) {
					_values[i.substr(1)] = values[i];
					delete values[i];
				} else {
					_values[i] = values[i];
				}
			}
			
			return [_values, values];
		},
		insert: function (database, table, values, callback) {
			if (values instanceof Array) {

				var querystr = '', insertions = [], uids = [], ruids = [];
				values.forEach(function (elt) {
					// need for unique combo replacements
					if (elt.ruid) {
						ruids.push(elt.ruid);
						delete elt.ruid;
					} else if (elt.uid0 < 0) {
						// remove the ruid so it won't get parsed into the values
						ruids.push(elt.uid0);
						delete elt.uid0;
					} else {
						ruids.push(false);
					}

					querystr += 'insert into `'+database+'`.`'+table+'` set ? on duplicate key update ?;';
					insertions = insertions.concat(Helpers.filtervalues(elt));
				});
				

				Data.query(querystr, insertions).then(function (result) {
					result.err && $.log.s( result.err );
					
					// in case only one row is returned
					if (!(result.rows instanceof Array))
						result.rows = [result.rows];

					var j = 0;
					// index all uids
					result.rows.forEach(function (rows) {
						var uid = 0;
						if (rows) uid = rows.insertId || values[j].uid0;
						
						uids.push(uid);
						++j;
					});
					
					querystr = '';
					uids.forEach(function (uid) {
						querystr += 'select * from `'+database+'`.`'+table+'` where `uid0` = ?;';
						
					});

					Data.query(querystr, uids).then(function (result) {
						// in case only one row is returned
						if (result.rows.length === 1)
							result.rows = [result.rows];

						var finerows = [];
						
						result.rows.forEach(function (row, i) {
							// each select call returns array of one row lol
							row[0].ruid = ruids[i];
							finerows.push(row[0] || {});
						});
						
						Helpers.count(database, table, function (count) {
							typeof callback === 'function' && callback({
								rows: finerows,
								count: count,
							});
						});

					});
					
				});
				
			}
		},
		/*
		 * TODO explain how this works here
		 * */
		set: function (database, table, values, callback, options) {
			options = options || {};
			
			if (values && values.length === 0) {
				callback({
					rows: [],
					count: false,
				});
				return;
			}
			
			// don't check ism if checkism === false
			if (options.checkism === false) {
				if (options.combounique instanceof Array) {
					Helpers.iscombounique(database, table, values, options.combounique, function (index) {
						index.forEach(function (olduid, j) {
							if (olduid) {
								values[j].ruid = values[j].uid0;
								values[j].uid0 = olduid;
							}
						});
						Helpers.insert(database, table, values, callback);
					});
				} else {
					Helpers.insert(database, table, values, callback);
				}
			} else {
				values.forEach(function (elt, j) {
					values[j].ism0 = Data.alias(elt.ism0 || elt.ismmubeen0);
				});
				Helpers.isismunique(database, table, values, function (unique) {
					if (values instanceof Array) {
						values.forEach(function (elt, j) {
							var prefix = (elt.ism0 ? elt.ism0+'-' : '');
							if (unique[j] === false) {
								elt.ism0 = prefix.substr(0, 10) + Helpers.uuid().uuid;
							// if no other rows with '' ism exist
							} else if (options.noemptyism && elt.ism0 === '') {
								elt.ism0 = prefix.substr(0, 10) + Helpers.uuid().uuid;
							}
						});
					// TODO abandon returning single items, arrays only please
					} else {
						if (unique === false) {
							var prefix = (values.ism0 ? values.ism0+'-' : '');
							values.ism0 = prefix + Helpers.uuid().uuid;
						}
					}
					
//					$.log.s( '_values:', _values );
//					$.log.s( 'values:', values );

					Helpers.insert(database, table, values, callback);
				});
			}
		},
		// when you wanna force a single result, the first one is returned
		get: function (database, table, values, callback) {
			/* to save a $.queue, when a .uid0 < 0 is passed it calls back false
			 * immediately, this way cases where you need to .get a previously
			 * added record for a uid becomes easy to bypass with the correct
			 * result, you'll know that the record doesn't exist because uid < 0
			 * then you can move on to creating it, use case: mukaalamaat
			 * */
			if (values.uid0 < 0) {
				callback(false);
				return; // extremely important to stop double callback
			}
			
			var where = Helpers.where(values);
			
			Data.query( 'select * from `'+database+'`.`'+table+'` '+where.str, where.args ).then(function (result) {
				result.err && $.log.s( result.sql, result.err );
				
				var rawrow = result.rows[0];
				if (rawrow) {
					typeof callback === 'function' && callback(rawrow);
				} else {
					typeof callback === 'function' && callback(false);
				}
			});
		},
		// when you want multiple rows by uid, returns ge array with uid as key
		getallbyuid: function (database, table, items, callback) {
			// no uids = return empty ge array
			if (!items || items.length === 0) {
				callback( $.array() );
			}
			else if (items instanceof Array) {
				var str = 'where ';
				
				var comma = false, uids = [];
				items.forEach(function (item) {
					uids.push( item.uid0 );
					
					if (comma && items.length > 1) {
						str += ' OR ';
					}
					str += 'uid0 = ?';
					comma = true;
				});
				
				Data.query( 'select * from `'+database+'`.`'+table+'` '+str, uids ).then(function (result) {
					result.err && $.log.s( result.err, result.sql );
					
					var rawrow = result.rows, arr = $.array();
					if (rawrow) {
						arr.setall('uid0', rawrow);
						typeof callback === 'function' && callback(arr);
					} else {
						typeof callback === 'function' && callback(false);
					}
				});
			}
		},
		// when you want multiple rows, returns ge array with uid as key
		getall: function (database, table, values, callback/*, options*/) {
			var where = Helpers.where(values);
			
			Data.query( 'select * from `'+database+'`.`'+table+'` '+where.str, where.args ).then(function (result) {
				result.err && $.log.s( result.err );
	
				var rawrow = result.rows, arr = $.array();
				if (rawrow) {
					arr.setall('uid0', rawrow);
					typeof callback === 'function' && callback(arr);
				} else {
					typeof callback === 'function' && callback(false);
				}
			});
		},
		// just like get all but with pagination
		limitedget: function (database, table, values, callback, filter) {
			values = values || {};
			filter = filter || {};

			var where		= Helpers.where( filter );

			Helpers.limitedcount(database, table, where.str, where.args, function (count) {
				
				var sanelimits	= Helpers.limit( values, { count: count } ),
					args		= where.args.concat(sanelimits.args),
					str			= where.str+' '+sanelimits.str;

//				$.log.s( str, args );
				
				Data.query('select * from `'+database+'`.`'+table+'` '+str, args).then(function (result) {
//					result.err && $.log.s( result.err, result.sql );
//					$.log.s( 'limitedget', result.sql );

					var rows = result.rows || [];
					
					var cached = values[ 'XPO.filter' ];
					if (cached)
						cached = cached[ 'XPO.cache' ];
					if (rows.length && typeof cached === 'object') {
						rows.forEach(function (row, j) {
							var postedupdated = cached[ row.uid0 ];

							/*
							 * let the full row through unless the row was
							 * updated later than the posted updated time
							 * */
							if (postedupdated !== undefined
							&& row.updated0 <= postedupdated)
								rows[j] = {
									uid0: row.uid0,
									archived0: row.archived0,
								};
						});
					}
					
					typeof callback === 'function' && callback({
						limit:	sanelimits.limit,
						page:	sanelimits.xpopage,
						count:	count,
						pages:	Math.ceil(count / sanelimits.limit),
						rows:	rows,
					});
				});
			});
		},
		/* EXPERIMENTAL
		 * deletes all rows in a table using the where clause
		 * 
		 * for now it doesn't keep track of the popped items
		 * */
		popwhere: function (database, table, uids, filter, callback) {
			if (!(uids instanceof Array)) {
				uids = [uids];
			}
			
			options = options || {};
			var where = Helpers.where( filter );

			if (uids && uids.length === 0) {
				typeof callback === 'function' && callback([]);
				return;
			}
			
			var querystr = '', pops = [];
			uids.forEach(function (elt) {
				var uid = elt;
				if (typeof elt !== 'number')
					uid = parseInt( elt.uid0 );

				if (uid > 0 && where.str.length) {
					querystr += 'delete from `'+database+'`.`'+table+'` '+where.str+';';
					pops = pops.concat(where.args);
				}
			});
			
			if (querystr.length) {
				Data.query(querystr, pops).then(function (result) {
					result.err && $.log.s( result.err );
					
					typeof callback === 'function' && callback(pops);
				});
			} else {
				typeof callback === 'function' && callback([]);
			}
		},
		/*
		 * deletes a list of uids, returns array of uids that were passed
		 * 
		 * uses a table uid:table:created, inserts pop'd uids with table name
		 * removes old ones after 20 days
		 * 
		 * your module can convert the table name to the xpotype ;)
		 * */
		pop: function (database, table, values, callback, options) {
			if (!isarr(values)) values = [values];
			
			options = options || {};

			if (values && values.length === 0) {
				typeof callback === 'function' && callback([]);
				return;
			}
			
			var querystr = '', pops = [], sets = [];
			values.forEach(function (elt) {
				var uid = elt;
				if (!isnum(uid)) uid = parseint( elt.uid0 );

				if (uid > 0) {
					querystr += 'delete from `'+database+'`.`'+table+'` where `uid0` = ?;';
					pops = pops.concat(uid);

					sets.push({
						luid0:		uid,
						ltable0:	options.type || table,
						_created0:	new Date().getTime(),
						updated0:	new Date().getTime(),
					});
				}
			});
			
			if (querystr.length) {
				Data.query(querystr, pops).then(function (result) {
					result.err && $.log.s( result.err );
					
					Helpers.set(database, tbl_pops, sets, function () {
						/*
						 * removes old pops entries
						 * old = 40 days old
						 */
						var old = new Date().getTime() - (40*1000*60*60*24);
						Data.query('delete from '+database+'.'+tbl_pops+' where `updated0` <= ?', [old]).then(function () {
							typeof callback === 'function' && callback(pops);
						});
					}, {
						checkism: false,
					});
				});
			} else {
				typeof callback === 'function' && callback([]);
			}
		},
		getpops: function (database, table, since, callback) {
			Helpers.getall(database, tbl_pops, {
				ltable0:		table,
				updated0$ge:	since,
			}, function (rows) {
				var pops = [];
				if (rows) {
					rows.each(function (row) {
						pops.push( row.luid );
					});
				}

				typeof callback === 'function' && callback(pops);
			});
		},
		/*
		 * used with .where
		 * */
		limitedcount: function (database, table, str, args, callback) {
			if (!str.startsWith( 'where' ) && str.length > 1) str = 'where ' + str;
			
			Data.query( 'select count(uid0) from `'+database+'`.`'+table+'` '+str, args).then(function (result) {
				result.err && $.log.s( result.err );
//				$.log.s( 'limitedcount', result.sql, result.rows );
				
				var count = result.rows[0]['count(uid0)'] || 0;

				typeof callback === 'function' && callback(count);
			});
		},
		count: function (database, table, callback, options) {
			options = options || {};
			
			Data.query( 'select count(uid0) from `'+database+'`.`'+table+'`').then(function (result) {
				result.err && $.log.s( result.err );
				
				var count = result.rows[0]['count(uid0)'] || 0;

				typeof callback === 'function' && callback(count);
			});
		},
		/* 
		 * propname		==
		 * propname$ne	!=
		 * propname$sw	startsWith
		 * propname$ew	endsWith
		 * propname$ee	===
		 * propname$gt	>
		 * propname$st	<
		 * propname$ge	>=
		 * propname$se	<=
		 * propname$re	match(regex) @TODO
		 * 
		 * $max			number is limit of list
		 * */
		where: function (values) {
//			$.log.s( 'Helpers.where', values );
			
			var wherestr	= '',
				whereargs	= [],
				count		= 0,
				total		= 0;
			
			/*
			 * [wherestr, [arg, arg, arg...] ]
			 * */
			if (values instanceof Array) {
				wherestr	= 'where '+values[0];
				whereargs	= values[1];
			}
			else if (typeof values === 'object') {
				wherestr	= 'where ';

				// this helps calc if 'and' should be a part of the query
				for (var i in values) {
					if (values[i] !== undefined) ++total;
				}
				
				var keys = Object.keys(values), j = 0;
				for (var i in values) {
					
					// only non empty values are inserted in the query
					// this had a bug earlier, it needs finer checking for empty
					if (values[i] !== undefined) {
						var value = values[i];
						
						++count;
						var op = '='; // copy from offline filters
						if (i.substr(-3).startsWith('$')) {

							var ophint = i.substr(-2);

							if (ophint == 'ne')
								op = '!=';
							if (ophint == 'gt')
								op = '>';
							if (ophint == 'st')
								op = '<';
							if (ophint == 'ge')
								op = '>=';
							if (ophint == 'se')
								op = '<=';

							value = values[i];
							i = i.substr(0, i.length-3);
						}
						
						/* TODO EXPERIMENTAL
						 * write a test case with grouping + and + or
						 * 
						 * this only works for two comparisons :(
						 * 
						 * maybe we introduce the group syntax
						 * {
						 * 		$: { age: 40, name: 'ha%' }
						 * 		or$married: 1
						 * }
						 * translates to
						 * ( age = 40 and name = 'ha%' ) or married = 1 
						 * 
						 * whenever you detect a $ prop that's an object
						 * sub-eval its contents, return and put them in (...)
						 * 
						 * $start = (
						 * $end = )
						 * */
						var andor = ' and ';

						var nextkey = keys[j+1];
						if (nextkey && nextkey.startsWith('or$')) {
							andor = ' or ';
						}
						if (nextkey && nextkey.startsWith('and$')) {
							andor = ' and ';
						}
						if (i.startsWith('or$')) {
							i = i.substr(3);
						}
						if (i.startsWith('and$')) {
							i = i.substr(4);
						}
						if (i === '$start')
							wherestr += '(';
						else if (i === '$end')
							wherestr += ')';
						else {
							wherestr += i+' '+op+' ?';
							whereargs.push( value );
						}
						
						if (total > 0 && count !== total && !['$start'].includes(i)
						&& nextkey !== '$end'
						) {
							wherestr += andor; // a way to sometimes put 'or' here
						}
						
					}
					
					++j;
				}
				
				if (count === 0) wherestr = '';
			}
			
//			$.log.s( wherestr, whereargs );
			
			return {
				str: wherestr,
				args: whereargs
			};
		},
		/*
		 * this shouldn't be using xpo values, process xpo values in the Crud*
		 * by using xpo values here we cannot use this in other projects
		 * */
		limit: function (payload, options) {
			options = options || {};
			options.count = options.count || false;
			options.limit = options.limit || 20;
			options.sortby = options.sortby || 'uid';
			options.order = options.order || 'desc';

			var obj				= {};
			obj.page			= 1,
			obj.xpopage			= 1; // exposed to the public
			
			if (typeof payload === 'object') {
				obj.limit = payload[ 'XPO.limit' ] || options.limit;
				obj.page = payload[ 'XPO.page' ] || obj.page;
				obj.page = parseInt( obj.page );
				if (String(obj.page) === 'NaN') obj.page = 1;
			}

			// this means there's no limit
			if (obj.limit === true) {
				obj.str			= ' order by `'+options.sortby+'` '+options.order;
				obj.args		= [];
			} else {
				if (obj.limit === undefined)
					obj.limit		= options.limit;

				if (obj.page)
					obj.page = obj.page-1;
					
				obj.xpopage = obj.page+1;

				obj.page = obj.page * obj.limit;

				// if start at (.page) is bigger than total items, reset to page 1
				if (obj.page > options.count && options.count !== false) {
					obj.page = 0;
				}
			
				obj.str			= ' order by `'+options.sortby+'` '+options.order+' limit ?, ?';
				obj.args		= [obj.page, obj.limit];
			}
			
			return obj;
		},
	};
	
	module.exports = helpers = Helpers;

})();