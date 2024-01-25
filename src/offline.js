/*
 * TODO make Offline.list to add Offline functionality to lists
 * this will include auto saving changes to the list adapter to Offline stores
 * */
var Offline, offline;
;(function(){
	'use strict';
	var database	= 'db', db = false, maxaazin = {},
		unsavedname = 'unsaved'+'default',
		exclusions	= [unsavedname],
		delaydefault = 30*1000,
		gcallback,
		debug_offline = 1;

	var ajraa = function (callback) {
		// get pending items from all offline stores
		Offline.getall( Offline.allstores(), {
			filter: {
				pending: 1,
			},
			// helps only keep relevant props for network transport
			format: true,
		}, function (kinds) {
			for (var i in kinds) {
				var m = maxaazin[i];
				var things = kinds[i], ixraaj = 0;
				if (m.keyvalue) { // limit to { key: value, ... }
					ixraaj = {};
					for (var j in things) {
						var uid = things[j].uid;
						delete things[j].uid;
						delete things[j].created;
						delete things[j].updated;
						ixraaj[ uid ] = things[j].value;
					}
				}
				/*else if (things.remove) {
					things = {
						uid: things.uid,
						remove: 1,
					};
				}*/
				Network.sync(m.name, m.need, ixraaj || things);
			}
		});
	};
	var ijtama3 = function (callback) {
		$.taxeer('offline-ajraa', function () {
			ajraa();
		}, 3000);
	};
	var createstores = function () {
		if (debug_offline) $.log.w('Offline createstores', maxaazin);
		
		var request = indexedDB.open(database, BUILDNUMBER);
		request.onerror = function(event) {
//			$.log.s( 'Offline.init.onerror', event );
			if (event.target.error.name === 'VersionError') {
				/* delete the old database even if the version number is bigger
				 * recreate() calls init() which calls create() which calls
				 * createstores()
				 * */
				Offline.recreate();
			} else {
//				$.log.e( event.target.error );
			}
		};
		request.onupgradeneeded = function(event) {
//			$.log.s( 'Offline.init.onupgradeneeded' );
			
			db = event.target.result;
			
			Offline.allstores().forEach(function (name) {
//				$.log.s( 'del', name );
				db.deleteObjectStore(name);
			});
			
			Object.values(maxaazin).forEach(function (store) {
				store.time = 0; // reset get time
				var name = store.name+store.need;
//				$.log.s( 'del', name );
				if ( db.objectStoreNames.contains(name) )
					db.deleteObjectStore(name);

				Offline._createstore(name, store.mfateeh);
			});
		};
		request.onsuccess = function(event) {
//			$.log( 'Offline.init.onsuccess' );

			db = event.target.result;
			db.onversionchange = Offline.warning;
			
			Offline.ready = 1;
			
			if (gcallback) {
				gcallback();
				gcallback = 0;
			} else {
				Hooks.run('offline-ready', 1);
			}
		};
	};
	var fillmissingkeys = function (store, object) {
		store = maxaazin[store];
		store.mfateeh.forEach(function (m) {
			object[m] = object[m] === undefined ? 0 : object[m];
		});
	};

	/*
	 * Offline storage and adapter in one
	 * auto manages database versioning
	 * */
	Offline = offline = {
		ruid: function () {
			var ruid = parseInt( preferences.get(3) || -1 );
			preferences.set(3, ruid - 1);
			return (ruid - 1);
		},
		mundarij: {
			add: {},
			remove: {},
			get: {},
		},
		ready: false,
		response: {
			add: function (name, need, cb) {
				if (typeof need == 'function') cb = need, need = 0;
				need = need || 'default';
				Offline.mundarij.add[ name ] = Offline.mundarij.add[ name ] || {};
				Offline.mundarij.add[ name ][ need ] = cb;
			},
			remove: function (name, need, cb) {
				if (typeof need == 'function') cb = need, need = 0;
				need = need || 'default';
				Offline.mundarij.remove[ name ] = Offline.mundarij.remove[ name ] || {};
				Offline.mundarij.remove[ name ][ need ] = cb;
			},
			get: function (name, need, cb) {
				/* WHY use cases
				 * when you want to get something from the server using Offline
				 * Offline handles everything, eg the .get response from server
				 * it adds a listener to Network.get as well for your module
				 * so your module.server can respond using both get & sync
				 * */

				if (typeof need == 'function') cb = need, need = 0;
				need = need || 'default';
				Offline.mundarij.get[ name ] = Offline.mundarij.get[ name ] || {};
				Offline.mundarij.get[ name ][ need ] = cb;

				Network.response.get(name, need, function (response) {
					cb( shallowcopy(response) );

					var store = maxaazin[name+need];
					if (store) store.time = Time.now();
					Offline.save(name, need, response);
				});
			},
		},
		add: function (name, need, value) { // adaaf
			if (debug_offline) $.log.w('Offline.add', name, need);

			if (arguments.length === 2) value = need, need = 0;
			need = need || 'default';
			if (!(value instanceof Array)) value = [value];
			if (value instanceof Array) {
				Offline.set(name+need, value, function (needssync) {
					var m = maxaazin[ name+need ];
					if (m.keyvalue) {
						var kind = Offline.mundarij.get;
						if (kind[name] && typeof kind[name][need] == 'function')
							kind[name][need]( shallowcopy(value) );
					}
					if (needssync) ijtama3();
				});
			}
		},
		remove: function (name, need, value) { // [ { uid }, { uid } ]
			if (arguments.length === 2) value = need, need = 0;
			need = need || 'default';
			if (!(value instanceof Array)) value = [value];
			if (value instanceof Array) {
				value.forEach(function (item) {
					item.pending = 1;
					item.remove = 1;
				});
				Offline.set(name+need, value, function (needssync) {
					var m = maxaazin[ name+need ];
					if (m.keyvalue) {
						var kind = Offline.mundarij.get;
						if (kind[name] && typeof kind[name][need] == 'function')
							kind[name][need]( shallowcopy(value) );
					}
					if (needssync) ijtama3();
				});
			}
		},
		create: function (name, need, o) { // ixtalaq/create store
			if (debug_offline) $.log.w('Offline.create', name, need);

			o = o || {};
			o.delay = o.delay || undefined;
			o.nazzaf = o.nazzaf || undefined;
			o.mfateeh = o.mfateeh || [];
			need = need || 'default';
			/* BUGFIX
			 * i think there's a bug in indexdb implementation that forced me
			 * to redefine this or maybe i'm mistaken in my understanding
			 * but it was triggering errors without this index saying it doesn't
			 * exist, i thought keyPath auto gens the uid index as well
			 * maybe i misunderstood this concept
			 * */
			// indexes to search by date, all objects have these props
			['uid', 'created', 'updated', 'pending'].forEach(function (v) {
				if (!o.mfateeh.includes(v)) o.mfateeh.push(v);
			});
			maxaazin[ name+need ] = {
				name:		name,
				need:		need,
				mfateeh:	o.mfateeh,
				nazzaf:		o.nazzaf,
				delay:		o.delay,
				tashkeel:	o.tashkeel,
				keyvalue: o.keyvalue,
			};
			$.taxeer('offline-init', function () {
				createstores();
			}, 250);
		},
		get: function (name, need, value, time) {
			if (debug_offline) $.log.w('Offline.get', name, need);

			need = need || 'default';
			/*
			 * it gets all first from Offline store, if nothing is found
			 * then it tries online
			 * if time is provided, then it saves when online was fetched last
			 * */
			
			var expired = 0;
			if (time !== undefined) {
				var store = maxaazin[name+need];
				if (store) {
					var delay = store.delay || delaydefault;
					if (delay !== -1) {
						store.time = store.time || Time.now() - (delay*2);
						if (time - store.time > delay) expired = 1;
					}
				}
			}
			
			if (expired) {
				Network.get(name, need, value);
			} else {
				Offline.getall(name+need, value, function (response) {
					var kind = Offline.mundarij.get;
					if (kind[name] && isfun(kind[name][need])) {
						kind[name][need](response.toNative());
					}
				});
			}
		},
		getforun: function (name, need, value, cb) {
			need = need || 'default';
			// simply gets from offline storage and return native array
			if (isfun(cb))
			Offline.getall(name+need, value, function (response) {
				cb(response.toNative());
			});
		},
		save: function (name, need, value) { // hifz/save from Network.sync[name][need] value
			if (debug_offline) $.log.w( 'Offline save', name, need, value );
			for (var uid in value) {
				var val = value[uid], kind = Offline.mundarij.add;
				
				val.uid = val.uid || uid;

				val.pending = 0;
				if (val.remove === -1) { // truly purged on both ends
					kind = Offline.mundarij['remove'];
					Offline.pop(name+need, val.uid);
					val = val.uid;
				} else {
					Offline.set(name+need, [val]);
				}

				if (kind[name] && typeof kind[name][need] == 'function') {
					kind[name][need]( shallowcopy(val) );
				}
			}
		},
		
		/* 
		 * propname		==
		 * propname$sw	startsWith
		 * propname$ew	endsWith
		 * propname$ee	===
		 * propname$gt	<
		 * propname$st	>
		 * propname$ge	>=
		 * propname$se	<=
		 * propname$ma	match all comma separated tags, if has all tags
		 * propname$re	match(regex) @TODO
		 * 
		 * $max			number is limit of list
		 * */
		filter: function (filter, rawitems) {
			if (typeof filter === 'object' && Object.keys(filter).length) {
				/*
				 * by default it assumes that every single filter needs to eval
				 * true, as if there's an AND between every filter
				 * 
				 * this is done greedily by quiting the check the moment a filter
				 * is found to not eval to true
				 * */
				
				var filtered = $.array(), keys = Object.keys(filter);
				rawitems.each(function (rawitem) {
//					$.log.s( '------------', rawitem.uid );

					var matchedprops = 0,
						totalprops = keys.length;

					var doadd, count = 0, i, prop;
					while (count < totalprops) {
						i = keys[count], prop = i, doadd = 0;
						
						if ( i.endsWith('$i') ) { // includes string in string
							prop = (rawitem[ i.slice(0,-2) ] ) || 0;
							if ( typeof prop === 'string' && prop.toLowerCase().includes( filter[i] ) )
								doadd += 1;
						}
						if ( i.endsWith('$s') ) { // startswith
							prop = i.slice(0,-2);
							if ( (rawitem[ prop ] ).startsWith( filter[i] ) )
								doadd += 1;
						}
						if ( i.endsWith('$e') ) { // endswith
							prop = i.slice(0,-2);
							if ( (rawitem[ prop ] ).endsWith( filter[i] ) )
								doadd += 1;
						}
						if ( i.endsWith('$gt') ) { // greater than
							prop = i.slice(0,-3);
							if ( rawitem[ prop ] > filter[i] )
								doadd += 1;
						}
						if ( i.endsWith('$st') ) { // smaller than
							prop = i.slice(0,-3);
							if ( rawitem[ prop ] < filter[i] )
								doadd += 1;
						}
						if ( i.endsWith('$ge') ) { // greater or equal
							prop = i.slice(0,-3);
							if ( rawitem[ prop ] >= filter[i] )
								doadd += 1;
						}
						if ( i.endsWith('$se') ) { // smaller or equal
							prop = i.slice(0,-3);
							if ( rawitem[ prop ] <= filter[i] )
								doadd += 1;
						}
						if ( i.endsWith('$ne') ) { // not equal
							prop = i.slice(0,-3);
							if ( rawitem[ prop ] != filter[i] )
								doadd += 1;
						}
						if ( i.endsWith('$ma') ) { // match all in comma sep
							prop = i.slice(0,-3);
							var tags = (rawitem[ prop ] || '');
							if (filter[i] === '') doadd += 1;
							else if (filter[i] == ',') {
								if (tags === '') doadd += 1;
							} else {
								tags.split(',').forEach(function (tag) {
									if (tag.trim() == filter[i])
										doadd += 1;
								});
							}
						}
						if ( i.endsWith('$ee') ) { // equal equal (absolute)
							prop = i.slice(0,-3);
							if ( rawitem[ prop ] === filter[i] )
								doadd += 1;
						}
						else if ( rawitem[i] == filter[i] ) doadd += 1;
						
						++count;
						
						if (doadd) ++matchedprops;
						
//						$.log.s( i, filter[i], rawitem[prop] );
					}
					
//					$.log.s( matchedprops, totalprops );

					if (matchedprops === totalprops)
						filtered.set( rawitem.uid, rawitem );
				});
				
				return filtered;
			} else return rawitems;
		},
		_createstore: function (name, keys) {
//			$.log.s( 'Offline._createstore', name );

			var objectstore = db.createObjectStore(name, { keyPath: 'uid' });

			for (var i in keys) {
				objectstore.createIndex(keys[i], keys[i]);
			}
		},
		_get: function (store, uid, callback) {
			if (db) {
				try {
					db.transaction(store).objectStore(store).get(uid)
						.onsuccess = function(event) {
							typeof callback === 'function' && callback(event.target.result);
						};
				} catch (error) {
					$.log('Offline.get', store, uid);
					$.log.e(error);
				}
			} else {
				// TODO should there be a warning?
			}
		},
		count: function (store, callback) {
			var i = 0;
			db.transaction(store).objectStore(store).openCursor().onsuccess = function (event) {
				var cursor = event.target.result;
				if (cursor) {
					++i;
					cursor.continue();
				} else {
					// do another .getall with no limit
					typeof callback === 'function' && callback(i);
				}
			};
		},
		filteredcount: function (store, bound, direction, callback) {
//			$.log.s( 'filteredcount', store, bound, direction );

			var i = 0;
			db.transaction(store).objectStore(store).openCursor(bound, direction).onsuccess = function (event) {
				var cursor = event.target.result;
				if (cursor) {
					++i;
					cursor.continue();
				} else {
					// do another .getall with no limit
					typeof callback === 'function' && callback(i);
				}
			};
		},
		parsevalue: function (value) {
			// idb doesn't allow boolean indexes, so ugly hack
			if (value === true) value = 1;
			if (value === false) value = 0;
			
			if (value instanceof Array) {
				for (var i in value) {
					value[i] = Offline.parsevalue(value[i] );
				}
			}
			
			return value;
		},
		/*
		 * this func is called on each obj before it is sent to Network uploads
		 * intro a Offline.store.<name>.tashkeel func to override this
		 * */
		format: function (obj, store) {
			obj = obj || {};
			var newobj = {};
			
//			delete obj.photo;
			
//			if (obj.remove && obj.uid > 0) {
//				newobj = {
//					uid: obj.uid,
//					remove: obj.remove,
//				};
//			} else {
				delete obj._store;
				delete obj.pending;

				newobj = shallowcopy(obj);
//			}
			
			var m = maxaazin[store];
			if (m && isfun(m.tashkeel)) newobj = m.tashkeel(newobj);
			
			return newobj;
		},
		/*
		 * returns a $.array
		 * */ 
		_getall: function (store, options, callback) {
//			$.log.e( 'Offline._getall', store );
			var objectStore		= db.transaction(store).objectStore(store),
				unsavedStore	= db.transaction(unsavedname).objectStore(unsavedname),
				i				= 0,
				filteredcount	= 0, // total objects filtered out
				objects			= $.array(),
				filters			= options.filter || {},
				bound			= null,
				direction		= 'prev',
				extra			= {
						pages: false,
						count: false,
						limit: options.limit,
					};
			
			// this will fuckup Offline lists' page counts, test this
			if (extra.limit === undefined || extra.limit === true) {
				extra.limit = true;
			}

			options.key = [];
			options.only = [];
			
			if (filters.cache)
				filters.cache = undefined;
			
			// this only allow filtering by a single key
			// is there a better way to handle this?
			if ( Object.keys(filters).length > 1 ) {
				
				var keys = Object.keys(filters);
				var only = Object.values(filters);
				for (var i in only) {
					if (only[i] !== undefined) {
						options.key.push( keys[i] );
						options.only.push( only[i] );
					}
				} 
			}
			
			if ( Object.keys(filters).length <= 1
			||	options.key.length <= 1 ) {
				options.key = Object.keys(filters)[0];
				options.only = Object.values(filters)[0];
				// if only is empty, unset the key
				if (options.only === undefined)
					options.key = undefined;
			}
			
//			$.log.s( store, options.key, options.only );
			
			if (options.key) {
				objectStore = objectStore.index( options.key );
				options.only = Offline.parsevalue( options.only );
				bound = IDBKeyRange.only( options.only );
//				bound = IDBKeyRange.bound(options.only, options.only, false, false);
			}

			if (extra.limit !== true) {
				extra.limit = extra.limit || 20;

				var page = options.page || 0;
				if (page) page = page - 1;
				var startat = page * extra.limit;
			}

			objectStore.openCursor(bound, direction).onsuccess = function (event) {
				var cursor = event.target.result;
				if (cursor) {
					var key = cursor.value.uid;
					
					if (extra.limit === true || options.perm) {
						var item = cursor.value;
						if (options.format)
							item = Offline.format( cursor.value, store );

						objects.set(key, item);
					} else {
//						$.log.s( 'Offline.getall', startat, i, key );
						if ( i >= startat && objects.length < extra.limit ) {
							var item = cursor.value;
							if (options.format)
								item = Offline.format( cursor.value, store );

							objects.set(key, item);
						} else {
							if (bound)
								++filteredcount;
						}
					}
					++i;
					cursor.continue();
				} else {
					Offline._getallpending(store, function (unsaved) {
						unsaved.each(function (item) {
							if (options.format)
								item = Offline.format( item, store );
							
							return item;
						});
						
						var andfinally = function (objects) {
							/* 
							 * pre-sorting for perm lists && pre-filtering
							 * */
							if (options.perm) {
								objects.sort(options.reversed || 0, (options.orderby || 'uid'), 'uid');
								if (typeof options.multifilter === 'object' && Object.keys(options.multifilter).length)
									objects = Offline.filter(options.multifilter, objects);
							}

							if (extra.limit === true) {
								extra.count = objects.length;
								extra.pages = false;
								typeof callback === 'function' && callback(objects, extra, unsaved);
							} else {
								Offline.count(store, function (count) {
									if (bound) {
										extra.count = objects.length+filteredcount;
									} else {
										extra.count = count;
									}
									extra.pages = Math.ceil(extra.count / extra.limit);
									
									/* 
									 * pre-sorting for perm lists
									 * */
									if (options.perm) {
										extra.count = objects.length;
										extra.pages = Math.ceil(extra.count / extra.limit);
										extra.filteredcount = objects.length;
										objects = objects.slice(startat, startat+options.limit-1);
									}

									typeof callback === 'function' && callback(objects, extra, unsaved);
								});
							}
						};

						/* 
						 * pre-fillingin (used to fill up missing props)
						 * */
						if (typeof options.uponfillin === 'function') {
							options.uponfillin(objects, function (objects) {
								andfinally(objects);
							}, 1);
						} else
							andfinally(objects);
					});
				}
			};
		},
		_getallpending: function (store, callback) {
			var unsavedStore	= db.transaction(unsavedname).objectStore(unsavedname),
				bound			= IDBKeyRange.only( store ),
				objects			= $.array();

			unsavedStore.index( '_store' ).openCursor(bound).onsuccess = function (event) {
				var cursor = event.target.result;
				if (cursor) {
					/*
					 * we store them as positive uids because idb doesn't allow
					 * looping over neg ones
					 * but the rest of the systemd requires them to be negative
					 * to differentiate b/w unsaved and saved items
					 * otherwise they end up replacing saved items with the same
					 * uids
					 * so we negate them here
					 * */
					cursor.value.uid = cursor.value.uid * -1;
					
					objects.set(cursor.value.uid, cursor.value);
					cursor.continue();
				} else {
					typeof callback === 'function' && callback(objects);
				}
			};
		},
		/*
		 * accepts only negative uids
		 * doesn't need a store cuz these -ve uids are unique across stores ;)
		 * */
		getpendingitem: function (uid, callback) {
			var unsavedStore	= db.transaction(unsavedname).objectStore(unsavedname),
				// this function takes in a -ve uid but turns it +ve
				bound			= IDBKeyRange.only( uid * -1 ),
				objects			= $.array();

			unsavedStore.index( 'uid' ).openCursor(bound).onsuccess = function (event) {
				var cursor = event.target.result;
				if (cursor) {
					cursor.value.uid = cursor.value.uid * -1;
					
					objects.set(cursor.value.uid, cursor.value);
					cursor.continue();
				} else {
					typeof callback === 'function' && callback(objects);
				}
			};
		},
		getallpending: function (store, callback) {
//			$.log.s( 'Offline.getall', store.join(' ') );
			
			/*
			 * when store is an array, ...use the same options for each store...
			 * return the result items indexed using the store name as key
			 * $.array:
			 * 		pageitem:		$.array
			 * 		classitem:		$.array
			 * 		attendanceitem:	$.array
			 * */
			
			if (store instanceof Array) {
				var types	= {},
					i		= 0,
					total	= 0,
					q		= $.queue();
				
				store.forEach(function () {
					q.set(function (done, queue) {
						Offline._getallpending(store[i], function (objects) {
							if (objects.length) {
								types[ store[i] ] = objects.toNative();
								++total;
							}

							++i;
							done(queue);
						});
					});
				});
				
				q.run(function () {
					if (total === 0) types = false;
					typeof callback === 'function' && callback(types);
				});
				
			} else {
				Offline._getallpending(store, callback);
			}
		},
		getall: function (store, options, callback) {
//			$.log.s( 'Offline.getall', store.join(' ') );
			
			options = options || {};
			
			/*
			 * when store is an array, use the same options for each store
			 * return the result items indexed using the store name as key
			 * $.array:
			 * 		pageitem:		$.array
			 * 		classitem:		$.array
			 * 		attendanceitem:	$.array
			 * */
			
			if (store instanceof Array) {
				var types	= {},
					i		= 0,
					total	= 0,
					q		= $.queue();
				
				store.forEach(function () {
					q.set(function (done, queue) {
						Offline._getall(store[i], options, function (objects, ignore, unsaved) {
							if (objects.length || unsaved.length) {
								if (options.filter
								&&	options.filter.pending
								&&	store[i].endsWith('_archive')) {
									store[i] = store[i].slice(0, -'_archive'.length);
								}

								if (types[ store[i] ]) {
									types[ store[i] ].concat( objects.toNative().concat( unsaved.toNative() ) )
								} else {
									types[ store[i] ] = objects.toNative().concat( unsaved.toNative() );
								}
								
								++total;
							}

							++i;
							done(queue);
						});
					});
				});
				
				q.run(function () {
					if (total === 0) types = false;
					typeof callback === 'function' && callback(types);
				});
				
			} else {
				Offline._getall(store, options, callback);
			}
		},
		/*
		 * objects is a $.array
		 * */ 
		set: function (store, arr, callback) {
			if (debug_offline) $.log.w('Offline.set', store);
			if (!db) {
				if (debug_offline) $.log.e('Offline db not created yet', db);
				return;
			}
			
			/*
			 * this is need because if there are no objects present, the transaction
			 * is not even initiated, so there's no oncomplete event lol
			 * best to just return alongside callback
			 * */
			if (arr.length === 0) {
				typeof callback === 'function' && callback();
				return;
			}
			
			var needssync	= 0;
			var stores		= [store, unsavedname];
			try {
				var transaction = db.transaction(stores, 'readwrite');
			} catch (e) {
				$.log.e(e);
				return;
			}
			
			// do something when all the data is added to the database.
			transaction.oncomplete = function(event) {
//				$.log.s("Offline.set.oncomplete");
				typeof callback === 'function' && callback(needssync);
			};

			var objectStore		= transaction.objectStore(store);
			var unsavedStore	= transaction.objectStore(unsavedname);
			arr.forEach(function(obj) {
				/*
				 * idb spec f'd up again by not allowing boolean indexes
				 * so true is 1 and false is 0 *facepalm*
				 * */
				if (obj.pending === true) obj.pending = 1;
				if (obj.pending === false) obj.pending = 0;
				if (obj.uid < 0 || obj.pending) needssync = 1;

				/*
				 * btw idb doesn't allow changing primary key of an object
				 * so you have to delete the old one and resave it lol
				 * i dont need that cuz im using a sep store for unsaved items
				 * 
				 * case: it was just saved on the server and now being saved offline
				 * has a -ve .ruid
				 * has a +ve uid
				 * idea: del from unsaved store using -ve .ruid as +ve uid
				 * 		save to the real store using the +uid
				 * 
				 * case: only saving it offline, never saved on the server
				 * has a -ve uid
				 * idea: use the -ve uid as +ve uid
				 * 		passing _store = real store
				 * 		check if there's a record with the same uid present
				 * 		override the old obj with new obj props
				 * 		store to the unsaved store
				 * 
				 * case: both saved server side and offline
				 * has a +ve uid
				 * idea: just save to the real store
				 * */
				
				// just saved on the server
				if (obj.uid > 0 && obj.ruid < 0) {
					unsavedStore.delete( obj.ruid * -1 ).onsuccess = function () {
						delete obj.ruid;
						delete obj._store;
						
						fillmissingkeys(store, obj);
						objectStore.put(obj);
					};
				}
				// only saving if offline
				else if (obj.uid < 0 && obj.ruid === undefined) {
					// since idb doesn't allow looping over neg uids
					obj.uid = obj.uid * -1;
					obj._store = store;
					
					unsavedStore.get(obj.uid || 0).onsuccess = function(event) {
						var oldobj = event.target.result;
						if (oldobj) {
							oldobj = Object.assign(oldobj, obj);
							obj = oldobj;
						}
						
						fillmissingkeys(unsavedname, obj);
						unsavedStore.put(obj);
					};
				// real saved item
				} else {
					objectStore.get(obj.uid || 0).onsuccess = function(event) {
						var oldobj = event.target.result;

						if (oldobj) {
							oldobj = Object.assign(oldobj, obj);
							obj = oldobj;
						} else {
							if (obj.pending === false
							||	obj.pending === undefined
							||	obj.pending === null)
								obj.pending = 0;
						}

						fillmissingkeys(store, obj);
						objectStore.put(obj);
					};
				}
				
			});
		},
		pop: function (store, uid, callback) {
			if (uid < 0) {
				store = unsavedname;
				uid = uid * -1;
			}
			
			db.transaction(store, 'readwrite').objectStore(store).delete(uid)
				.onsuccess = function(event) {
					typeof callback === 'function' && callback(event.target.result);
				};
		},
		popall: function (store, arr, callback) {
			var stores			= [store, unsavedname];
			var transaction 	= db.transaction(stores, 'readwrite');
			var objectStore		= transaction.objectStore(store);
			var unsavedStore	= transaction.objectStore(unsavedname);
			
			// Do something when all the data is added to the database.
			transaction.oncomplete = function(event) {
//				$.log.s("all popped!");
				typeof callback === 'function' && callback();
			};

			var objectStore = transaction.objectStore(store);
			arr.forEach(function(obj) {
				if (obj.uid < 0) unsavedStore.delete(obj.uid * -1);
				else objectStore.delete(obj.uid);
			});
		},
		allstores: function () {
//			$.log.s( 'Offline.allstores' );
			var oldstores = [];
			
			/*
			 * i think the transaction becomes inactive if there is too much
			 * delay between two requests like deleteObjectStore
			 * so i had to create an array outta this
			 * */
			for (var i in db.objectStoreNames) {
				if ( db.objectStoreNames.hasOwnProperty(i) ) {
					var name = db.objectStoreNames[i];
					if ( db.objectStoreNames.contains(name) ) {
//						$.log.s( 'old', name );
						if (!exclusions.includes(name))
							oldstores.push(name);
					}
				}
			}
			
			return oldstores;
		},
		recreate: function (callback) {
			db && db.close && db.close();
			var request = indexedDB.deleteDatabase(database);
			request.onsuccess = function () {
				Offline.init(callback);
			};
			/*request.onblocked = function () {
				$.log.s( 'blocked' );
			};
			request.onerror = function () {
				$.log.s( 'error' );
			};*/
		},
		/*
		 * this should just reinit the database and reload the current page as
		 * usual, all that'd have happened is that there will be less data now
		 * than before, but the user should be shown a helpful message about it
		 * in the rare instance that this happens
		 * 
		 * this should cause a sync with the server where only data is uploaded
		 * once done, the user should be told that they can safely reload the page
		 * 
		 * this won't happen often because we can notify users of any upcoming
		 * updates, turn their apps 'off' until the update is done and tested
		 * completely
		 * */
		warning: function (event) {
			/* OMG THIS IS SO STUPID
			 * if the old isn't closed, the new one can't be opened lol
			 * when two tabs are open and one gets a new version loaded up
			 * the effect is
			 * the new tab will get stuck on loading until the other tab closes
			 * the db bahahahah
			 * so you'll have to reload the old tab, to avoid this why not
			 * auto call db.close lmfao
			 * */
			db.close();
			// replace this with our custom loader screen + this message and a reload button
			dom.setloading( 'appneedsreload' );
		},
		init: function (callback) {
			if (debug_offline) $.log.w('Offline.init');
			
			gcallback = callback;
			Offline.create('unsaved', 'default', {
				mfateeh: ['_store']
			});
		}
	};
	
	Hooks.set('response-sync', function (payload) {
		if (debug_offline) $.log.w( 'Offline response-sync', payload );
		for (var name in payload) {
			for (var need in payload[name]) {
				var value = payload[name][need];
				Offline.save(name, need, value);
				
				var m = maxaazin[ name+need ];
				if (m.keyvalue) {
					var kind = Offline.mundarij.get;
					if (kind[name] && typeof kind[name][need] == 'function')
						kind[name][need]( shallowcopy(value) );
				}
			}
		}
	});
	Hooks.set('network-connection', function (yes) {
		if (yes)
		$.taxeer('offline-sync', function () {
			ijtama3();
		}, 250);
	});
})();
