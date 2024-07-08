var Messages, messages, messages_list, messages_recycler;
;(function(){
	var mfateeh, oldresults = [], current, last_message,
	haadirsawt,

	text2seconds = function (text) { // secs
		var c = text.length;
		return Math.ceil( c / 10 ) || 1;
	},
	domembers = function () {
		/*$.taxeer('members'+current.uid, function () {
			innerhtml(mfateeh.members, '');
			var members = [];
			current.members && current.members.forEach(function (o) {
				members.push(o[0]);
			});
			Accounts.get(members, function (results) {
				results.forEach(function (o) {
					photo = setshakl(o, mfateeh.members, 1);
					photo.zoomlevel = .3;
					photo.panned.y = 25;
					photo.jaddad();
				});
			});
		}, 50);*/
	},
	rejectbtn = function () { if ( is_view_level() ) {
		softkeys.set(K.sl, function () {
			var m = {
				uid: current.uid,
				members: current.members,
			};
			current.members.forEach(function (o) {
				if (o[0] === sessions.uid()) {
					o[1] = -2;
					m.pending = 1;
				}
			});
			Offline.add('rooms', m);
			messages.apply_room();
		}, 0, 'iconclose');
	}},
	unblockbtn = function () { if ( is_view_level() ) {
		softkeys.set(K.sl, function () {
			var m = {
				uid: current.uid,
				members: current.members,
			};
			current.members.forEach(function (o) {
				if (o[0] === sessions.uid()) {
					o[1] = 0;
					m.pending = 1;
				}
			});
			Offline.add('rooms', m);
			messages.apply_room();
		}, 0, 'iconpersonadd');
	}},
	blockbtn = function () { if ( is_view_level() ) {
		Softkeys.add({ n: 'Back',
			k: '7',
			alt: 1,
			i: 'iconblock',
			c: function () {
				Hooks.run('dialog', {
					m: 'asa3ab',
					c: function () {
						var m = {
							uid: current.uid,
							members: current.members,
						};
						current.members.forEach(function (o) {
							if (o[0] === sessions.uid()) {
								o[1] = -3;
								m.pending = 1;
							}
						});
						Offline.add('rooms', m);
						messages.apply_room();
					}
				});
			},
		});
	}},
	invitebtn = function () { if ( is_view_level() ) {
		var uxr = rooms.is_other(current.members);
		softkeys.set(K.sl, function () {
			rooms.invite(uxr[0]);
			softkeys.set(K.sl, function () {
				Webapp.status( xlate('mashghool') );
			}, 0, 'iconhourglassempty');
		}, 0, 'iconpersonadd');
	}},
	acceptbtn = function () { if ( is_view_level() ) {
		Softkeys.add({ k: K.en,
			n: 'Done',
			c: function () {
				var m = {
					uid: current.uid,
					members: current.members,
				};
				current.members.forEach(function (o) {
					if (o[0] === sessions.uid()) {
						o[1] = 1;
						m.pending = 1;
					}
				});
				Offline.add('rooms', m);
				messages.apply_room();
			},
			i: 'icondone',
		});
	}},
	

	Messages = messages = {
		update_room_count: function (item) { if (item && current) {
			if (item.uid == current.uid) {
				messages_recycler.set_count( item.count || 0 );
			}
		} },
		current: function (remove) {
			if (remove) {
				current = 0;
				Recorder.infasal();
				Uploader.detach();
				mfateeh.preview.src = '';
				izhar(mfateeh.text);
				ixtaf(mfateeh.photo);
			}
			else return current;
		},
		apply_condition: function (m) {
			if (m && current) {
				var ret = rooms.is_other(current.members);
				var ret2 = rooms.is_other(m.members);
				if (ret && ret2 && ret[0] === ret2[0]) { // same profile
					current = m;
					messages.apply_room();
				}
			}
		},
		itlaqtaxeer: function (m) {
			if (current && m && current.uid === m.uid) {
				if (mfateeh && m) {
					var t = m.taxeer;
					current.taxeer = t;
					var yes = 0;
					if (isnum(t)) {
						setdata(mfateeh.taxeer, 'time', t);
						setdata(mfateeh.katabmessage, 'taxeer', 1);
						time(mfateeh.katabmessage); // an3ash waqt
						mfateeh.taxeer.hidden = 0;
						t = t - time.now();
						if (t > 0)
						$.taxeer('messagesirsal', function () {
							messages.itlaqtaxeer();
						}, t);
						else yes = 1;
					} else yes = 1;
				} else yes = 1;
			} else yes = 1;
			if (yes) {
				$.taxeercancel('messagesirsal');
				popdata(mfateeh.taxeer, 'time');
				popdata(mfateeh.katabmessage, 'taxeer', 1);
				mfateeh.taxeer.hidden = 1;
			}
		},
		iftah: function (item, an3ash) { // open messages
			if (item) {
				if (!current || current.uid !== item.uid) {
					needs_to_apply = 1;
				}
				current = item;
				last_message = 0;
				if (isundef(current.uid)) {
					// init direct message protocol
					// search offline for prev mklmt sinf0 with this 3udw
					// nothing? search online for the same thing
					// nothing? show a big button to invite -1
					// if prev mklmh found, just turn it into current :)
					/*
					 * invitation can be rejected -2
					 * rejected invitations are deleted after 7d
					 * you can re-invite after that
					 * -3 means no re-invites, total block :)
					 * blocks can only be unblocked by the blocker
					 * the blockee can't delete them
					 * they do disappear offline though
					 * */
					if (Pager) Pager.intaxab('rooms', 1);
					View.ishtaghal('messages');
					messages_list.message( xlate('bahacroom') );
					var ret = rooms.is_other(current.members);
					if (ret)
					Rooms.bahac(ret[0], function (m) {
						if (m) messages.iftah(m, 1);
						else {
							if (view.get() !== 'messages' || an3ash)
								view.ishtaghal('messages');
							
							messages.apply_room(current);
						}
					});
					else messages.apply_room(item);
				} else {
					if (view.get() !== 'messages' || an3ash)
						view.ishtaghal('messages');
				}
			}
		},
	};

	Offline.create(module_name, '', {
		mfateeh: ['room'],
		tashkeel: function ({ uid, text, room, owner, created, updated }) {
			return { uid, text, room, owner, created, updated };
		},
	});

	Hooks.set('ready', async function () {
		focus_msg_field_suid = Settings.adaaf('Message Field', function () {
			var yes = Preferences.get(focus_msg_field, 1);
			current = yes ? 1 : 0;
			return [ yes ? 'Always Focus' : 'On Demand' ];
		}, function () {
			Preferences.set(focus_msg_field, Preferences.get(focus_msg_field, 1) ? 0 : 1);
		}, module_icon);
		autoplay_next_msg_suid = Settings.adaaf('Voice Message Playback', function () {
			var yes = Preferences.get(autoplay_next_msg, 1);
			current = yes ? 1 : 0;
			return [ yes ? 'Autoplay Next' : 'One & Done' ];
		}, function () {
			Preferences.set(autoplay_next_msg, Preferences.get(autoplay_next_msg, 1) ? 0 : 1);
		}, module_icon);

		Offline.response.add(module_name, function (response) {
//			$.log( 'Offline.response.add messages' );
			if (response && current) {
				if (response.room === current.uid) {
					if (last_message) {
						if (last_message.uid === response.ruid) {
							last_message = 0;
						}
					}
					messages_recycler.set([ response ]);
					// TODO scroll into view?
					if ( is_view_level() ) {
						messages_list.last();
					}
				}
			}
		});
		Offline.response.remove(module_name, function (response) { // TODO
			// TODO this will work if u add a batch process to pop deleted messages from the server
//			$.log( 'Offline.response.remove messages', response );
			var o = messages_list.adapter.get(response);
			if (o) {
				o.text = 'this msg was deleted';
				messages_list.set(o);
				$.delay('messagesremove'+o.uid, function () {
					messages_recycler.remove_by_uid(o.uid);
				}, 3000);
			}
		});

		mfateeh.messagebox.on_focus_prev = function () {
			if (mfateeh.messagebox.value.trim().length == 0) {
				focusprev(mfateeh.messagebox);
			}
		};
	});
	Hooks.set('recycler-insert-done', async function ({ name, need }) { if (name == module_name) {
		var elements = await messages_recycler.get_elements(), ps;
		elements.reverse();
		elements.forEach(function (element) {
			var yes = 1, margin = 0, k = templates.keys(element);
			var item = messages_list.adapter.get( getdata(element, 'uid') );
			if (ps) {
				var pskeys = templates.keys(ps);
				var previtem = messages_list.adapter.get( getdata(ps, 'uid') );
				if (previtem && !['next', 'prev'].includes(previtem.uid)) {
					if (item.owner === previtem.owner) yes = 0;
					if (!pskeys.padder.hidden) margin = 1;
				}
			}
			if (margin && yes) setdata(element, 'margin', 1);
			else popdata(element, 'margin');

			if (yes) {
				k.padder.hidden = 0;
				setdata(element, 'hasphoto', 1);
				// stable color
				var unique_color = Themes.generate_predictable_color(item.owner);
				setcss(k.photo, 'background-color', Themes.darken_hex_color(unique_color, 130, .5) );
				setcss(k.photo, 'color', Themes.brighten_hex_color(unique_color, 130, .7) );

				$.taxeer('messagesphoto'+item.uid, async function () {
					setcss(k.photo, 'opacity', 1);
					setcss(k.photo, 'height');
					var account = await Accounts.fetch(item.owner);
					if (account) {
						var account_name = Accounts.get_name(account);

						innertext(k.name, account_name);
						innertext( k.short_name, account.name.slice(0, 3)+'\n'+account.name.slice(3, 6) );
						
//						$.taxeer('scroll-message-into-view', function () { if ( is_view_level() ) {
//							// TODO figure out a better way to scroll
//							var last_element = messages_list.get_item_element( messages_list.selected );
//							if (last_element) {
//								scroll_into_view_with_padding( last_element, [Webapp.get_tall_screen_height(), 0, 200, 0] );
//							}
//						} });
					}
//					Accounts.get([item.owner], function (results) {
//						results.forEach(function (o) {
//							photo = setshakl(o, k.photo);
//							photo.zoomlevel = .25;
//							photo.panned.y = 25;
////							photo.mowdoo3( o.username.substr(0, 6) );
//							photo.jaddad();
//						});
//					});
				}, 50);
			} else {
				k.padder.hidden = 1;
				k.name.hidden = 1;
				popdata(element, 'hasphoto');
				setcss(k.photo, 'height', 0);
				setcss(k.photo, 'opacity', 0);
			}
			ps = element;
		});
	} });

})();

