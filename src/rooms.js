/* qanaah 
 * 	[ musalsal max: 24?
 * 		[ room
 * 
 * */
var Rooms;
;(function(){
	var keys, oldresults = [], photo, module_name = 'rooms', module_title = 'Rooms', module_icon = 'iconbluron',
		waqtsaabiq = 0, mklmttaxeer = 1*60*1000;

	function sort_softkey() { if ( View.is_active( module_name ) ) {
//		var sort = Preferences.get('rooms-sort', 1);
//		Softkeys.add({ n: 'Sort',
//			k: 'f',
//			alt: 1,
//			i: sort ? 'iconfilterlist' : 'iconfilterlistrev',
//			c: function () {
//				sort = Preferences.get('rooms-sort', 1);
//				Preferences.set('rooms-sort', sort ? 0 : 1);
//				Rooms.update(1, 1);
//				sort_softkey();
//				return 1;
//			}
//		});
	} }
	
	Rooms = rooms = {
		raakib: function (members) { // non-member profile
			if (isarr(members))
			for (var i = 0; i < members.length; ++i) {
				var v = members[i];
				if (v[1] !== 1) return v;
			}
		},
		is_you: function (members) { // your profile
			if (isarr(members))
			for (var i = 0; i < members.length; ++i) {
				var v = members[i];
				if (v[0] === sessions.uid()) return v;
			}
		},
		is_other: function (members) { // other profile
			if (isarr(members))
			for (var i = 0; i < members.length; ++i) {
				var v = members[i];
				if (v[0] !== sessions.uid()) return v;
			}
		},
		condition: function (m) { // condition of room
			var condition = 0, byyou = 0, msg = '';
			var is_other = Rooms.is_other(m.members);
			var is_you = Rooms.is_you(m.members);
			if (isarr(is_other) && isarr(is_you)) {
				if (is_other[1] === -3) { // he blocked you
					condition = -3;
					msg = 'mklmhmas3oob';
				} else
				if (is_you[1] === -3) { // you blocked him
					condition = -3;
					byyou = 1;
					msg = 'mklmhtas3oob';
				} else
				if ([-2, 0].includes(is_you[1]) && is_other[1] === 1) { // you've rejected or stale
					condition = is_you[1];
					byyou = 1;
					msg = condition ? 'mklmhtatrood' : 'mklmhda3aw';
				} else
				if (is_you[1] === -1 && is_other[1] === 1) { // you are invited
					condition = -1;
					msg = 'mklmhyad3aak';
				} else
				if (is_you[1] === 1 && is_other[1] === -1) { // he is invited
					condition = -1;
					byyou = 1;
					msg = 'mklmhtad3oot';
				} else
				if ([-2, 0].includes(is_other[1]) && is_you[1] === 1) { // he's rejected or stale
					condition = is_other[1];
					msg = condition ? 'mklmhmatrood' : 'mklmhda3aw';
				} else
				if (is_you[1] === 0 && is_other[1] === 0) { // both can invite
					condition = 0;
					// if not a real mklmh, don't allow blocking
					if (m.uid < 0) byyou = 1;
					msg = 'mklmhda3aw';
				} else
				if (is_you[1] === 1 && is_other[1] === 1) { // both are members
					condition = 1;
				}
			}
			return [condition, byyou, msg]; // [condition, ?byyou, msg]
		},
		invite: function (profile) {
			Network.get('rooms', 'invite', profile);
		},
		search: function (profile, cb) {
			if (isfun(cb) && isnum(profile))
			Offline.getforun('rooms', 0, {
				filter: { kind: 0 }
			}, function (arr) {
				var done = 0;
				for (var i = 0; i < arr.length; ++i) {
					if (done) break;
					var item = arr[i];
					if (isarr(item.members))
					for (var j = 0; j < item.members.length; ++j) {
						if (item.members[j][0] === profile) {
							cb(item);
							done = 1;
							break;
						}
					}
				}
			});
		},
	};

	Offline.create(module_name, 0, {
		delay: -1, // never get from server, server uses broadcast for that
		mfateeh: ['kind', 'link'],
	});

	Hooks.set('ready', function () {
		room_detail_level_suid = Settings.adaaf('Room Detail Level', function () {
			var yes = Preferences.get(room_detail_level, 1);
			current = yes ? 1 : 0;
			return [ yes ? 'Full' : 'Minimal' ];
		}, function () {
			Preferences.set(room_detail_level, Preferences.get(room_detail_level, 1) ? 0 : 1);
		}, module_icon);

		Network.intercept(module_name, function (intahaa) {
			// receive rooms updates when signed in
			intahaa( sessions.signedin() ? 1 : undefined );
		});
		Offline.response.get(module_name, function (response) {
//			$.log( 'Offline.response.get rooms', response );
			rooms_recycler.set( [response] );
		});
		Network.response.get(module_name, 'invite', function (response) {
//			$.log( 'Offline.response.add rooms invite', response );
			if (response) {
				messages.apply_condition(response);
			}
		});
		Offline.response.add(module_name, async function (response) {
//			$.log( 'Offline.response.add rooms', response );
			if (response) {
				rooms_recycler.set( [response] );
				Messages.apply_condition(response);
//				messages.itlaqtaxeer(response);
			}
		});
		Offline.response.remove(module_name, function (response) {
			if (isnum(response) || isstr(response)) {
				rooms_recycler.remove_by_uid( response );
			}
		});

	});

	Hooks.set('sessionchange', async function (signedin) {
		if (!signedin) {
			if (rooms_recycler) await rooms_recycler.remove_all();
		}
	});

	var delete_room_dialog = 'delete-room';
	Hooks.set(dialog_ready, async function (args, k) { if (args.name == delete_room_dialog) {
		var room = await get_room(args.uid);
		if (Dialog.get_name() == delete_room_dialog && Dialog.get_uid() == room.uid) {
			var name = room.name || room.link;
			var name_str = (name ? '"'+name+'"' : 'this room');
			Webapp.header(['Remove Room', name_str]);
			Dialog.set_message( 'Do you want to delete '+name_str+'?' );
		}
	} });
	Hooks.set(dialog_done, async function ({ name, uid }, k, answer) { if (name == delete_room_dialog) {
		var o = await get_room(uid);
		o.remove = 1;
		rooms_recycler.set([o]);
		Offline.remove(module_name, { uid });
	} });
})();




