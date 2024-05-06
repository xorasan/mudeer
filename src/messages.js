var Messages, messages, messages_list, messages_recycler;
;(function(){
	var mfateeh, oldresults = [], current, last_message,
	module_name = 'messages', module_title = 'Messages', module_icon = 'iconmessage',
	needs_to_apply, haadirsawt, debug_messages = 1,
	// SETTINGS
	focus_msg_field_suid, focus_msg_field = 'focus_msg_field',
	autoplay_next_msg_suid, autoplay_next_msg = 'autoplay_next_msg',

	text2seconds = function (text) { // secs
		var c = text.length;
		return Math.ceil( c / 10 ) || 1;
	},
	ixtatamphoto = function () {
		var ismessages = View.is_active(module_name);
		if (mfateeh) {
			mfateeh.upload_photo.value = '';
			mfateeh.preview.src = '';
			izhar(mfateeh.text);
			ixtaf(mfateeh.photo);
			if (ismessages) {
				if (Preferences.get(focus_msg_field, 1)) {
					mfateeh.messagebox.focus();
				}
				isfun(mfateeh.messagebox.oninput) && mfateeh.messagebox.oninput();
			}
		}
		if (ismessages) auxbtn();
	},
	resize = function () {
		if (mfateeh) {
			var iw = innerwidth(), pad = 0;
			if (iw > 1000) pad = 120;
			setcss(mfateeh.katabmessage, 'left', (iw>640?(iw-640+pad)/2:0)+'px');
			setcss(mfateeh.katabmessage, 'right', (iw>640?(iw-640-pad)/2:0)+'px');
			mfateeh.messagebox.oninput && mfateeh.messagebox.oninput();
		}
	},
	nazzaf = function (text) {
		return (text || '').trim().replace(/[\n]{3,}/g, '\n\n');
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
			messages.itlaq();
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
			messages.itlaq();
		}, 0, 'iconpersonadd');
	}},
	blockbtn = function () { if ( is_view_level() ) {
		Softkeys.set('7', function () { Hooks.run('dialog', {
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
				messages.itlaq();
			}
		}); }, '7', 'iconblock');
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
	sendbtn_object = { k: K.en },
	sendbtn = function (sinf) { if ( is_view_level() ) {
		var icon = 'iconkeyboardvoice', name = 'Voice';
		if (sinf === -2) icon = 'iconhourglassempty', name = 'Converting...';
		else if (sinf === -1) icon = 'iconpause', name = 'Pause';
		else if ([1, 2, 3].includes(sinf)) icon = 'iconsend', name = 'Send';

		if (sendbtn_object && sendbtn_object.uid) {
			Softkeys.remove('0-0-0-enter');
			Softkeys.remove( sendbtn_object );
		}

		if (!isundef(sinf)) {
			sendbtn_object.shift = 1;
			sendbtn_object.n = name;
			sendbtn_object.i = icon;
			sendbtn_object.c = function () {
				if (sinf === 1) {
					mfateeh.messagebox.uponshiftenter();
				} else if (sinf === -2) { // busy
				} else if (sinf === -1) { // pause
					Recorder.pause();
				} else if (sinf === 2) {
					if (Recorder.tasjeel)
						Network.upload( module_name, 'audio', current.uid, Recorder.tasjeel );
				} else if (sinf === 3) {
					if (Uploader.marfoo3)
						Network.upload( module_name, 'photo', current.uid, Uploader.marfoo3 );
				} else {
					Recorder.record();
				}
			};
			Softkeys.add( sendbtn_object );
		} else if (sendbtn_object && sendbtn_object.uid) {
			sendbtn_object.shift = 0;
		}

		var item = messages_list.get_item_object();
		if (item && isnum(item.kind) && messages_list.murakkaz) {
			if (item.kind === 0) {
				name = 'Read More';
				icon = 'iconmessage';
			} else if (item.kind === 1) {
				name = 'Play Message';
				icon = 'iconplayarrow';
			} else if (item.kind === 2) {
				name = 'View Photo';
				icon = 'iconphoto';
			}
			sendbtn_object.n = name;
			sendbtn_object.i = icon;
			sendbtn_object.c = function () {
				messages_list.onpress(item, K.en, item.uid);
			};
			Softkeys.add( sendbtn_object );
		}
	} },
	auxbtn = function (sinf) { if ( is_view_level() ) {
		var icon = 'iconphoto', name = 'Photo';
		if ([2, 3].includes(sinf)) icon = 'icondeleteforever', name = 'Delete';
		else if (sinf === 4) icon = 'icondownload', name = 'Download';
		else if (sinf) icon = 'iconstop', name = 'Stop';

		Softkeys.add({ k: K.sl,
			n: name,
			c: function () {
				if (sinf === 3) {
					Uploader.stop();
				} else if (sinf === 4) {
					// TODO Download
				} else if (sinf) {
					Recorder.itlaqsawt(sinf);
				} else {
					mfateeh.upload_photo.click();
				}
			},
			i: icon,
		});
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
				messages.itlaq();
			},
			i: 'icondone',
		});
	}},
	removebtn_object = { n: 'Remove Message',
		k: 'delete',
		alt: 1,
		c: function () {
			messages_list.press('0'); // TODO change to delete
		},
		i: 'icondeleteforever',
	},
	removebtn = async function () { if ( is_view_level() ) {
		var item = messages_list.get_item_object(), do_show;
		if (item) {
			if (item.remove > 1) do_show = 1; // to allow cancelling removal
			if (item.owner == Sessions.get_account_uid()) do_show = 1;
		}

		if (!do_show) {
			var access = await has_access( module_name, 'remove' );
			if (access) {
				do_show = 1; // add
			}
		}

		if ( is_view_level() ) {
			if (messages_list.murakkaz && do_show) {
				Softkeys.add(removebtn_object);
			} else if (removebtn_object && removebtn_object.uid) {
				Softkeys.remove(removebtn_object.uid);
			}
		}
	} };
	
	function set_sidebar_and_header(subtitle) {
		if (View.is_active(module_name)) {
			if (get_global_object().Sidebar) Sidebar.choose(module_name);
		}
	}
	function update_sidebar() { if (get_global_object().Sidebar) {
		var luid;
		if (current) {
			if (current.link) luid = '@'+current.link;
			else luid = current.uid;
		}
		Sidebar.set({
			uid: module_name,
			luid, 
			title: module_title,
			subtitle: current ? current.name : '',
			icon: module_icon,
		});
		if (View.is_active(module_name)) {
			Sidebar.show_item(module_name);
		} else {
			Sidebar.hide_item(module_name);
		}
	} }

	function is_view_level() { return Backstack.darajah == 1 && View.is_active(module_name); };
	var view_photo_sheet = 'messagephoto', prev_msgbox_height = 0;

	Messages = messages = {
		update_room_count: function (item) { if (item && current) {
			if (item.uid == current.uid) {
				messages_recycler.set_count( item.count || 0 );
			}
		} },
		iftahphoto: function (item) {
			item && Hooks.run('sheet', {
				n: view_photo_sheet,
				u: item.uid,
			});
		},
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
					messages.itlaq();
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
		fetch: async function () {
			if (debug_messages) $.log.w( 'Messages fetch' );
			if (current) {
//				var position = Backstack.get_scroll_position();
//				if (isnum(position)) { scroll_to(0, position); }
				await messages_recycler.count();
				await messages_recycler.render();
				// NOTE recycler checks in a postcept whether results should be added to list in case room changed
//				if (View.is_active(module_name)) {
//					if (isnum(position)) {
//						$.log( 'messages, scroll_to', position );
//						scroll_to(0, position);
//					}
//				}
				
				return;
				var msgs = await Offline.fetch( module_name, 0, { filter: { room: current.uid } } );
				if ( View.is_active(module_name) ) {
					Messages.update_list( msgs, 1 );
				}
			}
		},
		update_list: function (results, do_scroll) {
			if (debug_messages) $.log.w( 'Messages update_list' );
			results = results || oldresults || [];
			results.sort(function (a, b) {
				return a.created - b.created;
			});
			
			messages_list.message(results.length ? undefined : translate('nomessages') );
			
			results.forEach(function (item, i) {
				messages_list.set(item);
			});
			
//			if (view.is_active('messages')) {
//				messages_list.select();
//			}
			
			oldresults = results;
			
//			if (do_scroll && is_view_level() )
//				messages_list.last();
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
							
							messages.itlaq(current);
						}
					});
					else messages.itlaq(item);
				} else {
					if (view.get() !== 'messages' || an3ash)
						view.ishtaghal('messages');
				}
			}
		},
		itlaq: function () {
			if (debug_messages) $.log.w( 'Messages itlaq' );
			if (current) {
				Webapp.header([
//					[module_name],
					current.name,
					(current.link ? '@'+current.link+'' : ''),
					'iconmessage'
				]);
//				if (needs_to_apply) {
//					Softkeys.clear();
//					Softkeys.P.empty();
//					Softkeys.list.basic(messages_list);
//				}
//				Softkeys.set(K.sr, function () {
//					Messages.current(1);
//					if (Pager) Pager.intaxab('rooms', 1);
//				}, 0, 'iconarrowback');
				var suid = Sessions.uid(),
					rkb = Rooms.raakib(current.members),
					uxr = Rooms.is_other(current.members),
					condition = Rooms.condition(current),
					byyou = condition[1],
					msg = condition[2],
					condition = 1 || condition[0];
					
				messages_list.message( xlate( msg, '' ) );

//				if (needs_to_apply)
//				Accounts.get([uxr[0]], function (results) {
//					results.forEach(function (o) {
////						photo = setshakl(o, mfateeh.photo);
////						photo.zoomlevel = .25;
////						photo.panned.y = 25;
////						photo.jaddad();
//						var name = o.displayname || o.username;
//						innertext( mfateeh.mowdoo3, name );
//						messages_list.message( xlate( msg, name ) );
//					});
//				});
				ixtaf(mfateeh.katabmessage);
				/*if (byyou) { // is by you
					if (condition === -3) { // you blocked him
						unblockbtn();
					}
					if (condition === -2) { // you rejected his request
						blockbtn();
					}
					if (condition === -1) { // you invited him
						softkeys.talaf(K.en);
						if (current.uid > 0) blockbtn();
					}
					if (condition === 0) { // you can send a request
						invitebtn();
					}
				} else {
					if (condition === -3) { // he's blocked you
						// you can't do anything
					}
					if (condition === -2) { // he rejected your request
						blockbtn();
					}
					if (condition === -1) { // he's invited you
						rejectbtn();
						acceptbtn();
						blockbtn();
					}
					if (condition === 0) { // both can invite
						invitebtn();
						blockbtn();
					}
				}*/

				Softkeys.add({ n: 'Join Call',
					k: 'c',
					alt: 1,
					i: 'iconcall',
					c: function () {
						Hooks.run('view', {
							name: 'call_screen',
							uid: current.link ? '@'+current.link : current.uid,
						});
						return 1;
					}
				});

				if (condition === 1) { // you're both members
					izhar(mfateeh.katabmessage);
					Recorder.itlaqsawt(2);
//					blockbtn();

					mfateeh.katabmessage.onclick = function () {
						if (!Recorder.busy()) mfateeh.messagebox.focus();
					};
					mfateeh.messagebox.onfocus = function () {
						if (!Recorder.busy()) messages_list.deselect();
						mfateeh.messagebox.oninput();
					};
					mfateeh.messagebox.oninput = function () {
						if (!Recorder.busy() && !Uploader.busy()) {
							var new_msgbox_height = mfateeh.messagebox.offsetHeight+Softkeys.get_main_height();
							setcss(messagesui, 'paddingBottom', new_msgbox_height+'px');
							
							if (new_msgbox_height != prev_msgbox_height)
								scroll_by(0, new_msgbox_height - prev_msgbox_height);
							
							prev_msgbox_height = new_msgbox_height;
							if (messages_list.murakkaz) {
								sendbtn();
							} else {
								Softkeys.remove('0-0-0-enter');
								sendbtn( nazzaf(mfateeh.messagebox.value).length ? 1 : 0 );
							}
						}
					};
					mfateeh.messagebox.uponshiftenter = function () {
						if (!Recorder.busy()) {
							var text = nazzaf(mfateeh.messagebox.value);
							if (text.length) {
								messages.irsal(text);
								sendbtn(0);
								mfateeh.messagebox.focus();
							}
//							else Recorder.record(1);
							
							scrollintoview(mfateeh.messagebox);
						}
					};

					Messages.itlaqtaxeer();

					if (needs_to_apply) {
						mfateeh.messagebox.oninput();
						if (Preferences.get(focus_msg_field, 1)) {
							mfateeh.messagebox.focus();
						}
						messages_recycler.remove_all();
						Messages.fetch();
					} else {
						// TODO figure out a better way to scroll
						if ( is_view_level() ) {
							messages_list.last();
//							messages_list.intaxabscroll( messages_list.get() );

							messages_list.rakkaz(1, 1);
						}
					}

					sendbtn();
					auxbtn();
					removebtn();
				}
			}
			needs_to_apply = 0;
		},
		irsal: async function (text) {
			var t = (current.taxeer||0) - time.now();
			if (t < 0 || isundef(current.taxeer)) {
				text = nazzaf(text);
				if (isstr(text) && text.length) {
					messages_list.message();
					var item;
//					if (last_message && !Network.is_syncing) {
//						item = last_message;
//						item.text += '\n'+text;
//					} else {
						item = {
							uid: Offline.ruid(),
							text: text,
							room: current.uid,
						};
						last_message = shallowcopy(item);
//					}
					Offline.add(module_name, shallowcopy(last_message));
					item.owner = Sessions.uid();
					item.created = Time.now();
					item.mu3allaq = 1; // TODO WHAT'S THIS
					messages_recycler.set([ item ]);
//					if ( is_view_level() ) {
//						messages_list.last();
//					}
					mfateeh.messagebox.value = '';
					Softkeys.autoheight( mfateeh.messagebox );
					mfateeh.messagebox.oninput();
				}
			} else {
				messages.itlaqtaxeer(current);
			}
		},
	};
	
	function update_softkeys() { if (mfateeh && View.is_active(module_name)) {
		mfateeh.messagebox.oninput();
		removebtn();
	} }

	Offline.create(module_name, '', {
		mfateeh: ['room'],
		tashkeel: function ({ uid, text, room, owner, created, updated }) {
			return { uid, text, room, owner, created, updated };
		},
	});

	listener('resize', function () {
		$.taxeer('resizemessages', function () { resize(); }, 100);
	});
	Hooks.set('uploader', function (nabaa) {
		if (view.is_active('messages')) {
			if (nabaa === RF3BADAA) {
				auxbtn(3);
				sendbtn(-2); // busy
			}
			if (nabaa === RF3XATAM) {
				sendbtn(3);
			}
			if (nabaa === RF3INTAHAA) {
				ixtatamphoto();
			}
		}
	});
	Hooks.set('recorder', function (nabaa) { if (View.is_active_fully(module_name)) {
		if (nabaa === MSJLXATAM) { // playback ended
			var e = mfateeh.list.querySelector('[data-playing]');
			if (e) {
				popdata(e, 'playing');
				if ( Preferences.get(autoplay_next_msg, 1) ) {
					var ps = prevsibling(e);
					if (ps) {
						var o = messages_list.adapter.get( getdata(ps, 'uid') );
						if (o && o.kind === 1) {
							messages_list.select( messages_list.id2num(o.uid) );
							messages_list.press(K.en);
						}
					}
				}
			}
		}
		if (nabaa === MSJLBADAA) {
			sendbtn(-1);
			auxbtn(1);
		}
		if (nabaa === MSJLTASJEEL) {
			sendbtn(2); // send voice
			auxbtn(2);
		}
		if (nabaa === MSJLINTAHAA) {
			auxbtn();
			sendbtn();
			$.taxeer('messagebox', function () {
				if (Recorder.attached) mfateeh.messagebox.focus();
			}, 10); // avoid 'enter' adding a linebreak
		}
	} });
	Hooks.set('ready', async function () {
		update_sidebar();

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

		Network.intercept(module_name, function (finish) {
			// receive messages updates when signed in
			finish( sessions.signedin() ? 1 : undefined );
		});
		Network.response.upload(module_name, 'photo', function (response) {
//			$.log( 'Network.response.upload messages.photo', response );
			if (response) Uploader.stop();
			else {
				Webapp.status('failed to send photo message');
			}
		});
		Network.response.upload(module_name, 'sawt', function (response) {
//			$.log( 'Network.response.upload messages.sawt', response );
			if (view.is_active('messages')) {
				if (response) {
					Recorder.itlaqsawt(2); // stop
				} else {
					Webapp.status('failed to send voice message');
				}
			}
		});
		Network.response.get(module_name, 'taxeer', function (response) {
//			$.log('get.messages.taxeer', response);
			if (isarr(response)) response.forEach(function (item) {
				messages.itlaqtaxeer(item);
			});
		});
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
				$.taxeer('messagesremove'+o.uid, function () {
					messages_recycler.remove_by_uid(o.uid);
				}, 3000);
			}
		});

		mfateeh = View.dom_keys(module_name);
		
		mfateeh.messagebox.on_focus_prev = function () {
			if (mfateeh.messagebox.value.trim().length == 0) {
				focusprev(mfateeh.messagebox);
			}
		};
		
		resize();

		create_access( module_name, 'send', 'Send Messages' );

		messages_list = List( mfateeh.list ).idprefix(module_name).listitem('messageitem')
