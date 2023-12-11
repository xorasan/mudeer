/* qanaah 
 * 	[ musalsal max: 24?
 * 		[ room
 * 
 * */
var Rooms, rooms;
;(function(){
	var roomslist, keys, oldresults = [], photo,
	waqtsaabiq = 0, mklmttaxeer = 3*60*1000,
	get_rooms_count = function () {
		var l = roomslist.length();
		if (view.is_active('rooms') && backstack.darajah === 1) {
			webapp.header( l ? (l+' '+translate('rooms'))
							: translate('norooms') );
			roomslist.select();
		}
		roomslist.message(l ? undefined : translate('norooms') );
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
			var suid = sessions.uid(), out = { }, l;
			Hooks.run('sheet', {
				n: 'room',
				t: 'room',
				i: function (k) {
					k.searchmembers.focus();
					l = list( k.members ).idprefix('members')
								.listitem('membersitem');
					l.onpress = function (o) {
						l.baidaa();
					};
					l.afterset = function (o, clone, k) {
						photo = setshape(o, k.photo);
						photo.zoomlevel = 0.15;
						photo.panned.y = 14;
						photo.update();
					};
					var add = function (nataaij) {
						l.popall();
						nataaij.forEach(function (o) {
							if (o.uid !== suid)
							l.set({
								uid: o.uid,
								shape: o.shape,
								title: o.displayname || ('@'+o.username),
							});
						});
					};
					k.searchmembers.onkeyup = function () {
						var str = this.value;
						if (str.length)
							Accounts.search(str, function (nataaij) {
								add(nataaij);
							});
						else
							l.popall();
					};
					k.searchmembers.onkeyup();
				},
				c: function () {
					if (l)
					$.taxeer('roomsopen', function () {
						var o = l.get();
						if (o.uid !== suid) {
							messages.open({
								title: o.displayname || o.username,
								members: [[suid, 1], [o.uid, 0]]
							});
						}
					}, 100);
				},
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
		tashkeel: function (o) {
			return { uid: o.uid, members: o.members };
		},
	});

	Hooks.set('ready', function () {
		Network.intercept('rooms', function (intahaa) {
			// receive rooms updates when signed in
			intahaa( sessions.signedin() ? 1 : undefined );
		});
		Offline.response.get('rooms', function (response) {
//			$.log( 'Offline.response.get rooms', response );
			rooms.fahras( response );
		});
		Network.response.get('rooms', 'invite', function (response) {
//			$.log( 'Offline.response.add rooms invite', response );
			if (response) {
				messages.itlaqcondition(response);
			}
		});
		Offline.response.add('rooms', function (response) {
//			$.log( 'Offline.response.add rooms', response );
			if (response) {
				if (response.members) {
					roomslist.pop( response.uid );
					response.awwal = 1;
					roomslist.set( response );
				}
				if (view.is_active('rooms')) {
					roomslist.select( parseint(roomslist.id2num(response.uid)) );
					get_rooms_count();
				}
				messages.itlaqcondition(response);
				messages.itlaqtaxeer(response);
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
					Accounts.get([is_other[0]], function (nataaij) {
						nataaij.forEach(function (o) {
							photo = setshape(o, k.photo, 1);
							photo.zoomlevel = .3;
							photo.panned.y = 25;
//							photo.title( o.username.substr(0, 6) );
							photo.update();
							innertext(k.message, xlate(condition[2], o.displayname||o.username) );
						});
					});
				}, 50);
			}
		};
		roomslist.beforeset = function (item) {
			var ret = rooms.is_other(item.members);
			if (ret) {
				Accounts.get([ret[0]], function (nataaij) {
					nataaij.forEach(function (o) {
						item.title = o.displayname || o.username;
					});
				});
			}
			return item;
		};
		roomslist.onpress = function (item, key, uid) {
			messages.open(item);
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
})();