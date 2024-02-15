// TODO coming back to the same room from a sheet shouldn't reload the messages
var Messages, messages, messages_list;
;(function(){
	var mfateeh, oldresults = [], current, last_message, module_name = 'messages',
	needs_to_apply, haadirsawt, debug_messages = 1,
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
				mfateeh.messagebox.focus();
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
		return (text || '').trim().replace(/[\n]{3,}/g, '\n\n');;
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
	rejectbtn = function () { if ( View.is_active(module_name) ) {
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
	unblockbtn = function () { if ( View.is_active(module_name) ) {
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
	blockbtn = function () { if ( View.is_active(module_name) ) {
		softkeys.set('7', function () { Hooks.run('dialog', {
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
	invitebtn = function () { if ( View.is_active(module_name) ) {
		var uxr = rooms.is_other(current.members);
		softkeys.set(K.sl, function () {
			rooms.invite(uxr[0]);
			softkeys.set(K.sl, function () {
				Webapp.status( xlate('mashghool') );
			}, 0, 'iconhourglassempty');
		}, 0, 'iconpersonadd');
	}},
	sendbtn = function (sinf) { if ( View.is_active(module_name) ) {
		var icon = 'iconkeyboardvoice', name = 'Voice';
		if (sinf === -2) icon = 'iconhourglassempty', name = 'Converting...';
		else if (sinf === -1) icon = 'iconpause', name = 'Pause';
		else if ([1, 2, 3].includes(sinf)) icon = 'iconsend', name = 'Send';
		Softkeys.add({ k: K.en,
			n: name,
			c: function () {
				if (sinf === 1)
					mfateeh.messagebox.uponenter();
				else if (sinf === -2) { // busy
				} else if (sinf === -1) { // pause
					Recorder.pause();
				} else if (sinf === 2) {
					if (Recorder.tasjeel)
						Network.upload( 'messages', 'sawt', current.uid, Recorder.tasjeel );
				} else if (sinf === 3) {
					if (Uploader.marfoo3)
						Network.upload( 'messages', 'photo', current.uid, Uploader.marfoo3 );
				} else
					Recorder.isjal(1);
			},
			i: icon,
		});
	}},
	auxbtn = function (sinf) { if ( View.is_active(module_name) ) {
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
	acceptbtn = function () { if ( View.is_active(module_name) ) {
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
	removebtn = function () { if ( View.is_active(module_name) ) {
		if (messages_list.murakkaz) {
			Softkeys.add(removebtn_object);
		} else if (removebtn_object && removebtn_object.uid) {
			Softkeys.remove(removebtn_object.uid);
		}
	}};
	
	Messages = messages = {
		iftahphoto: function (item) {
			item && Hooks.run('sheet', {
				n: 'messagephoto',
				t: 'messagephoto',
				c: function () { // on yes/callback aka pressing K.sl
					
				},
				i: function (k) { // on init
					k.preview.src = Network.xitaab+item.xitaab;
				},
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
			
			if (do_scroll && View.is_active(module_name) )
				messages_list.last();
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
						if (!Recorder.mashghool()) mfateeh.messagebox.focus();
					};
					mfateeh.messagebox.onfocus = function () {
						if (!Recorder.mashghool()) messages_list.deselect();
					};
					mfateeh.messagebox.oninput = function () {
						if (!Recorder.mashghool() && !Uploader.mashghool()) {
							setcss(messagesui, 'paddingBottom',
									(mfateeh.messagebox.offsetHeight+Softkeys.get_main_height())+'px');
							sendbtn( nazzaf(mfateeh.messagebox.value).length ? 1 : 0 );
						}
					};
					mfateeh.messagebox.uponenter = function () {
						if (!Recorder.mashghool()) {
							var text = nazzaf(mfateeh.messagebox.value);
							if (text.length) {
								messages.irsal(text);
								sendbtn();
								mfateeh.messagebox.focus();
							}
							else Recorder.isjal(1);
							
							scrollintoview(mfateeh.messagebox);
						}
					};

					Messages.itlaqtaxeer();

					if (needs_to_apply) {
						mfateeh.messagebox.oninput();
						mfateeh.messagebox.focus();
						messages_list.popall();
						messages.fetch();
					} else {
						// TODO figure out a better way to scroll
						if ( View.is_active(module_name) ) {
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
		irsal: function (text) {
			var t = (current.taxeer||0) - time.now();
			if (t < 0 || isundef(current.taxeer)) {
				text = nazzaf(text);
				if (isstr(text) && text.length) {
					messages_list.message();
					var item;
					if (last_message && !Network.is_syncing) {
						item = last_message;
						item.text += '\n'+text;
					} else {
						item = {
							uid: Offline.ruid(),
							text: text,
							room: current.uid,
						};
						last_message = shallowcopy(item);
					}
					Offline.add(module_name, shallowcopy(last_message));
					item.owner = sessions.uid();
					item.created = time.now();
					item.mu3allaq = 1; // TODO WHAT'S THIS
					messages_list.set(item);
					if ( View.is_active(module_name) ) {
						messages_list.last();
					}
					mfateeh.messagebox.value = '';
				}
			} else {
				messages.itlaqtaxeer(current);
			}
		},
	};
	
	function update_softkeys() {
		if (mfateeh) {
			mfateeh.messagebox.oninput();
			removebtn();
		}
	}

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
	Hooks.set('recorder', function (nabaa) {
		if (view.is_active('messages')) {
			if (nabaa === MSJLXATAM) {
				var e = mfateeh.list.querySelector('[data-la3ib]');
				if (e) {
					popdata(e, 'la3ib');
					var ns = nextsibling(e);
					if (ns) {
						var o = messages_list.adapter.get( getdata(ns, 'uid') );
						if (o && o.kind === 1) {
							messages_list.select( messages_list.id2num(o.uid) );
							messages_list.press(K.en);
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
					if (Recorder.mulhaq) mfateeh.messagebox.focus();
				}, 10); // avoid 'enter' adding a linebreak
			}
		}
	});
	Hooks.set('ready', function () {
		Network.intercept(module_name, function (intahaa) {
			// receive messages updates when signed in
			intahaa( sessions.signedin() ? 1 : undefined );
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
					messages_list.set( response );
					// TODO scroll into view?
					if ( View.is_active(module_name) ) {
						messages_list.last();
					}
				}
			}
		});
		Offline.response.remove(module_name, function (response) {
//			$.log( 'Offline.response.remove messages', response );
			var o = messages_list.adapter.get(response);
			if (o) {
				o.text = 'this msg was deleted';
				messages_list.set(o);
				$.taxeer('messagesremove'+response, function () {
					messages_list.pop(response);
				}, 3000);
			}
		});

		mfateeh = View.dom_keys(module_name);
		
		resize();

		messages_list = List( mfateeh.list ).idprefix(module_name).listitem('messageitem')
//						.prevent_focus(1)
						;
		
		messages_list.on_focus =
		messages_list.on_selection =
		messages_list.on_deselection = function () {
			update_softkeys();
		};
		messages_list.uponpaststart = function () { this.first(); return 1; };
		messages_list.beforeset = function (item) {
			var t = item.removetaxeer, s = 'ixtaf';
			if (item.remove || !isundef(t)) s = 'izhar';
			if (item.remove > 1) item.text = 'this msg was deleted', s = 'ixtaf';
			item.removestr = s;
			
			if (item.kind === 1 && !item.muntahaa) {
				item.text = '...';
			}
			
			return item;
		};
		messages_list.afterset = function (item, clone, k) {
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
			
			if (item.kind === 1 && !item.muntahaa) {
				var src = Network.xitaab+item.xitaab;
				izhar(k.hafr);
				sawthafr.drawaudio(k.hafr, src, 0, 6).then(function (audbuf, filtered, size) {
					var dur = audbuf.duration;
					if (isnum(dur)) {
						dur = Math.round(dur);
						innerhtml(k.text, '<b>'+dur+'s</b> <small>'+Math.round(size/1024)+'kB'+'</small>');
						item.muntahaa = 2;
					}
				});
				item.text = undefined;
				item.muntahaa = 1;
			}
			if (item.kind === 2) {
				izhar(k.hafr);
				var img = createelement('img', 'preview2');
				k.hafr.replaceWith( img );
				k.hafr = img;
				setdata(k.hafr, 'id', 'hafr');
				k.hafr.src = Network.xitaab+item.xitaab;
			}
			
			var ps = prevsibling(clone), yes = 1, margin = 0;
			if (ps) {
				var pskeys = templates.keys(ps);
				var previtem = messages_list.adapter.get( getdata(ps, 'uid') );
				if (previtem) {
					if (item.owner === previtem.owner) yes = 0;
					if (!pskeys.padder.hidden) margin = 1;
				}
			}
			setdata(k.waqtqabl, 'time', item.created);
			if (margin && yes) setdata(clone, 'margin', 1);
			else popdata(clone, 'margin');
			if (clone && yes) {
				k.padder.hidden = 0;
				setdata(clone, 'hasphoto', 1);
				// stable color
				var unique_color = Themes.generate_predictable_color(item.owner);
				setcss(k.photo, 'background-color', Themes.darken_hex_color(unique_color, 130, .5) );
				setcss(k.photo, 'color', Themes.brighten_hex_color(unique_color, 130, .7) );

				$.taxeer('messagesphoto'+item.uid, async function () {
					setcss(k.photo, 'opacity', 1);
					setcss(k.photo, 'height');
					var account = await Accounts.fetch(item.owner);
					if (account) {
						var account_name = '';
						if (account.displayname)
							account_name = account.displayname;
						else if (account.name)
							account_name = '@'+account.name;

						innertext(k.name, account_name);
						innertext(k.photo, account.name.slice(0, 3));
						
						$.taxeer('scroll-message-into-view', function () { if ( View.is_active(module_name) ) {
							// TODO figure out a better way to scroll
							var last_element = messages_list.get_item_element( messages_list.selected );
							if (last_element) {
								scroll_into_view_with_padding( last_element, [Webapp.get_tall_screen_height(), 0, 200, 0] );
							}
						} });
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
				popdata(clone, 'hasphoto');
				setcss(k.photo, 'height', 0);
				setcss(k.photo, 'opacity', 0);
			}
		};
		messages_list.onpress = function (item, key, uid) {
			if (item && key === K.en) {
				if (item.kind === 0) {
					haadirsawt && haadirsawt.intahaa();
					haadirsawt = sawtkaatib.minhuroof(item.text);
					var rb = mfateeh.messagebox;
					rb.value = '';
					var str = '';
					haadirsawt.uponsawt = function (v) {
						str += v;
						if (v == ' ') {
							setcss(rb, 'height', 0);
							if (rb.scrollHeight > rb.offsetHeight)
								setcss(rb, 'height', rb.scrollHeight+3+'px');
						}
						rb.value = str;
					};
				}
				if (item.kind === 1) {
					Recorder.il3ab(Network.xitaab+item.xitaab)
					var clone = messages_list.get( messages_list.id2num( item.uid ) );
					if (clone) setdata(clone, 'la3ib', 1);
				}
				if (item.kind === 2) {
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
			}
		} else {
			// QUESTION TODO idk offer a way back to rooms list or home?
		}
	}
	Hooks.set('viewready', function (args) {
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

					get_room_and_setup_view();

					Recorder.iltahaq(mfateeh);
					Recorder.intahaa();
					Uploader.attach(mfateeh);
					Uploader.stop();
				}
				break;
			default:
				Recorder.infasal();
				Uploader.detach();
				break;
		}
	});
})();