/* qanaah 
 * 	[ musalsal max: 24?
 * 		[ room
 * 
 * */
var Rooms, rooms, roomslist;
;(function(){
	var keys, oldresults = [], photo, module_name = 'rooms',
	waqtsaabiq = 0, mklmttaxeer = 1*60*1000,
	get_rooms_count = function () {
		var l = roomslist.length();
		if (View.is_active('rooms')) {
			roomslist.title( l ? (l+' '+translate('rooms'))
							: translate('norooms') );
//			roomslist.select();
//			roomslist.message(l ? undefined : translate('norooms') );
		}
	};
	
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
			var is_other = rooms.is_other(m.members);
			var is_you = rooms.is_you(m.members);
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
		update: function () {
			if (isnum(waqtsaabiq) && Time.now() - waqtsaabiq < mklmttaxeer) {
			} else {
				waqtsaabiq = Time.now();
				Offline.get(module_name, 0, 0, Time.now());
			}
		},
		fahras: function (results) {
			results = results || oldresults || [];
			results.sort(function (a, b) {
				return b.updated - a.updated;
			});
			
//			roomslist.popall();
			
			results.forEach(function (item, i) {
				roomslist.set(item);
			});

			get_rooms_count();
			oldresults = results;
		},
		open: function (uid) { // open room
			Hooks.run('sheet', {
				n: create_room_sheet,
				u: uid,
			});
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
		tashkeel: function ({ uid, name, link, members, created, updated }) { // format objects
			return { uid, name, link, members, created, updated };
		},
	});

	Hooks.set('ready', function () {
		Network.intercept(module_name, function (intahaa) {
			// receive rooms updates when signed in
			intahaa( sessions.signedin() ? 1 : undefined );
		});
		Offline.response.get(module_name, function (response) {
//			$.log( 'Offline.response.get rooms', response );
			rooms.fahras( response );
		});
		Network.response.get(module_name, 'invite', function (response) {
//			$.log( 'Offline.response.add rooms invite', response );
			if (response) {
				messages.apply_condition(response);
			}
		});
		Offline.response.add(module_name, function (response) {
//			$.log( 'Offline.response.add rooms', response );
			if (response) {
//				if (response.members) {
//					roomslist.pop( response.uid );
//					response.awwal = 1;
					roomslist.set( response );
//				}
				if (View.is_active('rooms')) {
//					roomslist.select( parseint(roomslist.id2num(response.uid)) );
					get_rooms_count();
				}
				Messages.apply_condition(response);
//				messages.itlaqtaxeer(response);
			}
		});
		Offline.response.remove(module_name, function (response) {
			if (isnum(response) || isstr(response)) roomslist.remove_by_uid( response );
		});

		keys = View.dom_keys(module_name);

		roomslist = list( keys.list ).idprefix(module_name).listitem('roomitem');
		
		roomslist.afterset = function (item, clone, k) {
			ixtaf(k.count_box);
			ixtaf(k.call_box);
			if (item.count) {
				izhar(k.count_box);
				innertext(k.count, item.count);
			}
			if (isarr(item.connected) && item.connected.length) {
				izhar(k.call_box);
				innertext(k.connected, item.connected.length);
			}

			// TODO efficiency, do only once
			// stable color
			var unique_color = Themes.generate_predictable_color(item.uid);
			setcss(k.photo, 'background-color', Themes.darken_hex_color(unique_color, 130, .5) );
			setcss(k.photo, 'color', Themes.brighten_hex_color(unique_color, 130, .7) );

			var short_name = '';
			if (item.name) {
				short_name = item.name;
			} else if (item.link) {
				short_name = '@'+item.link;
			}

			innertext(k.photo, short_name.slice(0, 3));

//			var condition = rooms.condition(item);
//			if (k) {
//				innertext(k.message, xlate(condition[2], '') );
//			}
//			var is_other = rooms.is_other(item.members);
//			if (is_other && clone) {
//				$.taxeer('members'+item.uid, function () {
//					innerhtml(k.photo, '');
//					Accounts.get([is_other[0]], function (results) {
//						results.forEach(function (o) {
//							innertext(k.message, xlate(condition[2], o.displayname||o.name) );
//						});
//					});
//				}, 50);
//			}
		};
		roomslist.beforeset = function (item) {
			item.updated$time = item.updated || item.created;
			if (item.link) {
				item.message = '@'+item.link;
			}
//			var ret = rooms.is_other(item.members);
//			if (ret) {
//				Accounts.get([ret[0]], function (results) {
//					results.forEach(function (o) {
//						item.title = o.displayname || o.name;
//					});
//				});
//			}
			return item;
		};
		roomslist.on_selection = function (o) {
			Softkeys.add({ n: 'Join Call',
				k: 'c',
				alt: 1,
				i: 'iconcall',
				c: function () {
					Hooks.run('view', {
						name: 'call_screen',
						uid: o.link ? '@'+o.link : o.uid,
					});
					return 1;
				}
			});
			Softkeys.add({ n: 'Edit Room',
				k: 'e',
				ctrl: 1,
				i: 'iconedit',
				c: function () {
					Rooms.open(o.uid);
					return 1;
				}
			});
			Softkeys.add({ n: 'Delete Room',
				k: 'delete',
				alt: 1,
				i: 'icondeleteforever',
				c: function () {
					Hooks.run('dialog', {
						n: delete_room_dialog,
						u: o.uid,
						c: function () {
							Offline.remove(module_name, { uid: o.uid });
						},
					});
					return 1;
				}
			});
		};
		roomslist.onpress = function (o, key, uid) {
			Hooks.run('view', {
				name: 'messages',
				uid: o.link ? '@'+o.link : o.uid,
			});
//			messages.open(o);
		};

	});
	Hooks.set('viewready', function (args) {
		switch (args.name) {
//			case 'muhawwal':
//				var m = view.mfateeh('muhawwal');
////				innertext(m.list, muhawwal(0));
//				setcss(m.list, 'width', '50%');
//				setcss(m.list2, 'width', '50%');
//				setcss(m.list, 'font-size', '100%');
//				m.list.onkeyup = function () {
//					innertext(m.list2, muhawwal(m.list.value, 1));
//				};
//				break;
			case module_name:
//				view.ishtaghal('muhawwal');
//				break;
				get_rooms_count();
				
				rooms.update();
				
				Softkeys.list.basic(roomslist);
				Softkeys.add({ n: 'Create Room',
					k: K.sl,
					i: 'iconadd',
					c: function () {
						Rooms.open();
						return 1;
					}
				});
				break;
		}
	});

	async function get_room(uid) { if (uid) {
		var filter = {};
		if (uid.startsWith('@')) {
			filter.link = uid.slice(1);
		} else {
			filter.uid = uid;
		}
		var arr = await Offline.fetch( module_name, 0, { filter } );
		return arr[0];
	} }
	Rooms.get_room = get_room;

	var delete_room_dialog = 'delete-room';
	var create_room_sheet = 'setup-room';
	var sheet_out = { }, sheet_list, setup_room_dom_keys;
	Hooks.set('dialog-ready', async function (args, k) { if (args.name == delete_room_dialog) {
		var room = await get_room(args.uid);
		if (Dialog.get_name() == delete_room_dialog && Dialog.get_uid() == room.uid) {
			var name = room.name || room.link;
			Dialog.set_message( 'Do you want to delete '+(name ? '"'+name+'"' : 'this room')+'?' );
		}
	} });
	Hooks.set('sheet-ready', async function (args, k) { if (args.name == create_room_sheet) {
		$.log( args );
		Sheet.set_title('Setup Room');
		setup_room_dom_keys = k;
		var out = sheet_out, l = sheet_list;
		var suid = Sessions.uid(); // TODO CHECK
		k.name.focus();

		if (args.uid) {
			var room = await get_room(args.uid);
			if (Sheet.get_active() == create_room_sheet && setup_room_dom_keys && room) {
				if (room.remove && room.uid === Sheet.get_active_uid()) {
					Sheet.cancel();
				} else {
					setup_room_dom_keys.uid	.value	= room.uid;
					setup_room_dom_keys.name.value	= room.name;
					setup_room_dom_keys.link.value	= room.link;
				}
			}
		}

//		l = list( k.members ).idprefix('members')
//					.listitem('members_item');
//		l.onpress = function (o) {
//			l.baidaa();
//		};
//		l.afterset = function (o, clone, k) {
//		};
//		var add = function (results) {
//			l.popall();
//			results.forEach(function (o) {
//				if (o.uid !== suid)
//				l.set({
//					uid: o.uid,
//					title: o.displayname || ('@'+o.name),
//				});
//			});
//		};
//		k.search_members.onkeyup = function () {
//			var str = this.value;
//			if (str.length)
//				Accounts.search(str, function (results) {
//					add(results);
//				});
//			else
//				l.popall();
//		};
//		k.search_members.onkeyup();
	} });
	Hooks.set('sheet-okay', function (args, k) { if (args.name == create_room_sheet) {
		setup_room_dom_keys = 0;
		Offline.add(module_name, {
			uid:		k.uid.value || Offline.ruid(),
			name:		k.name.value,
			link:		k.link.value,
			pending:	1,
		});
	} });
})();