//						.prevent_focus(1)
						;
		
		messages_recycler = Recycler( messages_list, module_name );
		messages_recycler.set_reversed( 1 );
		messages_recycler.add_view( module_name );
		messages_recycler.set_phrase( 'next', 'Older' );
		messages_recycler.set_phrase( 'prev', 'Newer' );
		messages_recycler.add_intercept(async function (need, payload) {
			if (current && current.uid) {
				payload.room = current.uid;
				return 1;
			} else {
				return 0;
			}
		});
		messages_recycler.add_postcept(async function (need, payload) {
			if (current) {
				return payload.room == current.uid;
			}
			else return 0;
		});
		
		messages_list.on_focus =
		messages_list.on_selection =
		messages_list.on_deselection = function () {
			update_softkeys();
		};
		messages_list.uponpaststart = function () {
			this.first(); return 1;
		};
		messages_list.before_set = function (item) {
			if (['next', 'prev'].includes(item.uid)) return item;
			
			item.size_str = 'ixtaf';
			var t = item.removetaxeer, s = 'ixtaf';
			if (item.remove || !isundef(t)) s = 'will remove ';
			if (item.remove > 1) {
				var msg_name = 'msg';
				if (item.kind == 1) msg_name = 'voice msg';
				if (item.kind == 2) msg_name = 'photo';
				item.text = 'this '+msg_name+' was deleted';
				s = 'ixtaf';
			} else {
				if (item.size) {
					item.size_str = item.size+'kB';
				}
			}
			
			item.removestr = s; // the countdown to removal
			
			if (item.kind === 1 && !item.muntahaa) {
				item.text = '...';
			}
			
			if (item.text) {
				item.text_preview = item.text.slice(0, 480);
				if (item.text.length > 480) {
					item.text_preview += '...';
				}
			}
			
			return item;
		};
		messages_list.after_set = function (item, clone, k) {
			if (['next', 'prev'].includes(item.uid)) return;

			if (item.text && item.text.length > 480) {
				innertext(k.more_str, 'Tap for more');
				izhar(k.more_str);
			} else {
				ixtaf(k.more_str);
			}
			
			var t = item.removetaxeer;
			if (item.remove || isundef(t)) {
				popdata(k.removetime, 'time');
				innertext(k.removetime, '');
			}
			else if (!isundef(t)) {
				var s = 0;
				if (t === 1) s = 5;
				else if (t === 2) s = 15;
				else if (t === 3) s = 30;
				else if (t === 4) s = 60;
				setdata(k.removetime, 'time', time.now()+(s*1000));
				time(clone);
			}
			if (item.remove > 1) {
				setdata(clone, 'mahvoof', 1);
			} else {
				popdata(clone, 'mahvoof');
			}
			
			if (item.kind) setdata(clone, 'kind', item.kind);
			
			innerhtml( k.text_preview, Markdown.render( item.text_preview ) );
			var all_links = k.text_preview.querySelectorAll('a');
			all_links.forEach(function (e) {
				e.onclick = function () {
					// TODO internal vs external links
					return false;
				};
			});
			
			if (item.kind === 1) {
				if (item.remove > 1) {
					ixtaf(k.hafr);
				} else {
					izhar(k.hafr);
					if (!item.muntahaa) { // BUG rethink this for Recycler on_out, on_in
						var src = location.protocol+'//'+location.host+'/'+item.address;
						sawthafr.drawaudio(k.hafr, src, 0, 3).then(function (audbuf, filtered, size) {
							var dur = audbuf.duration;
							if (isnum(dur)) {
								dur = Math.round(dur);
								innerhtml(k.text_preview,
									'<b>'+dur+'s</b> <small>'+Math.round(size/1024)+'kB'+'</small>');
								item.muntahaa = 2;
							}
						});
						item.text = undefined;
						item.muntahaa = 1;
					}
				}
			}
			if (item.kind === 2) {
				if (item.remove > 1) {
					ixtaf(k.hafr);
					k.hafr.parentElement.classList.add('pad', 'padv');
					setcss(k.hafr, 'background-image', '');
				} else {
					izhar(k.hafr);
					k.hafr.parentElement.classList.remove('pad', 'padv');
					var img = createelement('div', 'preview2');
					k.hafr.replaceWith( img );
					k.hafr = img;
					setdata(k.hafr, 'id', 'hafr');
					
					var src = location.protocol+'//'+location.host+'/'+item.address;
					setcss(k.hafr, 'background-image', 'url('+src+')');
				}
			}

			// the photo padder code was here
			
			setdata(k.waqtqabl, 'time', item.created);
		};
		messages_list.onpress = function (item, key, uid) {
			if (item && key === K.en) {
				if (item.kind === 0) {
					if (item.text && item.text.length > 480) {
						Hooks.run('view', {
							name: 'message',
							uid: item.uid,
						});
					}
				}
				if (item.kind === 1 && !item.remove) {
					Recorder.play(Network.make_address(item.address));
					var clone = messages_list.get( messages_list.id2num( item.uid ) );
					if (clone) setdata(clone, 'playing', 1);
				}
				if (item.kind === 2 && !item.remove) {
					messages.iftahphoto(item);
				}
			}
			if (item && !item.remove && key === '0') {
				var t = item.removetaxeer, s;
				if (isundef(t)) t = 1, s = 5; // 5s
				else if (t === 1) t = 2, s = 15; // 15s
				else if (t === 2) t = 3, s = 30; // 30s
				else if (t === 3) t = 4, s = 60; // 1m
				else if (t === 4) t = undefined; // cancel
				item.removetaxeer = t;
				if (t) $.taxeer('removetaxeer'+item.uid, function () {
					Offline.remove('messages', { uid: item.uid });
					item.remove = 1;
					messages_list.set(item);
				}, s*1000);
				else $.taxeercancel('removetaxeer'+item.uid);
				messages_list.set(item);
			}
		};
		messages_list.uponpastend = function () {
			messages_list.deselect();
			mfateeh.messagebox.focus();
			return 1;
		};
	});
	async function get_message(uid) {
		var message = await Offline.fetch( module_name, 0, { filter: { uid } } );
		return message[0];
	}
	async function get_room_and_setup_view() {
		var uid = View.get_uid();
		if (uid) { // fetch room
			if (needs_to_apply) {
				Messages.update_list([]);
				messages_list.message('Getting room details...');
				current = await Rooms.get_room(uid);
			}

			if ( View.is_active(module_name) ) {
				Messages.itlaq();
				update_sidebar();
			}
		} else {
			// QUESTION TODO idk offer a way back to rooms list or home?
		}
	}
	Hooks.set('view-init', async function (args) {
		update_sidebar();

		switch (args.name) {
			case 'messages':
				if (args.uid) {
					needs_to_apply = 1;
					if (current) {
						if (args.uid.startsWith('@'))
							needs_to_apply = args.uid.slice(1) !== current.link;
						else
							needs_to_apply = args.uid !== current.uid;
					}

					await get_room_and_setup_view();

					Recorder.attach(mfateeh);
					Recorder.stop();
					Uploader.attach(mfateeh);
					Uploader.stop();
					
					set_sidebar_and_header();
				}
				break;
			case 'message':
				if (args.uid) {
					Webapp.header(['Full Message', 'Loading...', 'iconmessage']);
					var keys = View.dom_keys(args.name);
					innerhtml(keys.list, '');
					var msg = await get_message(args.uid), account_name = '';
					if (msg) {
						var account = await Accounts.fetch(msg.owner);
						if (account) {
							account_name = Accounts.get_name(account);
						}
					}
					if ( View.is_active_fully(args.name) ) {
						if ( msg ) {
							Webapp.header(['Full Message', account_name, 'iconmessage']);
							innerhtml(keys.list, Markdown.render(msg.text));
						} else {
							Webapp.header(['Message Not Found', '', 'iconmessage']);
							innerhtml(keys.list, '');
						}
					}
				}
				break;
			default:
				if (!View.is_active_fully(module_name)) {
					Recorder.infasal();
					Uploader.detach();
				}
				break;
		}
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
	Hooks.set(sheet_ready, async function (args, k) { if (args.name == view_photo_sheet) {
		Sheet.set_title('Photo Message');
		var suid = Sessions.uid(); // TODO CHECK

		if (args.uid) {
			var message = await get_message(args.uid);
			if (Sheet.get_active() == view_photo_sheet && message) {
				if (message.uid === Sheet.get_active_uid() && Backstack.darajah == 2) {
					k.preview.src = location.protocol+'//'+location.host+'/'+message.address;
					Softkeys.add({ n: 'Downlaod',
						k: K.sl,
						i: 'iconfiledownload',
						c: function () {
							tahmeel(args.uid+'.jpg', k.preview.src, false, false);
						},
					});
				}
			}
		}
	} });

})();

