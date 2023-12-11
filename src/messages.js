var messages;
;(function(){
	var messageslist, mfateeh, oldresults = [], current, last_message,
	yahtaajuitlaq, haadirsawt,
	text2seconds = function (text) { // secs
		var c = text.length;
		return Math.ceil( c / 10 ) || 1;
	},
	ixtatamphoto = function () {
		var ismessages = view.is_active('messages');
		if (mfateeh) {
			mfateeh.uploadphoto.value = '';
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
			var iw = innerwidth();
			setcss(mfateeh.katabmessage, 'left', (iw>640?(iw-640)/2:0)+'px');
			setcss(mfateeh.katabmessage, 'right', (iw>640?(iw-640)/2:0)+'px');
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
			hisaabaat.get(members, function (nataaij) {
				nataaij.forEach(function (o) {
					photo = setshakl(o, mfateeh.members, 1);
					photo.zoomlevel = .3;
					photo.panned.y = 25;
					photo.jaddad();
				});
			});
		}, 50);*/
	},
	rejectbtn = function () {
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
	},
	unblockbtn = function () {
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
	},
	blockbtn = function () {
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
	},
	invitebtn = function () {
		var uxr = rooms.uxraa(current.members);
		softkeys.set(K.sl, function () {
			rooms.da3wah(uxr[0]);
			softkeys.set(K.sl, function () {
				Webapp.status( xlate('mashghool') );
			}, 0, 'iconhourglassempty');
		}, 0, 'iconpersonadd');
	},
	sendbtn = function (sinf) {
		var icon = 'iconkeyboardvoice';
		if (sinf === -2) icon = 'iconhourglassempty';
		else if (sinf === -1) icon = 'iconpause';
		else if ([1, 2, 3].includes(sinf)) icon = 'iconsend';
		softkeys.set(K.en, function () {
			if (sinf === 1)
				mfateeh.messagebox.uponenter();
			else if (sinf === -2) { // busy
			} else if (sinf === -1) { // pause
				// TODO
			} else if (sinf === 2) {
				if (Recorder.tasjeel)
					Network.upload( 'messages', 'sawt', current.uid, Recorder.tasjeel );
			} else if (sinf === 3) {
				if (Uploader.marfoo3)
					Network.upload( 'messages', 'photo', current.uid, Uploader.marfoo3 );
			} else
				Recorder.isjal(1);
		}, 0, icon);
	},
	auxbtn = function (sinf) {
		var icon = 'iconphoto';
		if ([2, 3].includes(sinf)) icon = 'icondeleteforever';
		else if (sinf === 4) icon = 'icondownload';
		else if (sinf) icon = 'iconstop';
		softkeys.set(K.sl, function () {
			if (sinf === 3) {
				Uploader.stop();
			} else if (sinf === 4) {
			} else if (sinf) {
				Recorder.itlaqsawt(sinf);
			} else {
				mfateeh.uploadphoto.click();
			}
		}, 0, icon);
	},
	acceptbtn = function () {
		softkeys.set(K.en, function () {
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
		}, 0, 'icondone');
	};
	
	messages = {
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
		itlaqhaalah: function (m) {
			if (m && current) {
				var ret = rooms.uxraa(current.members);
				var ret2 = rooms.uxraa(m.members);
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
		jaddad: function () {
			if (current)
			Offline.get('messages', 0, {
				filter: {
					room: current.uid,
				},
			}, helpers.now());
		},
		fahras: function (results) {
			results = results || oldresults || [];
			results.sort(function (a, b) {
				return a.created - b.created;
			});
			
			messageslist.message(results.length ? undefined : translate('nomessages') );
			
			results.forEach(function (item, i) {
				messageslist.set(item);
			});
			
//			if (view.is_active('messages')) {
//				messageslist.select();
//			}
			
			oldresults = results;
			
			messageslist.last();
		},
		iftah: function (item, an3ash) { // open messages
			if (item) {
				if (!current || current.uid !== item.uid) {
					yahtaajuitlaq = 1;
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
					pager.intaxab('rooms', 1);
					view.ishtaghal('messages');
					messageslist.message( xlate('bahacroom') );
					var ret = rooms.uxraa(current.members);
					if (ret)
					rooms.bahac(ret[0], function (m) {
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
			if (current) {
				Webapp.header();
				if (yahtaajuitlaq) {
					softkeys.clear();
					softkeys.P.empty();
					softkeys.list.basic(messageslist);
				}
				softkeys.set(K.sr, function () {
					messages.current(1);
					pager.intaxab('rooms', 1);
				}, 0, 'iconarrowback');
				var suid = sessions.uid(),
					rkb = rooms.raakib(current.members),
					uxr = rooms.uxraa(current.members),
					haalah = rooms.haalah(current),
					byyou = haalah[1],
					msg = haalah[2],
					haalah = haalah[0];
					
				messageslist.message( xlate( msg, '' ) );

				if (yahtaajuitlaq)
				hisaabaat.get([uxr[0]], function (nataaij) {
					nataaij.forEach(function (o) {
						photo = setshakl(o, mfateeh.photo);
						photo.zoomlevel = .25;
						photo.panned.y = 25;
						photo.jaddad();
						var name = o.displayname || o.username;
						innertext( mfateeh.mowdoo3, name );
						messageslist.message( xlate( msg, name ) );
					});
				});
				ixtaf(mfateeh.katabmessage);
				if (byyou) { // is by you
					if (haalah === -3) { // you blocked him
						unblockbtn();
					}
					if (haalah === -2) { // you rejected his request
						blockbtn();
					}
					if (haalah === -1) { // you invited him
						softkeys.talaf(K.en);
						if (current.uid > 0) blockbtn();
					}
					if (haalah === 0) { // you can send a request
						invitebtn();
					}
				} else {
					if (haalah === -3) { // he's blocked you
						// you can't do anything
					}
					if (haalah === -2) { // he rejected your request
						blockbtn();
					}
					if (haalah === -1) { // he's invited you
						rejectbtn();
						acceptbtn();
						blockbtn();
					}
					if (haalah === 0) { // both can invite
						invitebtn();
						blockbtn();
					}
				}

				if (haalah === 1) { // you're both members
					izhar(mfateeh.katabmessage);
					Recorder.itlaqsawt(2);
					blockbtn();

					mfateeh.katabmessage.onclick = function () {
						if (!Recorder.mashghool()) mfateeh.messagebox.focus();
					};
					mfateeh.messagebox.onfocus = function () {
						if (!Recorder.mashghool()) messageslist.deselect();
					};
					mfateeh.messagebox.oninput = function () {
						if (!Recorder.mashghool() && !Uploader.mashghool()) {
							setcss(messagesui, 'paddingBottom',
									(mfateeh.messagebox.offsetHeight+10)+'px');
							sendbtn( nazzaf(mfateeh.messagebox.value).length ? 1 : 0 );
						}
					};
					mfateeh.messagebox.uponenter = function () {
						if (!Recorder.mashghool()) {
							var text = nazzaf(mfateeh.messagebox.value);
							if (text.length) {
								messages.irsal(text);
								mfateeh.messagebox.focus();
							}
							else Recorder.isjal(1);
							
							scrollintoview(mfateeh.messagebox);
						}
					};

					messages.itlaqtaxeer();

					if (yahtaajuitlaq) {
						mfateeh.messagebox.oninput();
						mfateeh.messagebox.focus();
						messageslist.popall();
						messages.jaddad();
					} else {
						messageslist.intaxabscroll( messageslist.get() );
						messageslist.rakkaz(1, 1);
					}

					sendbtn();
					auxbtn();
					softkeys.set('0', function () {
						messageslist.press('0');
					}, '0', 'icondeleteforever');
				}
			}
			yahtaajuitlaq = 0;
		},
		irsal: function (text) {
			var t = (current.taxeer||0) - time.now();
			if (t < 0 || isundef(current.taxeer)) {
				text = nazzaf(text);
				if (isstr(text) && text.length) {
					messageslist.message();
					var item;
					if (last_message) {
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
					Offline.add('messages', shallowcopy(last_message));
					item.maalik = sessions.uid();
					item.created = time.now();
					item.mu3allaq = 1;
					messageslist.set(item);
					messageslist.last();
					mfateeh.messagebox.value = '';
				}
			} else {
				messages.itlaqtaxeer(current);
			}
		},
	};

	Offline.create('messages', '', {
		mfateeh: ['room'],
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
						var o = messageslist.adapter.get( getdata(ns, 'uid') );
						if (o && o.sinf === 1) {
							messageslist.select( messageslist.id2num(o.uid) );
							messageslist.press(K.en);
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
		Network.intercept('messages', function (intahaa) {
			// receive messages updates when signed in
			intahaa( sessions.signedin() ? 1 : undefined );
		});
		Network.response.upload('messages', 'photo', function (response) {
//			$.log( 'Network.response.upload messages.photo', response );
			if (response) Uploader.stop();
			else {
				Webapp.status('failed to send photo message');
			}
		});
		Network.response.upload('messages', 'sawt', function (response) {
//			$.log( 'Network.response.upload messages.sawt', response );
			if (view.is_active('messages')) {
				if (response) {
					Recorder.itlaqsawt(2); // stop
				} else {
					Webapp.status('failed to send voice message');
				}
			}
		});
		Network.response.get('messages', 'taxeer', function (response) {
//			$.log('get.messages.taxeer', response);
			if (isarr(response)) response.forEach(function (item) {
				messages.itlaqtaxeer(item);
			});
		});
		Offline.response.get('messages', function (response) {
//			$.log( 'Offline.response.get messages' );
			messages.fahras( response );
		});
		Offline.response.add('messages', function (response) {
//			$.log( 'Offline.response.add messages' );
			if (response && current) {
				if (response.room === current.uid) {
					if (last_message) {
						if (last_message.uid === response.ruid) {
							last_message = 0;
						}
					}
					messageslist.set( response );
				}
			}
		});
		Offline.response.remove('messages', function (response) {
//			$.log( 'Offline.response.remove messages', response );
			var o = messageslist.adapter.get(response);
			if (o) {
				o.text = 'this msg was deleted';
				messageslist.set(o);
				$.taxeer('messagesremove'+response, function () {
					messageslist.pop(response);
				}, 3000);
			}
		});

		mfateeh = view.mfateeh('messages');
		
		resize();

		messageslist = list( mfateeh.list ).idprefix('messages')
						.listitem('messageitem');
		
		messageslist.uponpaststart = function () { this.first(); return 1; };
		messageslist.beforeset = function (item) {
			var t = item.removetaxeer, s = 'ixtaf';
			if (item.remove || !isundef(t)) s = 'izhar';
			if (item.remove > 1) item.text = 'this msg was deleted';
			item.removestr = s;
			
			if (item.sinf === 1 && !item.muntahaa) {
				item.text = '...';
			}
			
			return item;
		};
		messageslist.afterset = function (item, clone, k) {
			var t = item.removetaxeer;
			if (item.remove || isundef(t)) {
				popdata(k.removewaqt, 'time');
				innertext(k.removewaqt, '');
			}
			else if (!isundef(t)) {
				var s = 0;
				if (t === 1) s = 5;
				else if (t === 2) s = 15;
				else if (t === 3) s = 30;
				else if (t === 4) s = 60;
				setdata(k.removewaqt, 'time', time.now()+(s*1000));
				time(clone);
			}
			if (item.remove > 1) {
				setdata(clone, 'mahvoof', 1);
			} else {
				popdata(clone, 'mahvoof');
			}
			
			if (item.sinf === 1 && !item.muntahaa) {
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
			if (item.sinf === 2) {
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
				var previtem = messageslist.adapter.get( getdata(ps, 'uid') );
				if (previtem) {
					if (item.maalik === previtem.maalik) yes = 0;
					if (!pskeys.padder.hidden) margin = 1;
				}
			}
			setdata(k.waqtqabl, 'time', item.created);
			if (margin && yes) setdata(clone, 'margin', 1);
			else popdata(clone, 'margin');
			if (clone && yes) {
				k.padder.hidden = 0;
				setdata(clone, 'hasphoto', 1);
				$.taxeer('messagesphoto'+item.uid, function () {
					setcss(k.photo, 'opacity', 1);
					setcss(k.photo, 'height');
					hisaabaat.get([item.maalik], function (nataaij) {
						nataaij.forEach(function (o) {
							photo = setshakl(o, k.photo);
							photo.zoomlevel = .25;
							photo.panned.y = 25;
//							photo.mowdoo3( o.username.substr(0, 6) );
							photo.jaddad();
						});
					});
				}, 50);
			} else {
				k.padder.hidden = 1;
				popdata(clone, 'hasphoto');
				setcss(k.photo, 'height', 0);
				setcss(k.photo, 'opacity', 0);
			}
		};
		messageslist.onpress = function (item, key, uid) {
			if (item && key === K.en) {
				if (item.sinf === 0) {
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
				if (item.sinf === 1) {
					Recorder.il3ab(Network.xitaab+item.xitaab)
					var clone = messageslist.get( messageslist.id2num( item.uid ) );
					if (clone) setdata(clone, 'la3ib', 1);
				}
				if (item.sinf === 2) {
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
					messageslist.set(item);
				}, s*1000);
				else $.taxeercancel('removetaxeer'+item.uid);
				messageslist.set(item);
			}
		};
		messageslist.uponpastend = function () {
			messageslist.deselect();
			mfateeh.messagebox.focus();
			return 1;
		};
	});
	Hooks.set('viewready', function (args) {
		switch (args.name) {
			case 'messages':
				if (current) {
					Recorder.iltahaq(mfateeh);
					Recorder.intahaa();
					Uploader.attach(mfateeh);
					Uploader.stop();
					messages.itlaq();
				}
				break;
			default:
				Recorder.infasal();
				Uploader.detach();
				break;
		}
	});
})();