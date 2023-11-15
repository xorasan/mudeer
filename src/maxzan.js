/*
 * TODO make maxzan.list to add maxzan functionality to lists
 * this will include auto saving changes to the list adapter to maxzan stores
 * */
//+ version warning musta3id ism haajah mfateeh nazzaf ruid waqt taxeer
//+ kaleedqadr
var maxzan;
;(function(){
	'use strict';
	var database	= 'db', db = false, maxaazin = {},
		unsavedism = 'XPO.unsaved'+'XPO.xarq',
		exclusions	= [unsavedism],
		taxeerxarq = 30*1000,
		gcallback;

	var ajraa = function (callback) {
		// get pending items from all offline stores
		maxzan.getall( maxzan.allstores(), {
			XPO.filter: {
				XPO.pending: 1,
			},
			// helps only keep relevant props for network transport
			XPO.format: true,
		}, function (iqsaam) {
			for (var i in iqsaam) {
				var m = maxaazin[i];
				var ashyaa = iqsaam[i], ixraaj = 0;
				if (m.kaleedqadr) { // limit to { kaleed: qadr, ... }
					ixraaj = {};
					for (var j in ashyaa) {
						var uid = ashyaa[j].uid;
						delete ashyaa[j].uid;
						delete ashyaa[j].created;
						delete ashyaa[j].updated;
						ixraaj[ uid ] = ashyaa[j].qadr;
					}
				}
				/*else if (ashyaa.havaf) {
					ashyaa = {
						uid: ashyaa.uid,
						havaf: 1,
					};
				}*/
				shabakah.waaqat(m.ism, m.haajah, ixraaj || ashyaa);
			}
		});
	};
	var ijtama3 = function (callback) {
		$.taxeer('XPO.maxzanajraa', function () {
			ajraa();
		}, 3000);
	};
	var createstores = function () {
		var request = indexedDB.open(database, BUILDNUMBER);
		request.onerror = function(event) {
//			$.log.s( 'maxzan.badaa.onerror', event );
			if (event.target.error.name === 'VersionError') {
				/* delete the old database even if the version number is bigger
				 * recreate() calls badaa() which calls ixtalaq() which calls
				 * createstores()
				 * */
				maxzan.recreate();
			} else {
//				$.log.e( event.target.error );
			}
		};
		request.onupgradeneeded = function(event) {
//			$.log.s( 'maxzan.badaa.onupgradeneeded' );
			
			db = event.target.result;
			
			maxzan.allstores().forEach(function (name) {
//				$.log.s( 'del', name );
				db.deleteObjectStore(name);
			});
			
			Object.values(maxaazin).forEach(function (store) {
				store.waqt = 0; // reset axav time
				var name = store.ism+store.haajah;
//				$.log.s( 'del', name );
				if ( db.objectStoreNames.contains(name) )
					db.deleteObjectStore(name);

				maxzan._createstore(name, store.mfateeh);
			});
		};
		request.onsuccess = function(event) {
//			$.log( 'maxzan.badaa.onsuccess' );

			db = event.target.result;
			db.onversionchange = maxzan.warning;
			
			maxzan.musta3id = 1;
			
			if (gcallback) {
				gcallback();
				gcallback = 0;
			} else {
				Hooks.run('XPO.maxzanmusta3id', 1);
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
	 * maxzan storage and adapter in one
	 * auto manages database versioning
	 * */
	maxzan = {
		ruid: function () {
			var ruid = parseInt( preferences.get(3) || -1 );
			preferences.set(3, ruid - 1);
			return (ruid - 1);
		},
		mundarij: {
			adaaf: {},
			havaf: {},
			axav: {},
		},
		musta3id: false,
		jawaab: {
			adaaf: function (ism, haajah, cb) {
				if (typeof haajah == 'function') cb = haajah, haajah = 0;
				haajah = haajah || 'XPO.xarq';
				maxzan.mundarij.adaaf[ ism ] = maxzan.mundarij.adaaf[ ism ] || {};
				maxzan.mundarij.adaaf[ ism ][ haajah ] = cb;
			},
			havaf: function (ism, haajah, cb) {
				if (typeof haajah == 'function') cb = haajah, haajah = 0;
				haajah = haajah || 'XPO.xarq';
				maxzan.mundarij.havaf[ ism ] = maxzan.mundarij.havaf[ ism ] || {};
				maxzan.mundarij.havaf[ ism ][ haajah ] = cb;
			},
			axav: function (ism, haajah, cb) {
				/* WHY use cases
				 * when you want to axav something from the server using maxzan
				 * maxzan handles everything, eg the .axav jawaab from xaadim
				 * it adds a listener to shabakah.axav as well for your juzw
				 * so your juzw.xaadim can jawaab using both axav & waaqat
				 * */

				if (typeof haajah == 'function') cb = haajah, haajah = 0;
				haajah = haajah || 'XPO.xarq';
				maxzan.mundarij.axav[ ism ] = maxzan.mundarij.axav[ ism ] || {};
				maxzan.mundarij.axav[ ism ][ haajah ] = cb;

				shabakah.jawaab.axav(ism, haajah, function (jawaab) {
					cb( shallowcopy(jawaab) );

					var store = maxaazin[ism+haajah];
					if (store) store.waqt = helpers.now();
					maxzan.hifz(ism, haajah, jawaab);
				});
			},
		},
		adaaf: function (ism, haajah, qadr) {
			if (arguments.length === 2) qadr = haajah, haajah = 0;
			haajah = haajah || 'XPO.xarq';
			if (!(qadr instanceof Array)) qadr = [qadr];
			if (qadr instanceof Array) {
				maxzan.set(ism+haajah, qadr, function (needssync) {
					var m = maxaazin[ ism+haajah ];
					if (m.kaleedqadr) {
						var qism = maxzan.mundarij.axav;
						if (qism[ism] && typeof qism[ism][haajah] == 'function')
							qism[ism][haajah]( shallowcopy(qadr) );
					}
					if (needssync) ijtama3();
				});
			}
		},
		havaf: function (ism, haajah, qadr) { // [ { uid }, { uid } ]
			if (arguments.length === 2) qadr = haajah, haajah = 0;
			haajah = haajah || 'XPO.xarq';
			if (!(qadr instanceof Array)) qadr = [qadr];
			if (qadr instanceof Array) {
				qadr.forEach(function (item) {
					item.pending = 1;
					item.havaf = 1;
				});
				maxzan.set(ism+haajah, qadr, function (needssync) {
					var m = maxaazin[ ism+haajah ];
					if (m.kaleedqadr) {
						var qism = maxzan.mundarij.axav;
						if (qism[ism] && typeof qism[ism][haajah] == 'function')
							qism[ism][haajah]( shallowcopy(qadr) );
					}
					if (needssync) ijtama3();
				});
			}
		},
		ixtalaq: function (ism, haajah, o) { // create store
			o = o || {};
			o.taxeer = o.taxeer || undefined;
			o.nazzaf = o.nazzaf || undefined;
			o.mfateeh = o.mfateeh || [];
			haajah = haajah || 'XPO.xarq';
			/* BUGFIX
			 * i think there's a bug in indexdb implementation that forced me
			 * to redefine this or maybe i'm mistaken in my understanding
			 * but it was triggering errors without this index saying it doesn't
			 * exist, i thought keyPath auto gens the uid index as well
			 * maybe i misunderstood this concept
			 * */
			// indexes to search by date, all objects have these props
			['XPO.uid', 'XPO.created', 'XPO.updated', 'XPO.pending'].forEach(function (v) {
				if (!o.mfateeh.includes(v)) o.mfateeh.push(v);
			});
			maxaazin[ ism+haajah ] = {
				ism:		ism,
				haajah:		haajah,
				mfateeh:	o.mfateeh,
				nazzaf:		o.nazzaf,
				taxeer:		o.taxeer,
				tashkeel:	o.tashkeel,
				kaleedqadr: o.kaleedqadr,
			};
			$.taxeer('XPO.maxzanbadaa', function () {
				createstores();
			}, 250);
		},
		axav: function (ism, haajah, qadr, waqt) {
			haajah = haajah || 'XPO.xarq';
			/*
			 * it gets all first from maxzan offline, if nothing is found
			 * then it tries online
			 * if waqt is provided, then it saves when online was fetched last
			 * */
			
			var expired = 0;
			if (waqt !== undefined) {
				var store = maxaazin[ism+haajah];
				if (store) {
					var taxeer = store.taxeer || taxeerxarq;
					if (taxeer !== -1) {
						store.waqt = store.waqt || helpers.now() - (taxeer*2);
						if (waqt - store.waqt > taxeer) expired = 1;
					}
				}
			}
			
			if (expired) {
				shabakah.axav(ism, haajah, qadr);
			} else {
				maxzan.getall(ism+haajah, qadr, function (jawaab) {
					var qism = maxzan.mundarij.axav;
					if (qism[ism] && isfun(qism[ism][haajah])) {
						qism[ism][haajah](jawaab.toNative());
					}
				});
			}
		},
		axavforun: function (ism, haajah, qadr, cb) {
			haajah = haajah || 'XPO.xarq';
			// simply gets from offline storage and return native array
			if (isfun(cb))
			maxzan.getall(ism+haajah, qadr, function (jawaab) {
				cb(jawaab.toNative());
			});
		},
		hifz: function (ism, haajah, qadr) { // save from shabakah.waaqat[ism][haajah] qadr
			for (var uid in qadr) {
				var val = qadr[uid], qism = maxzan.mundarij.adaaf;
				
				val.XPO.uid = val.XPO.uid || uid;

				val.XPO.pending = 0;
				if (val.havaf === -1) { // truly purged on both ends
					qism = maxzan.mundarij['XPO.havaf'];
					maxzan.pop(ism+haajah, val.XPO.uid);
					val = val.XPO.uid;
				} else {
					maxzan.set(ism+haajah, [val]);
				}

				if (qism[ism] && typeof qism[ism][haajah] == 'function') {
					qism[ism][haajah]( shallowcopy(val) );
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
		_createstore: function (name, keys) {
//			$.log.s( 'maxzan._createstore', name );

			var objectstore = db.createObjectStore(name, { keyPath: 'XPO.uid' });

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
					value[i] = maxzan.parsevalue(value[i] );
				}
			}
			
			return value;
		},
		/*
		 * this func is called on each obj before it is sent to shabakah uploads
		 * intro a maxzan.store.<name>.tashkeel func to override this
		 * */
		format: function (obj, store) {
			obj = obj || {};
			var newobj = {};
			
//			delete obj.XPO.photo;
			
//			if (obj.XPO.havaf && obj.XPO.uid > 0) {
//				newobj = {
//					XPO.uid: obj.XPO.uid,
//					XPO.havaf: obj.XPO.havaf,
//				};
//			} else {
				delete obj.XPO._store;
				delete obj.XPO.pending;

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
//			$.log.e( 'maxzan._getall', store );
			var objectStore		= db.transaction(store).objectStore(store),
				unsavedStore	= db.transaction(unsavedism).objectStore(unsavedism),
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
			
			// this will fuckup maxzan lists' page counts, test this
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
				options.only = maxzan.parsevalue( options.only );
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
							item = maxzan.format( cursor.value, store );

						objects.set(key, item);
					} else {
//						$.log.s( 'maxzan.getall', startat, i, key );
						if ( i >= startat && objects.length < extra.limit ) {
							var item = cursor.value;
							if (options.XPO.format)
								item = maxzan.format( cursor.value, store );

							objects.set(key, item);
						} else {
							if (bound)
								++filteredcount;
						}
					}
					++i;
					cursor.continue();
				} else {
					maxzan._getallpending(store, function (unsaved) {
						unsaved.each(function (item) {
							if (options.XPO.format)
								item = maxzan.format( item, store );
							
							return item;
						});
						
						var andfinally = function (objects) {
							/* 
							 * pre-sorting for perm lists && pre-filtering
							 * */
							if (options.perm) {
								objects.sort(options.reversed || 0, (options.orderby || 'XPO.uid'), 'XPO.uid');
								if (typeof options.XPO.multifilter === 'object' && Object.keys(options.XPO.multifilter).length)
									objects = maxzan.filter(options.XPO.multifilter, objects);
							}

							if (extra.limit === true) {
								extra.count = objects.length;
								extra.pages = false;
								typeof callback === 'function' && callback(objects, extra, unsaved);
							} else {
								maxzan.count(store, function (count) {
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
			var unsavedStore	= db.transaction(unsavedism).objectStore(unsavedism),
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
			var unsavedStore	= db.transaction(unsavedism).objectStore(unsavedism),
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
//			$.log.s( 'maxzan.getall', store.join(' ') );
			
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
						maxzan._getallpending(store[i], function (objects) {
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
				maxzan._getallpending(store, callback);
			}
		},
		getall: function (store, options, callback) {
//			$.log.s( 'maxzan.getall', store.join(' ') );
			
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
						maxzan._getall(store[i], options, function (objects, ignore, unsaved) {
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
				maxzan._getall(store, options, callback);
			}
		},
		/*
		 * objects is a $.array
		 * */ 
		set: function (store, arr, callback) {
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
			var stores		= [store, unsavedism];
			var transaction = db.transaction(stores, 'readwrite');
			
			// do something when all the data is added to the database.
			transaction.oncomplete = function(event) {
//				$.log.s("maxzan.set.oncomplete");
				typeof callback === 'function' && callback(needssync);
			};

			var objectStore		= transaction.objectStore(store);
			var unsavedStore	= transaction.objectStore(unsavedism);
			arr.forEach(function(obj) {
				/*
				 * idb spec f'd up again by not allowing boolean indexes
				 * so true is 1 and false is 0 *facepalm*
				 * */
				if (obj.XPO.pending === true) obj.XPO.pending = 1;
				if (obj.XPO.pending === false) obj.XPO.pending = 0;
				if (obj.XPO.uid < 0 || obj.XPO.pending) needssync = 1;

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
						
						fillmissingkeys(store, obj);
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
						
						fillmissingkeys(unsavedism, obj);
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

						fillmissingkeys(store, obj);
						objectStore.put(obj);
					};
				}
				
			});
		},
		pop: function (store, uid, callback) {
			if (uid < 0) {
				store = unsavedism;
				uid = uid * -1;
			}
			
			db.transaction(store, 'readwrite').objectStore(store).delete(uid)
				.onsuccess = function(event) {
					typeof callback === 'function' && callback(event.target.result);
				};
		},
		popall: function (store, arr, callback) {
			var stores			= [store, unsavedism];
			var transaction 	= db.transaction(stores, 'readwrite');
			var objectStore		= transaction.objectStore(store);
			var unsavedStore	= transaction.objectStore(unsavedism);
			
			// Do something when all the data is added to the database.
			transaction.oncomplete = function(event) {
//				$.log.s("all popped!");
				typeof callback === 'function' && callback();
			};

			var objectStore = transaction.objectStore(store);
			arr.forEach(function(obj) {
				if (obj.XPO.uid < 0) unsavedStore.delete(obj.XPO.uid * -1);
				else objectStore.delete(obj.XPO.uid);
			});
		},
		allstores: function () {
//			$.log.s( 'maxzan.allstores' );
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
				maxzan.badaa(callback);
			};
			/*request.onblocked = function () {
				$.log.s( 'blocked' );
			};
			request.onerror = function () {
				$.log.s( 'error' );
			};*/
		},
		/*
		 * this should just rebadaa the database and reload the current page as
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
		badaa: function (callback) {
			gcallback = callback;
			maxzan.ixtalaq('XPO.unsaved', 'XPO.xarq', {
				mfateeh: ['XPO._store']
			});
		}
	};
	
	Hooks.set('XPO.jawaabwaaqat', function (payload) {
		for (var ism in payload) {
			for (var haajah in payload[ism]) {
				var qadr = payload[ism][haajah];
				maxzan.hifz(ism, haajah, qadr);
				
				var m = maxaazin[ ism+haajah ];
				if (m.kaleedqadr) {
					var qism = maxzan.mundarij.axav;
					if (qism[ism] && typeof qism[ism][haajah] == 'function')
						qism[ism][haajah]( shallowcopy(qadr) );
				}
			}
		}
	});
	Hooks.set('XPO.shabakahittasaal', function (yes) {
		if (yes)
		$.taxeer('XPO.maxzanwaaqat', function () {
			ijtama3();
		}, 250);
	});
})();
