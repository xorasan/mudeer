/*
 * TODO make offline.list to add offline functionality to lists
 * this will include auto saving changes to the list adapter to offline stores
 * */
//+ version warning states
var config, offline, Offline;
;(function(){
	'use strict';
	var database	= 'db', db = false,
		exclusions	= ['XPO.unsaved'];

	config = function (v) {
		var conf = preferences.get(170, 1);
		try {
			if (typeof conf === 'string')
				conf = JSON.parse( conf || '{}' );
		} catch (e) {
			conf = {};
		}
		if (conf) return conf[v];
		else return null;
	};
	
	/*
	 * offline storage and adapter in one
	 * auto manages database versioning
	 * */
	offline = {
		states: false,
		_stores: [],
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
		filter: function (filter, rawitems, debug) {
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
//					$.log.s( '------------', rawitem.XPO.uid );

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
						filtered.set( rawitem.XPO.uid, rawitem );
				});
				
				return filtered;
			} else return rawitems;
		},
		addstore: function (store, keys) {
			offline._stores.push({
				name: store,
				keys: keys
			});
		},
		_createstore: function (name, keys) {
//			$.log.s( 'offline._createstore', name );

			var objectstore = db.createObjectStore(name, { keyPath: 'XPO.uid' });

			/* BUGFIX
			 * i think there's a bug in indexdb implementation that forced me
			 * to redefine this or maybe i'm mistaken in my understanding
			 * but it was triggering errors without this index saying it doesn't
			 * exist, i thought keyPath auto gens the uid index as well
			 * maybe i misunderstood this concept
			 * */
			objectstore.createIndex('XPO.uid', 'XPO.uid');
			
			// indexes to search by date, all objects have these props
			objectstore.createIndex('XPO.created', 'XPO.created');
			objectstore.createIndex('XPO.updated', 'XPO.updated');
			objectstore.createIndex('XPO.pending', 'XPO.pending');
			for (var i in keys) {
				objectstore.createIndex(keys[i], keys[i]);
			}

		},
		get: function (store, uid, callback) {
			db.transaction(store).objectStore(store).get(uid)
				.onsuccess = function(event) {
					typeof callback === 'function' && callback(event.target.result);
				};
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
					value[i] = offline.parsevalue(value[i] );
				}
			}
			
			return value;
		},
		/*
		 * if obj has a pop property and uid is +ve then drops all other props
		 * and just keeps the pop and uid props
		 * 
		 * always remove the XPO.photo property, no need to send all that data
		 * to the server, that's not how uploads work lol
		 * */
		format: function (obj, store) {
			obj = obj || {};
			var newobj = {};
			
			delete obj.XPO.photo;
			
			if (obj.XPO.pop && obj.XPO.uid > 0) {
				newobj = {
					XPO.uid: obj.XPO.uid,
					XPO.pop: obj.XPO.pop,
					XPO.alias: obj.XPO.alias,
				};

				if (store == 'XPO.commentitem')
					newobj.XPO.type = obj.XPO.type;
			} else {
				delete obj.XPO._store;
				delete obj.XPO.pending;

				newobj = obj;
			}
			
			return newobj;
		},
		/*
		 * returns a $.array
		 * */ 
		_getall: function (store, options, callback) {
//			$.log.e( 'offline._getall', store );
			var objectStore		= db.transaction(store).objectStore(store),
				unsavedStore	= db.transaction('XPO.unsaved').objectStore('XPO.unsaved'),
				i				= 0,
				filteredcount	= 0, // total objects filtered out
				objects			= $.array(),
				filters			= options.XPO.filter || {},
				bound			= null,
				direction		= 'prev',
				extra			= {
						pages: false,
						count: false,
						limit: options.XPO.limit,
					};
			
			// this will fuckup offline lists' page counts, test this
			if (extra.limit === undefined || extra.limit === true) {
				extra.limit = true;
			}

			options.key = [];
			options.only = [];
			
			if (filters.XPO.cache)
				filters.XPO.cache = undefined;
			
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
				options.only = offline.parsevalue( options.only );
				bound = IDBKeyRange.only( options.only );
//				bound = IDBKeyRange.bound(options.only, options.only, false, false);
			}

			if (extra.limit !== true) {
				extra.limit = extra.limit || 20;

				var page = options.XPO.page || 0;
				if (page) page = page - 1;
				var startat = page * extra.limit;
			}

			objectStore.openCursor(bound, direction).onsuccess = function (event) {
				var cursor = event.target.result;
				if (cursor) {
					var key = cursor.value.XPO.uid;
					
					if (extra.limit === true || options.perm) {
						var item = cursor.value;
						if (options.XPO.format)
							item = offline.format( cursor.value, store );

						objects.set(key, item);
					} else {
//						$.log.s( 'offline.getall', startat, i, key );
						if ( i >= startat && objects.length < extra.limit ) {
							var item = cursor.value;
							if (options.XPO.format)
								item = offline.format( cursor.value, store );

							objects.set(key, item);
						} else {
							if (bound)
								++filteredcount;
						}
					}
					++i;
					cursor.continue();
				} else {
					offline._getallpending(store, function (unsaved) {
						unsaved.each(function (item) {
							if (options.XPO.format)
								item = offline.format( item, store );
							
							return item;
						});
						
						var andfinally = function (objects) {
							/* 
							 * pre-sorting for perm lists && pre-filtering
							 * */
							if (options.perm) {
								objects.sort(options.reversed || 0, (options.orderby || 'XPO.uid'), 'XPO.uid');
								if (typeof options.XPO.multifilter === 'object' && Object.keys(options.XPO.multifilter).length)
									objects = offline.filter(options.XPO.multifilter, objects);
							}

							if (extra.limit === true) {
								extra.count = objects.length;
								extra.pages = false;
								typeof callback === 'function' && callback(objects, extra, unsaved);
							} else {
								offline.count(store, function (count) {
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
										extra.XPO.filteredcount = objects.length;
										objects = objects.slice(startat, startat+options.XPO.limit-1);
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
			var unsavedStore	= db.transaction('XPO.unsaved').objectStore('XPO.unsaved'),
				bound			= IDBKeyRange.only( store ),
				objects			= $.array();

			unsavedStore.index( 'XPO._store' ).openCursor(bound).onsuccess = function (event) {
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
					cursor.value.XPO.uid = cursor.value.XPO.uid * -1;
					
					objects.set(cursor.value.XPO.uid, cursor.value);
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
			var unsavedStore	= db.transaction('XPO.unsaved').objectStore('XPO.unsaved'),
				// this function takes in a -ve uid but turns it +ve
				bound			= IDBKeyRange.only( uid * -1 ),
				objects			= $.array();

			unsavedStore.index( 'XPO.uid' ).openCursor(bound).onsuccess = function (event) {
				var cursor = event.target.result;
				if (cursor) {
					cursor.value.XPO.uid = cursor.value.XPO.uid * -1;
					
					objects.set(cursor.value.XPO.uid, cursor.value);
					cursor.continue();
				} else {
					typeof callback === 'function' && callback(objects);
				}
			};
		},
		getallpending: function (store, callback) {
//			$.log.s( 'offline.getall', store.join(' ') );
			
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
						offline._getallpending(store[i], function (objects) {
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
				offline._getallpending(store, callback);
			}
		},
		getall: function (store, options, callback) {
//			$.log.s( 'offline.getall', store.join(' ') );
			
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
						offline._getall(store[i], options, function (objects, ignore, unsaved) {
							if (objects.length || unsaved.length) {
								if (options.XPO.filter
								&&	options.XPO.filter.XPO.pending
								&&	store[i].endsWith('_XPO.archive')) {
									store[i] = store[i].slice(0, -'_XPO.archive'.length);
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
				offline._getall(store, options, callback);
			}
		},
		/*
		 * objects is a $.array
		 * */ 
		set: function (store, objects, callback) {
			/*
			 * this is need because if there are no objects present, the transaction
			 * is not even initiated, so there's no oncomplete event lol
			 * best to just return alongside callback
			 * */
			if (objects.length === 0) {
				typeof callback === 'function' && callback();
				return;
			}
			
			var stores		= [store, 'XPO.unsaved'];
			var transaction = db.transaction(stores, 'readwrite');
			
			// Do something when all the data is added to the database.
			transaction.oncomplete = function(event) {
//				$.log.s("offline.set.oncomplete");
				typeof callback === 'function' && callback(event.target.result);
			};

			var objectStore		= transaction.objectStore(store);
			var unsavedStore	= transaction.objectStore('XPO.unsaved');
			objects.each(function(obj) {
				/*
				 * idb spec f'd up again by not allowing boolean indexes
				 * so true is 1 and false is 0 *facepalm*
				 * */
				if (obj.XPO.pending === true) obj.XPO.pending = 1;
				if (obj.XPO.pending === false) obj.XPO.pending = 0;

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
				 * 		assing _store = real store
				 * 		check if there's a record with the same uid present
				 * 		override the old obj with new obj props
				 * 		store to the unsaved store
				 * 
				 * case: both saved server side and offline
				 * has a +ve uid
				 * idea: just save to the real store
				 * */
				
				// just saved on the server
				if (obj.XPO.uid > 0 && obj.XPO.ruid < 0) {
					unsavedStore.delete( obj.XPO.ruid * -1 ).onsuccess = function () {
						delete obj.XPO.ruid;
						delete obj.XPO._store;
						objectStore.put(obj);
					};
				}
				// only saving if offline
				else if (obj.XPO.uid < 0 && obj.XPO.ruid === undefined) {
					// since idb doesn't allow looping over neg uids
					obj.XPO.uid = obj.XPO.uid * -1;
					obj.XPO._store = store;
					
					unsavedStore.get(obj.XPO.uid || 0).onsuccess = function(event) {
						var oldobj = event.target.result;
						if (oldobj) {
							oldobj = Object.assign(oldobj, obj);
							obj = oldobj;
						}
						
						unsavedStore.put(obj);
					};
				// real saved item
				} else {
					objectStore.get(obj.XPO.uid || 0).onsuccess = function(event) {
						var oldobj = event.target.result;

						if (oldobj) {
							oldobj = Object.assign(oldobj, obj);
							obj = oldobj;
						} else {
							if (obj.XPO.pending === false
							||	obj.XPO.pending === undefined
							||	obj.XPO.pending === null)
								obj.XPO.pending = 0;
						}

						objectStore.put(obj);
					};
				}
				
			});
		},
		pop: function (store, uid, callback) {
			if (uid < 0) {
				store = 'XPO.unsaved';
				uid = uid * -1;
			}
			
			db.transaction(store, 'readwrite').objectStore(store).delete(uid)
				.onsuccess = function(event) {
					typeof callback === 'function' && callback(event.target.result);
				};
		},
		/*
		 * objects is a $.array
		 * */
		popall: function (store, objects, callback) {
			var transaction = db.transaction(store, 'readwrite');
			
			// Do something when all the data is added to the database.
			transaction.oncomplete = function(event) {
//				$.log.s("all popped!");
				typeof callback === 'function' && callback(event.target.result);
			};

			var objectStore = transaction.objectStore(store);
			objects.each(function(obj) {
				var request = objectStore.delete(obj.XPO.uid);
				request.onsuccess = function(event) {
//					$.log.s( event.target.result );
				};
			});
		},
		allstores: function () {
//			$.log.s( 'offline.allstores' );
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
				offline.init(callback);
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
			/*
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
			dom.setloading( 'XPO.appneedsreload' );
		},
		init: function (callback, options) {
			Hooks.run('XPO.offlineinit', null);

			options = options || {};
			
			offline.addstore('XPO.unsaved', ['XPO._store', 'XPO.alias']);
			
			var request = indexedDB.open(database, options.version || BUILDNUMBER);
			request.onerror = function(event) {
//				$.log.s( 'offline.init.onerror', event );
				if (event.target.error.name === 'VersionError') {
					location.reload();
					// should we notify the user before hand and timeout?
				}
			};
			request.onupgradeneeded = function(event) {
//				$.log.s( 'offline.init.onupgradeneeded' );
				
				db = event.target.result;
				
				offline.allstores().forEach(function (name) {
//					$.log.s( 'del', name );
					db.deleteObjectStore(name);
				});
				
				offline._stores.forEach(function (store) {
					var name = store.name;
//					$.log.s( 'del', name );
					if ( db.objectStoreNames.contains(name) )
						db.deleteObjectStore(name);

					offline._createstore(name, store.keys);
				});
			};
			request.onsuccess = function(event) {
//				$.log.s( 'offline.init.onsuccess' );

				db = event.target.result;
				if (!options.nowarn) {
					db.onversionchange = offline.warning;
				}
				
				offline.states = true;

				Hooks.run('XPO.offlineready', null);
				typeof callback === 'function' && callback(db);
			};

			return request;
		}
	};
	
	Offline = offline;
	
})();
