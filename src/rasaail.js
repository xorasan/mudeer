//+ fahras iftah mowjoodah
var rasaail;
;(function(){
	var rasaaillist, mfateeh, oldresults = [], mowjoodah, risaalahsaabiqah,
	yahtaajuitlaq, haadirsawt,
	matn2caaniyaat = function (matn) { // secs
		var c = matn.length;
		return Math.ceil( c / 10 ) || 1;
	},
	ixtatamsoorah = function () {
		var israsaail = view.axav() === 'XPO.rasaail';
		if (mfateeh) {
			mfateeh.rafa3soorah.value = '';
			mfateeh.preview.src = '';
			izhar(mfateeh.matn);
			ixtaf(mfateeh.photo);
			if (israsaail) {
				mfateeh.risaalahbox.focus();
				isfun(mfateeh.risaalahbox.oninput) && mfateeh.risaalahbox.oninput();
			}
		}
		if (israsaail) auxbtn();
	},
	resize = function () {
		if (mfateeh) {
			var iw = innerwidth();
			setcss(mfateeh.katabrisaalah, 'left', (iw>640?(iw-640)/2:0)+'px');
			setcss(mfateeh.katabrisaalah, 'right', (iw>640?(iw-640)/2:0)+'px');
			mfateeh.risaalahbox.oninput && mfateeh.risaalahbox.oninput();
		}
	},
	nazzaf = function (matn) {
		return (matn || '').trim().replace(/[\n]{3,}/g, '\n\n');;
	},
	doa3daa = function () {
		/*$.taxeer('XPO.a3daa'+mowjoodah.uid, function () {
			innerhtml(mfateeh.a3daa, '');
			var a3daa = [];
			mowjoodah.a3daa && mowjoodah.a3daa.forEach(function (o) {
				a3daa.push(o[0]);
			});
			hisaabaat.axav(a3daa, function (nataaij) {
				nataaij.forEach(function (o) {
					soorah = setshakl(o, mfateeh.a3daa, 1);
					soorah.zoomlevel = .3;
					soorah.panned.y = 25;
					soorah.jaddad();
				});
			});
		}, 50);*/
	},
	rejectbtn = function () {
		softkeys.set(K.sl, function () {
			var m = {
				uid: mowjoodah.uid,
				a3daa: mowjoodah.a3daa,
			};
			mowjoodah.a3daa.forEach(function (o) {
				if (o[0] === sessions.uid()) {
					o[1] = -2;
					m.pending = 1;
				}
			});
			maxzan.adaaf('XPO.mukaalamaat', m);
			rasaail.itlaq();
		}, 0, 'XPO.iconclose');
	},
	unblockbtn = function () {
		softkeys.set(K.sl, function () {
			var m = {
				uid: mowjoodah.uid,
				a3daa: mowjoodah.a3daa,
			};
			mowjoodah.a3daa.forEach(function (o) {
				if (o[0] === sessions.uid()) {
					o[1] = 0;
					m.pending = 1;
				}
			});
			maxzan.adaaf('XPO.mukaalamaat', m);
			rasaail.itlaq();
		}, 0, 'XPO.iconpersonadd');
	},
	blockbtn = function () {
		softkeys.set('7', function () { Hooks.run('XPO.dialog', {
			m: 'XPO.asa3ab',
			c: function () {
				var m = {
					uid: mowjoodah.uid,
					a3daa: mowjoodah.a3daa,
				};
				mowjoodah.a3daa.forEach(function (o) {
					if (o[0] === sessions.uid()) {
						o[1] = -3;
						m.pending = 1;
					}
				});
				maxzan.adaaf('XPO.mukaalamaat', m);
				rasaail.itlaq();
			}
		}); }, '7', 'XPO.iconblock');
	},
	invitebtn = function () {
		var uxr = mukaalamaat.uxraa(mowjoodah.a3daa);
		softkeys.set(K.sl, function () {
			mukaalamaat.da3wah(uxr[0]);
			softkeys.set(K.sl, function () {
				webapp.itlaa3( xlate('XPO.mashghool') );
			}, 0, 'XPO.iconhourglassempty');
		}, 0, 'XPO.iconpersonadd');
	},
	sendbtn = function (sinf) {
		var icon = 'XPO.iconkeyboardvoice';
		if (sinf === -2) icon = 'XPO.iconhourglassempty';
		else if (sinf === -1) icon = 'XPO.iconpause';
		else if ([1, 2, 3].includes(sinf)) icon = 'XPO.iconsend';
		softkeys.set(K.en, function () {
			if (sinf === 1)
				mfateeh.risaalahbox.uponenter();
			else if (sinf === -2) { // busy
			} else if (sinf === -1) { // pause
				// TODO
			} else if (sinf === 2) {
				if (musajjal.tasjeel)
					shabakah.rafa3( 'XPO.rasaail', 'XPO.sawt', mowjoodah.uid, musajjal.tasjeel );
			} else if (sinf === 3) {
				if (raafi3.marfoo3)
					shabakah.rafa3( 'XPO.rasaail', 'XPO.soorah', mowjoodah.uid, raafi3.marfoo3 );
			} else
				musajjal.isjal(1);
		}, 0, icon);
	},
	auxbtn = function (sinf) {
		var icon = 'XPO.iconphoto';
		if ([2, 3].includes(sinf)) icon = 'XPO.icondeleteforever';
		else if (sinf === 4) icon = 'XPO.icondownload';
		else if (sinf) icon = 'XPO.iconstop';
		softkeys.set(K.sl, function () {
			if (sinf === 3) {
				raafi3.intahaa();
			} else if (sinf === 4) {
			} else if (sinf) {
				musajjal.itlaqsawt(sinf);
			} else {
				mfateeh.rafa3soorah.click();
			}
		}, 0, icon);
	},
	acceptbtn = function () {
		softkeys.set(K.en, function () {
			var m = {
				uid: mowjoodah.uid,
				a3daa: mowjoodah.a3daa,
			};
			mowjoodah.a3daa.forEach(function (o) {
				if (o[0] === sessions.uid()) {
					o[1] = 1;
					m.pending = 1;
				}
			});
			maxzan.adaaf('XPO.mukaalamaat', m);
			rasaail.itlaq();
		}, 0, 'XPO.icondone');
	};
	
	rasaail = {
		iftahsoorah: function (item) {
			item && Hooks.run('XPO.sheet', {
				n: 'XPO.risaalahsoorah',
				t: 'XPO.risaalahsoorah',
				c: function () { // on yes/callback aka pressing K.sl
					
				},
				i: function (k) { // on init
					k.preview.src = shabakah.xitaab+item.xitaab;
				},
			});
		},
		mowjoodah: function (remove) {
			if (remove) {
				mowjoodah = 0;
				musajjal.infasal();
				raafi3.infasal();
				mfateeh.preview.src = '';
				izhar(mfateeh.matn);
				ixtaf(mfateeh.photo);
			}
			else return mowjoodah;
		},
		itlaqhaalah: function (m) {
			if (m && mowjoodah) {
				var ret = mukaalamaat.uxraa(mowjoodah.a3daa);
				var ret2 = mukaalamaat.uxraa(m.a3daa);
				if (ret && ret2 && ret[0] === ret2[0]) { // same profile
					mowjoodah = m;
					rasaail.itlaq();
				}
			}
		},
		itlaqtaxeer: function (m) {
			if (mowjoodah && m && mowjoodah.uid === m.uid) {
				if (mfateeh && m) {
					var t = m.taxeer;
					mowjoodah.taxeer = t;
					var yes = 0;
					if (isnum(t)) {
						setdata(mfateeh.taxeer, 'XPO.time', t);
						setdata(mfateeh.katabrisaalah, 'XPO.taxeer', 1);
						time(mfateeh.katabrisaalah); // an3ash waqt
						mfateeh.taxeer.hidden = 0;
						t = t - time.now();
						if (t > 0)
						$.taxeer('XPO.rasaailirsal', function () {
							rasaail.itlaqtaxeer();
						}, t);
						else yes = 1;
					} else yes = 1;
				} else yes = 1;
			} else yes = 1;
			if (yes) {
				$.taxeercancel('XPO.rasaailirsal');
				popdata(mfateeh.taxeer, 'XPO.time');
				popdata(mfateeh.katabrisaalah, 'XPO.taxeer', 1);
				mfateeh.taxeer.hidden = 1;
			}
		},
		jaddad: function () {
			if (mowjoodah)
			maxzan.axav('XPO.rasaail', 0, {
				filter: {
					mukaalamah: mowjoodah.uid,
				},
			}, helpers.now());
		},
		fahras: function (results) {
			results = results || oldresults || [];
			results.sort(function (a, b) {
				return a.created - b.created;
			});
			
			rasaaillist.message(results.length ? undefined : translate('XPO.norasaail') );
			
			results.forEach(function (item, i) {
				rasaaillist.set(item);
			});
			
//			if (view.axav() === 'XPO.rasaail') {
//				rasaaillist.select();
//			}
			
			oldresults = results;
			
			rasaaillist.last();
		},
		iftah: function (item, an3ash) { // open rasaail
			if (item) {
				if (!mowjoodah || mowjoodah.uid !== item.uid) {
					yahtaajuitlaq = 1;
				}
				mowjoodah = item;
				risaalahsaabiqah = 0;
				if (isundef(mowjoodah.uid)) {
					// init direct message protocol
					// search offline for prev mklmt sinf0 with this 3udw
					// nothing? search online for the same thing
					// nothing? show a big button to invite -1
					// if prev mklmh found, just turn it into mowjoodah :)
					/*
					 * invitation can be rejected -2
					 * rejected invitations are deleted after 7d
					 * you can re-invite after that
					 * -3 means no re-invites, total block :)
					 * blocks can only be unblocked by the blocker
					 * the blockee can't delete them
					 * they do disappear offline though
					 * */
					pager.intaxab('XPO.mukaalamaat', 1);
					view.ishtaghal('XPO.rasaail');
					rasaaillist.message( xlate('XPO.bahacmukaalamah') );
					var ret = mukaalamaat.uxraa(mowjoodah.a3daa);
					if (ret)
					mukaalamaat.bahac(ret[0], function (m) {
						if (m) rasaail.iftah(m, 1);
						else {
							if (view.axav() !== 'XPO.rasaail' || an3ash)
								view.ishtaghal('XPO.rasaail');
							
							rasaail.itlaq(mowjoodah);
						}
					});
					else rasaail.itlaq(item);
				} else {
					if (view.axav() !== 'XPO.rasaail' || an3ash)
						view.ishtaghal('XPO.rasaail');
				}
			}
		},
		itlaq: function () {
			if (mowjoodah) {
				webapp.header();
				if (yahtaajuitlaq) {
					softkeys.clear();
					softkeys.P.empty();
					softkeys.list.basic(rasaaillist);
				}
				softkeys.set(K.sr, function () {
					rasaail.mowjoodah(1);
					pager.intaxab('XPO.mukaalamaat', 1);
				}, 0, 'XPO.iconarrowback');
				var suid = sessions.uid(),
					rkb = mukaalamaat.raakib(mowjoodah.a3daa),
					uxr = mukaalamaat.uxraa(mowjoodah.a3daa),
					haalah = mukaalamaat.haalah(mowjoodah),
					byyou = haalah[1],
					msg = haalah[2],
					haalah = haalah[0];
					
				rasaaillist.message( xlate( msg, '' ) );

				if (yahtaajuitlaq)
				hisaabaat.axav([uxr[0]], function (nataaij) {
					nataaij.forEach(function (o) {
						soorah = setshakl(o, mfateeh.soorah);
						soorah.zoomlevel = .25;
						soorah.panned.y = 25;
						soorah.jaddad();
						var name = o.displayname || o.username;
						innertext( mfateeh.mowdoo3, name );
						rasaaillist.message( xlate( msg, name ) );
					});
				});
				ixtaf(mfateeh.katabrisaalah);
				if (byyou) { // is by you
					if (haalah === -3) { // you blocked him
						unblockbtn();
					}
					if (haalah === -2) { // you rejected his request
						blockbtn();
					}
					if (haalah === -1) { // you invited him
						softkeys.talaf(K.en);
						if (mowjoodah.uid > 0) blockbtn();
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
					izhar(mfateeh.katabrisaalah);
					musajjal.itlaqsawt(2);
					blockbtn();

					mfateeh.katabrisaalah.onclick = function () {
						if (!musajjal.mashghool()) mfateeh.risaalahbox.focus();
					};
					mfateeh.risaalahbox.onfocus = function () {
						if (!musajjal.mashghool()) rasaaillist.deselect();
					};
					mfateeh.risaalahbox.oninput = function () {
						if (!musajjal.mashghool() && !raafi3.mashghool()) {
							setcss(XPO.rasaailui, 'paddingBottom',
									(mfateeh.risaalahbox.offsetHeight+10)+'px');
							sendbtn( nazzaf(mfateeh.risaalahbox.value).length ? 1 : 0 );
						}
					};
					mfateeh.risaalahbox.uponenter = function () {
						if (!musajjal.mashghool()) {
							var matn = nazzaf(mfateeh.risaalahbox.value);
							if (matn.length) {
								rasaail.irsal(matn);
								mfateeh.risaalahbox.focus();
							}
							else musajjal.isjal(1);
							
							scrollintoview(mfateeh.risaalahbox);
						}
					};

					rasaail.itlaqtaxeer();

					if (yahtaajuitlaq) {
						mfateeh.risaalahbox.oninput();
						mfateeh.risaalahbox.focus();
						rasaaillist.popall();
						rasaail.jaddad();
					} else {
						rasaaillist.intaxabscroll( rasaaillist.get() );
						rasaaillist.rakkaz(1, 1);
					}

					sendbtn();
					auxbtn();
					softkeys.set('0', function () {
						rasaaillist.press('0');
					}, '0', 'XPO.icondeleteforever');
				}
			}
			yahtaajuitlaq = 0;
		},
		irsal: function (matn) {
			var t = (mowjoodah.taxeer||0) - time.now();
			if (t < 0 || isundef(mowjoodah.taxeer)) {
				matn = nazzaf(matn);
				if (isstr(matn) && matn.length) {
					rasaaillist.message();
					var item;
					if (risaalahsaabiqah) {
						item = risaalahsaabiqah;
						item.matn += '\n'+matn;
					} else {
						item = {
							uid: maxzan.ruid(),
							matn: matn,
							mukaalamah: mowjoodah.uid,
						};
						risaalahsaabiqah = shallowcopy(item);
					}
					maxzan.adaaf('XPO.rasaail', shallowcopy(risaalahsaabiqah));
					item.maalik = sessions.uid();
					item.created = time.now();
					item.mu3allaq = 1;
					rasaaillist.set(item);
					rasaaillist.last();
					mfateeh.risaalahbox.value = '';
				}
			} else {
				rasaail.itlaqtaxeer(mowjoodah);
			}
		},
	};

	Offline.create('XPO.rasaail', '', {
		mfateeh: ['XPO.mukaalamah'],
	});

	listener('resize', function () {
		$.taxeer('XPO.resizerasaail', function () { resize(); }, 100);
	});
	Hooks.set('XPO.raafi3', function (nabaa) {
		if (view.axav() === 'XPO.rasaail') {
			if (nabaa === RF3BADAA) {
				auxbtn(3);
				sendbtn(-2); // busy
			}
			if (nabaa === RF3XATAM) {
				sendbtn(3);
			}
			if (nabaa === RF3INTAHAA) {
				ixtatamsoorah();
			}
		}
	});
	Hooks.set('XPO.musajjal', function (nabaa) {
		if (view.axav() === 'XPO.rasaail') {
			if (nabaa === MSJLXATAM) {
				var e = mfateeh.list.querySelector('[data-XPO.la3ib]');
				if (e) {
					popdata(e, 'XPO.la3ib');
					var ns = nextsibling(e);
					if (ns) {
						var o = rasaaillist.adapter.get( getdata(ns, 'XPO.uid') );
						if (o && o.sinf === 1) {
							rasaaillist.select( rasaaillist.id2num(o.uid) );
							rasaaillist.press(K.en);
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
				$.taxeer('XPO.risaalahbox', function () {
					if (musajjal.mulhaq) mfateeh.risaalahbox.focus();
				}, 10); // avoid 'enter' adding a linebreak
			}
		}
	});
	Hooks.set('XPO.ready', function () {
		shabakah.tawassat('XPO.rasaail', function (intahaa) {
			// receive rasaail updates when signed in
			intahaa( sessions.signedin() ? 1 : undefined );
		});
		shabakah.jawaab.rafa3('XPO.rasaail', 'XPO.soorah', function (jawaab) {
//			$.log( 'shabakah.jawaab.rafa3 rasaail.soorah', jawaab );
			if (jawaab) raafi3.intahaa();
			else {
				webapp.itlaa3('failed to send photo message');
			}
		});
		shabakah.jawaab.rafa3('XPO.rasaail', 'XPO.sawt', function (jawaab) {
//			$.log( 'shabakah.jawaab.rafa3 rasaail.sawt', jawaab );
			if (view.axav() === 'XPO.rasaail') {
				if (jawaab) {
					musajjal.itlaqsawt(2); // stop
				} else {
					webapp.itlaa3('failed to send voice message');
				}
			}
		});
		shabakah.jawaab.axav('XPO.rasaail', 'XPO.taxeer', function (jawaab) {
//			$.log('axav.rasaail.taxeer', jawaab);
			if (isarr(jawaab)) jawaab.forEach(function (item) {
				rasaail.itlaqtaxeer(item);
			});
		});
		maxzan.jawaab.axav('XPO.rasaail', function (jawaab) {
//			$.log( 'maxzan.jawaab.axav rasaail' );
			rasaail.fahras( jawaab );
		});
		maxzan.jawaab.adaaf('XPO.rasaail', function (jawaab) {
//			$.log( 'maxzan.jawaab.adaaf rasaail' );
			if (jawaab && mowjoodah) {
				if (jawaab.mukaalamah === mowjoodah.uid) {
					if (risaalahsaabiqah) {
						if (risaalahsaabiqah.uid === jawaab.ruid) {
							risaalahsaabiqah = 0;
						}
					}
					rasaaillist.set( jawaab );
				}
			}
		});
		maxzan.jawaab.havaf('XPO.rasaail', function (jawaab) {
//			$.log( 'maxzan.jawaab.havaf rasaail', jawaab );
			var o = rasaaillist.adapter.get(jawaab);
			if (o) {
				o.matn = 'this msg was deleted';
				rasaaillist.set(o);
				$.taxeer('XPO.rasaailhavaf'+jawaab, function () {
					rasaaillist.pop(jawaab);
				}, 3000);
			}
		});

		mfateeh = view.mfateeh('XPO.rasaail');
		
		resize();

		rasaaillist = list( mfateeh.XPO.list ).idprefix('XPO.rasaail')
						.listitem('XPO.risaalahitem');
		
		rasaaillist.uponpaststart = function () { this.first(); return 1; };
		rasaaillist.beforeset = function (item) {
			var t = item.havaftaxeer, s = 'XPO.ixtaf';
			if (item.havaf || !isundef(t)) s = 'XPO.izhar';
			if (item.havaf > 1) item.matn = 'this msg was deleted';
			item.havafstr = s;
			
			if (item.sinf === 1 && !item.muntahaa) {
				item.matn = '...';
			}
			
			return item;
		};
		rasaaillist.afterset = function (item, clone, k) {
			var t = item.havaftaxeer;
			if (item.havaf || isundef(t)) {
				popdata(k.havafwaqt, 'XPO.time');
				innertext(k.havafwaqt, '');
			}
			else if (!isundef(t)) {
				var s = 0;
				if (t === 1) s = 5;
				else if (t === 2) s = 15;
				else if (t === 3) s = 30;
				else if (t === 4) s = 60;
				setdata(k.havafwaqt, 'XPO.time', time.now()+(s*1000));
				time(clone);
			}
			if (item.havaf > 1) {
				setdata(clone, 'XPO.mahvoof', 1);
			} else {
				popdata(clone, 'XPO.mahvoof');
			}
			
			if (item.sinf === 1 && !item.muntahaa) {
				var src = shabakah.xitaab+item.xitaab;
				izhar(k.hafr);
				sawthafr.drawaudio(k.hafr, src, 0, 6).then(function (audbuf, filtered, size) {
					var dur = audbuf.duration;
					if (isnum(dur)) {
						dur = Math.round(dur);
						innerhtml(k.matn, '<b>'+dur+'s</b> <small>'+Math.round(size/1024)+'kB'+'</small>');
						item.muntahaa = 2;
					}
				});
				item.matn = undefined;
				item.muntahaa = 1;
			}
			if (item.sinf === 2) {
				izhar(k.hafr);
				var img = createelement('img', 'XPO.preview2');
				k.hafr.replaceWith( img );
				k.hafr = img;
				setdata(k.hafr, 'XPO.id', 'XPO.hafr');
				k.hafr.src = shabakah.xitaab+item.xitaab;
			}
			
			var ps = prevsibling(clone), yes = 1, margin = 0;
			if (ps) {
				var pskeys = templates.keys(ps);
				var previtem = rasaaillist.adapter.get( getdata(ps, 'XPO.uid') );
				if (previtem) {
					if (item.maalik === previtem.maalik) yes = 0;
					if (!pskeys.padder.hidden) margin = 1;
				}
			}
			setdata(k.waqtqabl, 'XPO.time', item.created);
			if (margin && yes) setdata(clone, 'XPO.margin', 1);
			else popdata(clone, 'XPO.margin');
			if (clone && yes) {
				k.padder.hidden = 0;
				setdata(clone, 'XPO.hassoorah', 1);
				$.taxeer('XPO.rasaailsoorah'+item.uid, function () {
					setcss(k.soorah, 'opacity', 1);
					setcss(k.soorah, 'height');
					hisaabaat.axav([item.maalik], function (nataaij) {
						nataaij.forEach(function (o) {
							soorah = setshakl(o, k.soorah);
							soorah.zoomlevel = .25;
							soorah.panned.y = 25;
//							soorah.mowdoo3( o.username.substr(0, 6) );
							soorah.jaddad();
						});
					});
				}, 50);
			} else {
				k.padder.hidden = 1;
				popdata(clone, 'XPO.hassoorah');
				setcss(k.soorah, 'height', 0);
				setcss(k.soorah, 'opacity', 0);
			}
		};
		rasaaillist.onpress = function (item, key, uid) {
			if (item && key === K.en) {
				if (item.sinf === 0) {
					haadirsawt && haadirsawt.intahaa();
					haadirsawt = sawtkaatib.minhuroof(item.matn);
					var rb = mfateeh.risaalahbox;
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
					musajjal.il3ab(shabakah.xitaab+item.xitaab)
					var clone = rasaaillist.get( rasaaillist.id2num( item.uid ) );
					if (clone) setdata(clone, 'XPO.la3ib', 1);
				}
				if (item.sinf === 2) {
					rasaail.iftahsoorah(item);
				}
			}
			if (item && !item.havaf && key === '0') {
				var t = item.havaftaxeer, s;
				if (isundef(t)) t = 1, s = 5; // 5s
				else if (t === 1) t = 2, s = 15; // 15s
				else if (t === 2) t = 3, s = 30; // 30s
				else if (t === 3) t = 4, s = 60; // 1m
				else if (t === 4) t = undefined; // cancel
				item.havaftaxeer = t;
				if (t) $.taxeer('XPO.havaftaxeer'+item.uid, function () {
					maxzan.havaf('XPO.rasaail', { uid: item.uid });
					item.havaf = 1;
					rasaaillist.set(item);
				}, s*1000);
				else $.taxeercancel('XPO.havaftaxeer'+item.uid);
				rasaaillist.set(item);
			}
		};
		rasaaillist.uponpastend = function () {
			rasaaillist.deselect();
			mfateeh.XPO.risaalahbox.focus();
			return 1;
		};
	});
	Hooks.set('XPO.viewready', function (args) {
		switch (args.XPO.name) {
			case 'XPO.rasaail':
				if (mowjoodah) {
					musajjal.iltahaq(mfateeh);
					musajjal.intahaa();
					raafi3.iltahaq(mfateeh);
					raafi3.intahaa();
					rasaail.itlaq();
				}
				break;
			default:
				musajjal.infasal();
				raafi3.infasal();
				break;
		}
	});
})();