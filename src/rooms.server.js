var Rooms, rooms,
	tbl_mklmt = 'rooms';

;(function(){
	'use strict';
	
	var maxba = {}; // uid: {}
	
	Rooms = rooms = {
		raakib: function (members) { // non-member profile
			if (isarr(members))
			for (var i = 0; i < members.length; ++i) {
				var v = members[i];
				if (v[1] !== 1) return v;
			}
		},
		is_other: function (members, suid) { // other profile
			if (isarr(members))
			for (var i = 0; i < members.length; ++i) {
				var v = members[i];
				if (v[0] !== suid) return v;
			}
		},
		is_you: function (members, suid) { // you
			if (isarr(members))
			for (var i = 0; i < members.length; ++i) {
				var v = members[i];
				if (v[0] === suid) return v;
			}
		},
		maxba: function (uid, k, v) {
			if (arguments.length === 0) return maxba;
			var m = maxba[uid];
			if (k && v && !m) m = maxba[uid] = {};
			if (m) {
				if (isundef(k)) { // remove from maxba
					delete maxba[uid];
				} else
				if (isundef(v)) {
					return m[k];
				} else {
					m[k] = v;
				}
			}
		},
		slow_mode: function (uid, caaniyaat) {
			var v = rooms.maxba(uid, 'slow_mode');
			var c = new Date().getTime();
			if (isundef(v) || v < c) v = c;

			v += caaniyaat*1000;

			rooms.maxba(uid, 'slow_mode', v);
			rooms.maxba(uid, 'updated', c);
			
			rooms.finish_all(uid);
			
			return v;
		},
		members: function (uid, members) {
			var v = rooms.maxba(uid, 'members');
			if (!areobjectsequal(v, members) && members) {
				rooms.maxba(uid, 'members', members);
				rooms.maxba(uid, 'updated', new Date().getTime());
				
				rooms.finish_all(uid);
			}
		},
		members_to_string: function (arr) {
			var str = '';
			arr.forEach(function (o) {
				str += ' '+o[0]+':'+o[1];
			});
			return str;
		},
		to_members: function (str) {
			var members = [];
			str.trim().split(' ').forEach(function (v) {
				v = intify(v.split(':'));
				members.push( [v[0], v[1]] );
			});
			return members;
		},
		is_member: function (room, uid, type) { // is3udw, type
			if (room) {
				if (isstr(room.members)) {
					if (room.members.match(' '+uid+':'+(type||'')))
						return 1;
				} else if (room.members) {
					if (room.members[uid]) {
						if (type) return room.members[uid] === type;
						else return 1;
					}
				}
			}
		},
		are_both_members: function (room, uid) { // ismaftooh
			if (room) {
				if (isstr(room.members)) {
					if (room.members.match(' '+uid+':1')
					&&	room.members.match(/\:1/g).length >= 2)
						return 1;
				} else if (room.members) {
					var v = Object.values(room.members);
					if (room.members[uid] === 1 && v[0] === 1 && v[1] === 1) {
						return 1;
					}
				}
			}
		},
		finish_all: function (uid) {
//			$.log( 'finish_all', uid  );
			$.slow_mode('mlkmtinahaa'+uid, function () {
				var v = rooms.maxba(uid, 'members');
//				$.log( 'finish_all ...', v );
				if (v) {
					v = Object.keys(v);
					if (v.length) {
						v = intify( v ); // [ int, int, ... ]
//						$.log( 'finish_all out', v );
						Polling.finish_all(v);
					}
				}
			}, 50);
		},
	};
})();
Network.intercept('rooms', function (response) {
	if (response.account) {
		var arr = [], objs = [], limit = 100, maxba = rooms.maxba(), yes;

		for (var i in maxba) {
			if (maxba[i].updated > response.time
			&& rooms.is_member(maxba[i], response.account.uid)) {
				objs[i] = {
					uid:		parseint(i),
					slow_mode:		maxba[i].slow_mode,
				};
				yes = 1;
			}
		}
		arr = Object.values(objs);
		MongoDB.query(Config.database.name, tbl_mklmt, {
			members: new RegExp(' '+response.account.uid+':'),
			updated: { $gt: response.time },
			// TODO limit
		}, function (outcome) {
			outcome.rows.forEach(function (o, i) {
				var x = objs[o.uid] || {}, members = [], membersobj = {};
				o.members.split(' ').forEach(function (v) {
					v = v.split(':');
					var a = parseint(v[0]),
						b = parseint(v[1]);
					if (isnum(a) && isnum(b)) {
						membersobj[ a ] = b;
						members.push([ a, b ]);
					}
				});
				rooms.members(o.uid, membersobj);
				x.uid			= o.uid;
				x.members		= members;
				x.created		= o.created;
				x.updated		= o.updated;
				objs[o.uid] = x;
			});
			arr = Object.values(objs);
			if (arr.length) response.sync(arr), yes = 1;
			if (yes) response.consumed(); else response.finish();
		});

	} else if (yes) response.consumed(); else response.finish();
});
Network.sync('rooms', function (response) {
	var value = response.value;
	
	if (!response.account) { response.finish(); return; } // not signed in
	if (!value) { response.finish(); return; } // received nothing
	
	if (isarr(value)) {
		var arr = [];
		value.forEach(function (item) {
			if (isnum(item.uid)) arr.push({ uid: item.uid });
		});
		MongoDB.query(Config.database.name, tbl_mklmt, {
			uid: { $in: arr }
		}, function (rows) {
			var suid = response.account.uid, ct = get_time_now(),
				riddah = [], mklmt = [], lihifz = [];
			value.forEach(function (item) {
				var m = parseint(item.uid), room = rows.get(m), members2 = item.members;
				if (isarr(members2) && room && rooms.is_member(room, suid)) {
					// judge where we are at already
					var members = rooms.to_members(room.members), yes = 1,
						is_other = rooms.is_other(members, suid),
						is_you = rooms.is_you(members, suid),
						is_other2 = rooms.is_other(members2, suid),
						is_you2 = rooms.is_you(members2, suid),
						o = {
							uid: m,
							created: room.created,
							updated: room.updated,
						},
						shayy = { uid: m, updated: ct };

					if (isarr(is_other) && isarr(is_you)) {
						// other has -3:blocked, you can't do anything
						// you have self -3:blocked, wanna unblock 0:stale
						// you're 0:stale, wanna -1:invite other and 1:member self
						// you have self -2:rejected, wanna accept 1:member
						// you're 1:member, another is -1:invited, nothing to do
						// you're -1:invited, another is 1:member, 1:accept, -2:reject, -3:block
						// else in any case you wanna self -3:block except other's -3

						if (is_other[1] === -3) {
							yes = 0;
						} else
						if (is_you[1] === -3) {
							if (is_you2[1] === 0) is_you[1] = 0;
							if (is_you2[1] === 1) {
								is_you[1] = 1;
								if (is_other[1] !== -2) {
									is_other[1] = -1;
									shayy.remove = ct;
								}
							}
						} else
						if ([-2, 0].includes(is_you[1])) {
							if (is_you2[1] === 1) {
								is_you[1] = 1;
								if (is_other[1] === 0) {
									is_other[1] = -1;
									shayy.remove = ct;
								}
							}
						} else
						if (is_you[1] === 0 && is_other[1] === 1) {
							if (is_you2[1] === 1) {
								is_you[1] = 1;
							}
						} else
						if (is_you[1] === -1 && is_other[1] === 1) {
							if (is_you2[1] === 1) {
								is_you[1] = 1;
							}
							if (is_you2[1] === -2) {
								is_you[1] = -2;
								shayy.remove = ct;
							}
							if (is_you2[1] === -3) {
								is_you[1] = -3;
							}
						}

						if (is_other[1] !== -3 && is_you2[1] === -3) {
							is_you[1] = -3;
							if (is_other[1] === -1) is_other[1] = 0;
						}
						
						if (yes) {
							var membersstr = rooms.members_to_string([is_you, is_other]);
							o.members = [is_you, is_other];
							shayy.members = membersstr;
							o.havaf = shayy.remove;
							mklmt.push(o);
							lihifz.push(shayy);
						}
					} else riddah.push(o);
				} else riddah.push({ uid: m, havaf: -1 });
			});
			MongoDB.set(Config.database.name, tbl_mklmt, lihifz, function (outcome) {
				response.sync(mklmt.concat(riddah)).finish();
			});
		});
	} else response.finish();
});
Network.get('rooms', 'invite', function (response) {
	var prof1 = response.value, prof0 = response.account.uid;
	
	if (!response.account) { response.finish(); return; } // not signed in
	if (!isnum(prof1) || prof1 <= 0 || prof1 === prof0) {
		response.finish(); return;
	} // received nothing

	helpers.get(Config.database.name, tbl_hsbt, { uid: prof1 }, function (hsb) {
	if (hsb)
	wuqu3aat.query('select * from `'+Config.database.name+'`.`'+tbl_mklmt+'` '+
				'where (members like ? or members like ?) '+
				'order by updated asc limit 0,'+1,
	[ '% '+prof1+':% '+prof0+':%', ' '+prof0+':% '+prof1+':%' ]).then(function (outcome) {
		// prof0:1 ensures you're requesting, if nothing found, returns xataa :)
		var haalah = 0, uid, row = outcome.rows[0], out = {},
			members, membersobj = {}, membersstr = '';
		if (row) {
			uid = row.uid; members = row.members;
			out.uid = uid;
			out.created = row.created;
			out.updated = row.updated;
			out.members = [[prof0, 1], [prof1, -1]];
			members.split(' ').forEach(function (v) {
				v = v.split(':');
				var a = parseint(v[0]), b = parseint(v[1]);
				if (isnum(a) && isnum(b)) {
					membersobj[ a ] = b;
					membersstr += ' '+a+':';
					if (a === prof0) {
						membersstr += 1;
					} else {
						membersstr += -1;
					}
				}
			});
		} else {
			out.members = [[prof0, 1], [prof1, -1]];
			membersobj[ prof0 ] = 1;
			membersobj[ prof1 ] = -1;
			membersstr = ' '+prof0+':1 '+prof1+':-1';
		}

		if (haalah === 0) { // only request if 7d passed or never requested b4
			var created = new Date().getTime();
			helpers.set(Config.database.name, tbl_mklmt, [{
				uid:			uid,
				members:		membersstr,
				updated:		created,
			}], function (outcome) {
				var row = outcome.rows[0];
				out.uid = row.uid;
				out.created = row.created;
				out.updated = row.updated;
				rooms.members(row.uid, membersobj);
				rooms.finish_all(row.uid); // force out
				response.get(out).finish();
			}, { checkism: false });
		}
		else response.get(out).finish();
	});
	else response.get().finish();
	});
});
Network.batch('rooms', function () {
	MongoDB.query(Config.database.name, tbl_mklmt, {
		members: new RegExp(':-2'),
	}, function (outcome) {
		var modify = [], ct = new Date().getTime();
		outcome.rows.forEach(function (o) {
			if (ct-o.remove < 5 * 60 * 1000) modify.push({
				uid: o.uid,
				members: o.members.replace(':-2', ':0'),
				remove: ct,
			});
			MongoDB.set(Config.database.name, tbl_mklmt, modify, function (outcome) {
			});
		});
	});
});


