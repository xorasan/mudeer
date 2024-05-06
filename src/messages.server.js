var Messages, messages,
	tbl_rsl = 'messages',
	musicmetadata = require('./deps/music-metadata');
//	codecparser = require('./deps/codec-parser').default;

;(function(){
'use strict';
var module_name = 'messages';
Messages = messages = {
	get_audio_duration: async function (data) {
		var resolve;
		var promise = new Promise(function (r) {
			resolve = r;
		});
		musicmetadata.parseBuffer(data, 0, {
			duration: true,
		}).then(function (d) {
			var duration = d.format.duration; // x.x secs
			resolve(duration);
		});
		return promise;
	},
	text2seconds: function (text) { // secs
		var c = text.length;
		return Math.ceil( c / 6 ) || 1;
	},
	export_message: function ({ uid, ruid, room, owner, kind, text, size, remove, condition, created, updated }) {
		var address;
		if ([1, 2].includes(kind)) {
			address = text;
			text = undefined;
		}

		var message = { uid, ruid, room, owner, kind, address, text, size, remove, condition, created, updated };
		return message;
	},
	get_recent_in_room: async function (room, time, limit) {
		var out_rows = [];
		await MongoDB.query(Config.database.name, tbl_rsl, {
			room,
			$sort: { created: -1 },
			$limit: limit,
			$or: [ { updated: { $gte: time || 0 } }, { created: { $gte: time || 0 } } ]
		}, function ({ rows }) {
			rows.sort(function (a, b) {
				return a.created - b.created;
			});

			out_rows = rows;
		});
		
		out_rows = out_rows.map(function (message) {
			return Messages.export_message( message );
		});
		
		return out_rows;
	},
	get_count_in_room: async function (room) {
		var out_count = 0;
		await MongoDB.count(Config.database.name, tbl_rsl, {
			room
		}, function ({ count }) {
//			$.log( 'Messages get_count_in_room', room, count );
			out_count = count;
		});
		
		return out_count;
	},
	remove_all_in_room: async function (room) {
		var existing_messages = await MongoDB.query(Config.database.name, 'messages', {
			room,
			kind: { $in: [1, 2] }, // voice or photo
		});
		$.log( 'media in room', room );
		existing_messages.rows.forEach(function (msg) {
			$.log( msg.text );
			Files.pop.file(msg.text, function () {
				$.log( 'removed', msg.text );
			});
		});

		var outcome = await MongoDB.purge(Config.database.name, tbl_rsl, { room });
		
		return outcome.count;
	},
};
Network.intercept(module_name, async function (response) { // DISABLED
	if (response.account && 1 == 0) { // DISABLED
		var out = [], limit = 100;

		// TODO limit to messages user has access to
//		MongoDB.query(Config.database.name, tbl_mklmt, {
//			members: new RegExp(' '+response.account.uid+':'),
//		}, function (mklmt) {
//			if (mklmt.rows.length) {
//				var mstr = [];
//				mklmt.rows.forEach(function (m) {
//					mstr.push(m.uid);
//				});
				await MongoDB.query(Config.database.name, 'pops', {
					ltable: module_name,
//					$sort: { _id: -1 },
//					$limit: 20, 
					// TODO save and get using room uid as well :)
					$or: [ { updated: { $gte: response.time || 0 } }, { created: { $gte: response.time || 0 } } ]
				}, function (pops) {
					pops.rows.forEach(function ({ luid }) {
						out.push({ uid: luid, remove: -1 }); // purged completely
					});
				});
				await MongoDB.query(Config.database.name, tbl_rsl, {
//					room: { $in: mstr },
					$or: [ { updated: { $gte: response.time || 0 } }, { created: { $gte: response.time || 0 } } ]
				}, function ({ rows }) {
					rows.forEach(function (o, i) {
						var x = {};
						x.uid			= o.uid;
						x.room			= o.room;
						x.owner			= o.owner;
						x.kind			= o.kind || 0;
						if ([1, 2].includes(x.kind)) x.address = o.text;
						else x.text = o.text;
						x.remove		= o.remove;
						x.condition		= o.condition;
						x.created		= o.created;
						x.updated		= o.updated;
						out.push( x );
					});
				});

				if (out.length) response.sync(out).consumed();
				else response.finish();
//			} else response.finish();
//		});
	} else response.finish();
});
Network.get(module_name, function (response) {
	if (response.account && response.value && response.value.filter) {
		var arr = [],
			limit = 100;

		var filter = response.value.filter;
		var refined_filter = {};
		if (filter.uid) refined_filter.uid = filter.uid;
		if (filter.room) refined_filter.room = filter.room;

		MongoDB.query(Config.database.name, tbl_rsl, refined_filter, function (outcome) {
			outcome.rows.forEach(function (o, i) {
				var x = {};
				x.uid			= o.uid;
				x.room			= o.room;
				x.owner			= o.owner;
				x.kind			= o.kind || 0;
				if ([1, 2].includes(x.kind)) x.address = o.text;
				else x.text = o.text;
				x.remove		= o.remove;
				x.condition		= o.condition;
				x.created		= o.created;
				x.updated		= o.updated;
				arr.push( x );
			});
			response.get(arr).consumed();
		});
	} else response.finish();
});
Network.upload(module_name, 'photo', async function (response) {
	var value = response.value, // room
		payload = response.payload, duration = 3;

	$.log( module_name, 'photo upload in room', value, payload ? payload.size : '' );

	if (!response.account) {
		$.log( 'photo upload needs sign in' );
		response.finish(); return;
	} // not signed in
	if (!payload) {
		$.log( 'photo upload invalid' );
		response.finish(); return;
	} // received nothing
	
	var filesize = Math.ceil(payload.size/1024); // x.x kB
	if (filesize > 350) {
		$.log( 'photo size too big' );
		response.upload(0).finish(); return;
	} // size too big
	
	duration = filesize;

	var room = await MongoDB.get(Config.database.name, tbl_mklmt, { uid: value });
	if (!room) {
		$.log( 'photo upload, room not found' );
		response.upload(0).consumed(); return;
	} // room not found
	
	$.log( 'photo upload, room found', room.name || room.link );

	var ct = get_time_now(), yr = new Date().getFullYear();
	var txrt = {};
	var zaad = {
		room:		value,
		kind:		2,
		size:		filesize,
		owner:		response.account.uid,
		updated:	ct,
	};
	// media is linked between nashar<-->xaadim
	Files.set.folder('media');
	Files.set.folder('media/'+yr);
	Files.set.folder('media/'+yr+'/'+value);
	zaad.text = 'media/'+yr+'/'+value+'/'+ct+'.jpg';
	payload.mv(zaad.text, function (a) {
		$.log('photo move result', a);
	});

	$.log( 'photo upload, add message', zaad );
	
	var outcome = await MongoDB.set(Config.database.name, tbl_rsl, zaad);
	
	$.log( 'photo upload, added message', outcome );
	
	var nataaij = [];
	outcome.rows.forEach(function (item) {
		var m = item.room, txr;
		if (!item.remove) txr = Rooms.slow_mode(m, duration);
		txrt[ m ] = {
			uid:			m,
			delay:			txr,
		};
		var o = {
			uid:		item.uid,
			ruid:		item.ruid,
			room:		m,
			kind:		2,
			address:	item.text,
			size:		item.size,
			remove:		item.remove,
			owner:		item.owner,
			created:	item.created,
			updated:	item.updated,
		};
		if (item.remove) {
			// maybe get rid of text ?
		}
		nataaij.push(o);
	});

	await Rooms.update_room_by_uid( room.uid, response.account.uid );

	response.need('delay').get(Object.values(txrt));
	response.need('default').sync(nataaij);
	response.upload(1).consumed();

	Polling.finish(); // TODO optimize
});
Network.upload(module_name, 'audio', async function (response) {
	var value = response.value, payload = response.payload;

	$.log( module_name, 'audio upload in room', value, payload ? payload.size : '' );

	if (!response.account) {
		$.log( 'audio upload needs sign in' );
		response.finish(); return;
	} // not signed in
	if (!payload) {
		$.log( 'audio upload invalid' );
		response.finish(); return;
	} // received nothing
	
	var filesize = Math.ceil(payload.size/1024); // x.x kB
	if (filesize > 350) {
		$.log( 'audio size too big' );
		response.upload(0).finish(); return;
	} // size too big

	var room = await MongoDB.get(Config.database.name, tbl_mklmt, { uid: value });
	if (!room) {
		$.log( 'audio upload, room not found' );
		response.upload(0).consumed(); return;
	} // room not found
	
//	if (Rooms.are_both_members(mklmh, response.account.uid)) // TODO exit

	$.log( 'audio upload, room found', room.name || room.link );

	var duration = await Messages.get_audio_duration( response.payload.data );
	duration = Math.max(duration, filesize);
	if (!isnum(duration)) duration = filesize;

	var ct = get_time_now(), yr = new Date().getFullYear();
	var txrt = {};
	var o = {
		room:		value,
		kind:		1,
		owner:		response.account.uid,
		updated:	ct,
	};
	Files.set.folder('media');
	Files.set.folder('media/'+yr);
	Files.set.folder('media/'+yr+'/'+value);
	o.text = 'media/'+yr+'/'+value+'/'+ct+'.webm';
	payload.mv(o.text, function (a) {
		$.log('move reseult', a);
	});
	var outcome = await MongoDB.set(Config.database.name, tbl_rsl, [o]);
	var nataaij = [];
	outcome.rows.forEach(function (item) {
		var m = item.room;
		if (!item.remove)
		var txr = Rooms.slow_mode(m, duration);
		txrt[ m ] = {
			uid:			m,
			delay:			txr,
		};
		var o = {
			uid:		item.uid,
			ruid:		item.ruid,
			room:		m,
			kind:		1,
			address:	item.text,
			remove:		item.remove,
			owner:		item.owner,
			created:	item.created,
			updated:	item.updated,
		};
		if (item.remove) {
			// maybe get rid of text ?
		}
		nataaij.push(o);
	});
	response.need('delay').get(Object.values(txrt));
	response.need('default').sync(nataaij);
	response.upload(1).consumed();
});
Network.sync(module_name, async function (response) {
//	$.log( 'messages', '', response.value );
	var value = response.value;

	if (!response.account) { response.finish(); return; } // not signed in
	if (!value) { response.finish(); return; } // received nothing

	var room_uids = [], msg_uids = [];
	value.forEach(function (item) {
		if (item.uid && item.room) {
			room_uids.push(item.room);
			
			msg_uids.push(item.uid);
		}
	});
	var outcome = await MongoDB.query(Config.database.name, 'rooms', {
		uid: { $in: room_uids },
	});
	var rows = outcome.rows;
	rows = $.array(rows, 'uid');
	if (rows.length == 0) {
		var zaad = [];
		value.forEach(function (item) {
			if (item.uid)
			zaad.push({
				uid:			item.uid,
				remove:			-1,
			});
		});
		response.sync(zaad).finish();
		return;
	}

	var zaad = [], pops = [], txrt = {};
	var ct = get_time_now();
	var rooms_to_update = {};

	var existing_messages = await MongoDB.query(Config.database.name, 'messages', {
		uid: { $in: msg_uids },
	});
	existing_messages = $.array(existing_messages.rows, 'uid');

	value.forEach(function (item) {
		var m = item.room, room = rows.get(m);
		if (item.uid && room) {
//			if (Rooms.are_both_members(mklmh, response.account.uid)) {
				var o = {
					uid:			item.uid,
					room:			item.room,
					// TODO once photos/voice uses this path, this will have to change
					kind:			0,
					updated:		ct,
				};
				var msg = existing_messages.get( item.uid );
				if (msg) {
					o.kind = msg.kind;
				}

				if (item.remove) {
					o.remove = ct;
					if ( msg && [1, 2].includes(msg.kind) ) { // voice or photo
						Files.pop.file(msg.text, function () {
							$.log( 'removed', msg.text );
						});
					}
				} else {
					o.text = parsestring(item.text, 4096);
					o.owner = response.account.uid;
				}
				rooms_to_update[item.room] = 1;
				zaad.push(o);
//			} else
//			pops.push({
//				uid:			item.uid,
//				remove:			-1,
//			});
		}
	});

	for (var room_uid in rooms_to_update) {
		await Rooms.update_room_by_uid( room_uid, response.account.uid );
	}

	if (zaad.length) {
		var outcome = await MongoDB.set(Config.database.name, tbl_rsl, zaad);
		var nataaij = [];

		outcome.rows.forEach(function (item) {
			var m = item.room, txr;
			if (!item.remove) {
				var txr = Rooms.slow_mode(m, Messages.text2seconds(item.text));
				txrt[ m ] = {
					uid:			m,
					delay:			txr,
				};
			}
			var o = {
				uid:		item.uid,
				ruid:		item.ruid,
				room:		m,
				text:		item.text,
				kind:		item.kind,
				remove:		item.remove,
				owner:		item.owner,
				created:	item.created,
				updated:	item.updated,
			};
			if (item.remove) {
				// maybe get rid of text ?
			}
			nataaij.push(o);
		});

		Polling.finish();
		response.need('delay').get(Object.values(txrt));
		response.sync(nataaij.concat(pops)).finish();
	} else {
		response.sync(pops).finish();
	}
});

Network.get(module_name, 'range', async function (response) {
	var value = response.value, start = 0, end = 25, outcome, out = [];
	if (value) {
		start = value.start;
		end = value.end;
		var room = value.room;
		if (end > start) {
			outcome = await MongoDB.query(Config.database.name, tbl_rsl, {
				room,
				$sort: { created: -1 },
				$skip: start,
				$limit: end-start,
			});
		}
		if (outcome) {
			outcome.rows.forEach(function (o) {
				out.push(Messages.export_message(o));
			});
		}
	}
	response.get(out).finish();
});
Network.get(module_name, 'count', async function (response) {
	var room;
	if (response.value) {
		room = response.value.room;
	}
	var outcome = await MongoDB.count(Config.database.name, tbl_rsl, {
		room,
	});
	response.get(outcome.count).finish();
});

})();






