/* qanaah 
 * 	[ musalsal max: 24?
 * 		[ room
 * 
 * */
var Rooms;
;(function(){
	var keys, oldresults = [], photo, module_name = 'rooms', module_title = 'Rooms', module_icon = 'iconbluron',
		room_detail_level_suid, room_detail_level = 'room_detail_level',
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
		apply_room_details: async function () {
			var detail_level = Preferences.get(room_detail_level, 1);

			var elements = await rooms_recycler.get_elements();
			elements.reverse();
			for (var element of elements) {
				var k = templates.keys(element);
				var item = rooms_list.adapter.get( getdata(element, 'uid') );
				// BUG item is undefined

				ixtaf(k.count_box);
				ixtaf(k.updated);
				if (item.count) {
					Messages.update_room_count(item);
					
					if (item.message) {
						var msg = item.message, message_str = '';
						if (msg.kind == 2) {
							message_str = 'Photo';
						} else if (msg.kind == 1) {
							message_str = 'Audio';
						} else {
							message_str = Markdown.deformat( (msg.text||'').replace(/\n/g, ' ') );
							if (message_str.length > 48) {
								message_str = message_str.slice(0, 48)+'...';
							}
						}
						var account_name = '';
						var account = await Accounts.fetch(msg.owner);
						if (account) {
							account_name = Accounts.get_name(account)+': ';
						}

						izhar(k.updated);
						innertext(k.message, account_name + message_str);
					}
					
					izhar(k.count_box);
					innertext(k.count, item.count);
				}
				ixtaf(k.call_box);
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
				innertext( k.short_name, short_name.slice(0, 3)+'\n'+short_name.slice(3, 6) );

				if (item.link && item.link.length) {
					k.created.classList.add('pad');
				} else {
					k.created.classList.remove('pad');
				}

				(detail_level ? izhar : ixtaf)(k.created, k.updated, k.count_box);
			}
		},
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
		update: async function (force, clear) {
			var loaded_objects = rooms_recycler.get_objects();
			if (loaded_objects.length == 0) {
				await rooms_recycler.count();
				await rooms_recycler.render();
			}
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

		keys = View.dom_keys(module_name);

		rooms_list = list( keys.list ).idprefix(module_name).listitem('roomitem');

		rooms_recycler = Recycler( rooms_list, module_name );
		rooms_recycler.set_reversed( 1 );
		rooms_recycler.add_view( module_name );
		rooms_recycler.set_phrase( 'next', 'Older' );
		rooms_recycler.set_phrase( 'prev', 'Newer' );
		rooms_recycler.add_intercept(async function (need, payload) {
			return 1;
		});
		rooms_recycler.add_postcept(async function (need, payload) {
			return 1;
		});
		
		rooms_list.after_set = async function (o, clone, k) {
			if (['next', 'prev'].includes(o.uid)) return;

			var msg = '';
			if (o.pending) msg = 'pending sync';
			if (o.remove) msg += (msg ? ' · ' : '')+'will remove';

			innertext(k.info, msg);
		};
		rooms_list.beforeset = function (item) {
			if (['next', 'prev'].includes(item.uid)) return item;

			if (!isundef(item.created)) item.created$time = item.created;
			if (!isundef(item.updated)) item.updated$time = item.updated;
			if (item.link) {
				item.link_str = '@'+item.link;
			} else {
				item.link_str = '';
			}
			return item;
		};

		var edit_key = { n: 'Edit Room',
				k: 'e',
				ctrl: 1,
				i: 'iconedit',
			},
			delete_key = { n: 'Delete Room',
				k: 'delete',
				alt: 1,
				i: 'icondeleteforever',
			};
		rooms_list.on_selection = async function (o) { if ( View.is_active( module_name ) ) {
			if (['next', 'prev'].includes(o.uid)) {
				Softkeys.remove(edit_key.uid);
				Softkeys.remove(delete_key.uid);
				return;
			}

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
			
			edit_key.c = function () {
				Rooms.open(o.uid);
				return 1;
			};
			if ( await has_access( module_name, 'edit' ) ) {
				if ( View.is_active( module_name ) ) {
					Softkeys.add(edit_key);
				}
			}

			delete_key.c = function () {
				Hooks.run('dialog', {
					n: delete_room_dialog,
					u: o.uid,
				});
				return 1;
			};
			if ( await has_access( module_name, 'remove' ) ) {
				if ( View.is_active( module_name ) ) {
					Softkeys.add(delete_key);
				}
			}
		} };
		rooms_list.onpress = function (o, key, uid) {
			if (['next', 'prev'].includes(o.uid)) return;

			Hooks.run('view', {
				name: 'messages',
				uid: o.link ? '@'+o.link : o.uid,
			});
//			messages.open(o);
		};

	});
	Hooks.set('recycler-insert-done', async function ({ name, need }) { if (name == module_name) {
		await Rooms.apply_room_details();
	} });

	Hooks.set('sessionchange', async function (signedin) {
		if (!signedin) {
			if (rooms_recycler) await rooms_recycler.remove_all();
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
	Hooks.set(sheet_ready, async function (args, k) { if (args.name == create_room_sheet) {
		$.log( args );
		Sheet.set_title('Setup Room');
		setup_room_dom_keys = k;
		var out = sheet_out, l = sheet_list;
		var suid = Sessions.uid(); // TODO CHECK
		k.name.focus();

		if (args.uid) {
			var room = await get_room(args.uid);
			Sheet.set_data(room);
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
	} });
	Hooks.set(sheet_done, function (args, k) { if (args.name == create_room_sheet) {
		setup_room_dom_keys = 0;
		var room = Sheet.get_data();
		var o = {
			uid:		k.uid.value || Offline.ruid(),
			name:		k.name.value,
			link:		generate_alias(k.link.value),
			pending:	1,
		};
		if (room) o.created = room.created;
		Offline.add(module_name, shallowcopy(o));
		rooms_recycler.set([o]);
	} });
})();




