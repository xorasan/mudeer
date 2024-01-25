/* qanaah 
 * 	[ musalsal max: 24?
 * 		[ room
 * 
 * */
var Rooms, rooms;
;(function(){
	var roomslist, keys, oldresults = [], photo, module_name = 'rooms',
	waqtsaabiq = 0, mklmttaxeer = 3*60*1000,
	get_rooms_count = function () {
		var l = roomslist.length();
		if (view.is_active('rooms')) {
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
				Offline.get('rooms', 0, 0, Time.now());
			}
		},
		fahras: function (results) {
			results = results || oldresults || [];
			results.sort(function (a, b) {
				return b.updated - a.updated;
			});
			
			roomslist.popall();
			
			results.forEach(function (item, i) {
				roomslist.set(item);
			});

			get_rooms_count();
			oldresults = results;
		},
		open: function () { // open room
			Hooks.run('sheet', {
				n: create_room_sheet,
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

	Offline.create('rooms', 0, {
		delay: -1, // never get from server, server uses broadcast for that
		mfateeh: ['kind'],
		tashkeel: function (o) { // format objects
			return { uid: o.uid, name: o.name, link: o.link, members: o.members, created: o.created, updated: o.updated };
		},
	});

	Hooks.set('ready', function () {
		Network.intercept('rooms', function (intahaa) {
			// receive rooms updates when signed in
			intahaa( sessions.signedin() ? 1 : undefined );
		});
		Offline.response.get('rooms', function (response) {
			$.log( 'Offline.response.get rooms', response );
			rooms.fahras( response );
		});
		Network.response.get('rooms', 'invite', function (response) {
//			$.log( 'Offline.response.add rooms invite', response );
			if (response) {
				messages.apply_condition(response);
			}
		});
		Offline.response.add('rooms', function (response) {
			$.log( 'Offline.response.add rooms', response );
			if (response) {
//				if (response.members) {
//					roomslist.pop( response.uid );
//					response.awwal = 1;
					roomslist.set( response );
//				}
				if (view.is_active('rooms')) {
//					roomslist.select( parseint(roomslist.id2num(response.uid)) );
					get_rooms_count();
				}
				messages.apply_condition(response);
//				messages.itlaqtaxeer(response);
			}
		});
		Offline.response.remove('rooms', function (response) {
			if (isnum(response)) roomslist.pop( response );
		});

		keys = view.mfateeh('rooms');

		roomslist = list( keys.list ).idprefix('rooms')
						.listitem('roomitem');
		
		roomslist.afterset = function (item, clone, k) {
			var condition = rooms.condition(item);
			if (k) {
				setdata(k.waqtqabl, 'time', item.created);
				innertext(k.message, xlate(condition[2], '') );
			}
			var is_other = rooms.is_other(item.members);
			if (is_other && clone) {
				$.taxeer('members'+item.uid, function () {
					innerhtml(k.photo, '');
					Accounts.get([is_other[0]], function (results) {
						results.forEach(function (o) {
							innertext(k.message, xlate(condition[2], o.displayname||o.name) );
						});
					});
				}, 50);
			}
		};
		roomslist.beforeset = function (item) {
			var ret = rooms.is_other(item.members);
			if (ret) {
				Accounts.get([ret[0]], function (results) {
					results.forEach(function (o) {
						item.title = o.displayname || o.name;
					});
				});
			}
			return item;
		};
		roomslist.onpress = function (o, key, uid) {
			Hooks.run('view', {
				name: 'messages',
				uid: o.link || o.uid,
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
			case 'rooms':
//				view.ishtaghal('muhawwal');
//				break;
				var m = messages.current();
				if (m) {
					view.ishtaghal('messages');
				} else {
					get_rooms_count();
					
					rooms.update();
					
					softkeys.list.basic(roomslist);
					softkeys.add({ n: 'Create Room',
						k: K.sl,
						i: 'iconadd',
						c: function () {
							rooms.open();
							return 1;
						}
					});
					break;
				}
		}
	});

	var create_room_sheet = 'setup-room';
	var sheet_out = { }, sheet_list;
	Hooks.set('sheet-ready', function (args, k) { if (args.name == create_room_sheet) {
		Sheet.set_title('Setup Room');
		var out = sheet_out, l = sheet_list;
		var suid = Sessions.uid(); // TODO CHECK
		k.name.focus();
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
		Offline.add(module_name, {
			uid:		k.uid.value || Offline.ruid(),
			name:		k.name.value,
			link:		k.link.value,
			pending:	1,
		});
	} });
})();




