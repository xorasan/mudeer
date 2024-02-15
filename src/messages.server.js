var Messages, messages,
	tbl_rsl = 'messages',
	musicmetadata = require('./deps/music-metadata');
//	codecparser = require('./deps/codec-parser').default;

;(function(){
'use strict';
var module_name = 'messages';
Messages = messages = {
	text2seconds: function (text) { // secs
		var c = text.length;
		return Math.ceil( c / 6 ) || 1;
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
		var outcome = await MongoDB.purge(Config.database.name, tbl_rsl, { room });
		
		return outcome.count;
	},
};
Network.intercept(module_name, async function (response) {
	if (response.account) {
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
	if (response.account) {
		var arr = [],
			limit = 100;

//		$.log( response.value );

		MongoDB.query(Config.database.name, tbl_rsl, {
			room: response.value.filter.room,
		}, function (outcome) {
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
Network.upload(module_name, 'photo', function (response) {
	var value = response.value, marfoo3 = response.marfoo3, duration = 3;

	if (!response.account) { response.finish(); return; } // not signed in
	// TODO whats value
	if (!isnum(value) || value < 1 || !marfoo3) { response.finish(); return; } // received nothing
	
	var filesize = Math.ceil(marfoo3.size/1024); // x.x kB
	if (filesize > 150) { response.upload(0).finish(); return; } // size too big
	
	duration = filesize;
	// TODO fix the rows.get BS
	MongoDB.query(Config.database.name, tbl_mklmt, {
		uid: { $in: [value] }
	}, function (rows) {
		if (rows.length) {
			var mklmh = rows.get(value);
			var ct = get_time_now(), yr = new Date().getFullYear();
			var zaad = [], txrt = {};
			if (mklmh) {
				if (Rooms.are_both_members(mklmh, response.account.uid)) {
					var o = {
						room:		value,
						kind:		2,
						owner:		response.account.uid,
						updated:	ct,
					};
					// m3 is linked between nashar<-->xaadim
//					Files.set.folder('m3');
					Files.set.folder('m3/'+yr);
					Files.set.folder('m3/'+yr+'/'+value);
					o.text = 'm3/'+yr+'/'+value+'/'+ct+'.jpg';
					marfoo3.mv(o.text, function (a) {
						$.log('photo move result', a);
					});
					zaad.push(o);
				}
			}
			if (zaad.length)
			MongoDB.set(Config.database.name, tbl_rsl, zaad, function (outcome) {
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
						kind:		2,
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
			else
			response.upload(0).consumed();
			
		} else response.upload(0).consumed();
	});
});
Network.upload(module_name, 'sawt', function (response) {
	var value = response.value, marfoo3 = response.marfoo3;

	if (!response.account) { response.finish(); return; } // not signed in
	if (!isnum(value) || value < 1 || !marfoo3) { response.finish(); return; } // received nothing
	
	var filesize = Math.ceil(marfoo3.size/1024); // x.x kB
	if (filesize > 80) { response.upload(0).finish(); return; } // size too big

//	$.log( value, marfoo3 );
	musicmetadata.parseBuffer(response.marfoo3.data, 0, {
		duration: true,
	}).then(function (d) {
		var duration = d.format.duration; // x.x secs
		duration = Math.max(duration, filesize);
		if (!isnum(duration)) duration = filesize;
		MongoDB.query(Config.database.name, tbl_mklmt, {
			uid: { $in: [value] }
		}, function (rows) {
			if (rows.length) {
				var mklmh = rows.get(value);
				var ct = get_time_now(), yr = new Date().getFullYear();
				var zaad = [], txrt = {};
				if (mklmh) {
					if (Rooms.are_both_members(mklmh, response.account.uid)) {
						var o = {
							room:		value,
							kind:		1,
							owner:		response.account.uid,
							updated:	ct,
						};
						Files.set.folder('m3');
						Files.set.folder('m3/'+yr);
						Files.set.folder('m3/'+yr+'/'+value);
						o.text = 'm3/'+yr+'/'+value+'/'+ct+'.webm';
						marfoo3.mv(o.text, function (a) {
//							$.log('move reseult', a);
						});
						zaad.push(o);
					}
				}
				if (zaad.length)
				MongoDB.set(Config.database.name, tbl_rsl, zaad, function (outcome) {
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
							room:	m,
							kind:		1,
							address:		item.text,
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
				else
				response.upload(0).consumed();
				
			} else response.upload(0).consumed();
		});
	});
});
Network.sync(module_name, async function (response) {
//	$.log( 'messages', '', response.value );
	var value = response.value;
	
	if (!response.account) { response.finish(); return; } // not signed in
	if (!value) { response.finish(); return; } // received nothing

	var room_uids = [];
	value.forEach(function (item) {
		if (item.uid && item.room)
			room_uids.push(item.room);
	});
	var outcome = await MongoDB.query(Config.database.name, 'rooms', {
		uid: { $in: room_uids },
	});
	var rows = outcome.rows;
//	$.log( rows );
	rows = $.array(rows, 'uid');
	if (rows.length) {
		var zaad = [], pops = [], txrt = {};
		var ct = get_time_now();
		var rooms_to_update = {};
		value.forEach(function (item) {
			var m = item.room, room = rows.get(m);
			if (item.uid && room) {
//				if (Rooms.are_both_members(mklmh, response.account.uid)) {
					var o = {
						uid:			item.uid,
						room:			item.room,
						kind:			0,
						updated:		ct,
					};
					if (item.remove) {
						o.remove = ct;
					} else {
						o.text = parsestring(item.text, 480);
						o.owner = response.account.uid;
					}
					rooms_to_update[item.room] = 1;
					zaad.push(o);
//				} else
//				pops.push({
//					uid:			item.uid,
//					remove:			-1,
//				});
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
	} else {
		var zaad = [];
		value.forEach(function (item) {
			if (item.uid)
			zaad.push({
				uid:			item.uid,
				remove:			-1,
			});
		});
		response.sync(zaad).finish();
	}
});

})();






