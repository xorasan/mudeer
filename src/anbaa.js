//+ fahras ta3daadmatn iftah mowjoodah
var anbaa;
;(function(){
	var anbaalist, mfateeh, mfateeh2, oldresults = [], mowjoodah, __uid = 0,
	selectrange = function (el, s, e) {
		var r = document.createRange();
		var fc = el.firstChild;
		if (s) r.setStart(fc, fc.length)/*, r.setEnd(fc, e)*/;
//		else r.selectNodeContents(el);
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(r);
	},
	matn2caaniyaat = function (matn) { // secs
		var c = matn.length;
		return Math.ceil( c / 10 ) || 1;
	},
	resize = function () {
		if (mfateeh) {
			var iw = innerwidth();
			setcss(mfateeh.katabnaba, 'left', (iw>640?(iw-640)/2:0)+48+'px');
			setcss(mfateeh.katabnaba, 'right', (iw>640?(iw-640)/2:0)+'px');
		}
	},
	otherprofile = function (a3daa) {
		for (var i = 0; i < a3daa.length; ++i) {
			var v = a3daa[i];
			if (v[0] !== sessions.uid()) {
				return v;
			}
		}
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
	dosoftkeys = function (nolist) {
		softkeys.clear();
		softkeys.P.empty();

		if (nolist) {
			
		} else softkeys.list.basic(anbaalist);

		softkeys.set(K.sr, function () {
			mowjoodah = 0;
			pager.intaxab('qasas', 1);
		}, 0, 'XPO.iconarrowback');
		if (mowjoodah) {
			softkeys.set(K.en, function (e) {
				anbaalist.press(K.en);
			}, 0, 'XPO.iconedit');
			softkeys.set('2', function () {
				anbaa.adaaf('hit enter to edit this matn');
			}, '2', 'XPO.iconadd');
			softkeys.set('6', function () {
				musajjal.isjal(1);
			}, '6', 'XPO.iconkeyboardvoice');
			softkeys.set('0', function () {
				anbaalist.press('0');
			}, '0', 'XPO.icondeleteforever');
		}
	},
	ixtatamsoorah = function () {
		var isanbaa = view.axav() === 'XPO.anbaa';
		if (mfateeh2) {
			mfateeh2.rafa3soorah.value = '';
			mfateeh2.preview.src = '';
			ixtaf(mfateeh2.photo);
		}
		if (isanbaa) auxbtn();
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
					shabakah.rafa3( 'XPO.anbaa', 'XPO.sawt', mowjoodah.uid, musajjal.tasjeel );
			} else if (sinf === 3) {
				if (raafi3.marfoo3)
					shabakah.rafa3( 'XPO.anbaa', 'XPO.soorah', mowjoodah.uid, raafi3.marfoo3 );
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
				if (sheet.zaahir('XPO.anbaa') && mfateeh2)
					mfateeh2.rafa3soorah.click();
				else
					marfoo3een();
			}
		}, 0, icon);
	},
	marfoo3een = function () { Hooks.run('XPO.sheet', {
		t: xlate('XPO.anbaa'),
		ayyihaal: function () {
			raafi3.infasal();
			mfateeh2 = 0;
			auxbtn();
		},
		i: function (k) {
			auxbtn();
			mfateeh2 = k;
			raafi3.iltahaq(k);
			raafi3.intahaa();
			var l = list(k.list).idprefix('XPO.mrf3n').listitem('XPO.anbaaitem');
			l.onpress = function (item, key) {
				
			};
			softkeys.set('0', function () {
				return 1;
			}, '0', 'XPO.icondelete');
			softkeys.set(K.en, function () {
				l.select();
				return 1;
			}, 0, 'XPO.icondone');
		},
		n: 'XPO.anbaa',
	}); };
	
	anbaa = {
		uid: function (n) { return isnum(n) && n > 0 ? n : ++__uid; },
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
		ta3daadmatn: function () { // anbaa count
			return oldresults.length ? (oldresults.length+' '+translate('XPO.anbaa'))
								: translate('XPO.noanbaa');
		},
		ihsabwaqt: function () {
			if (mowjoodah && !isnum(mowjoodah))
			$.taxeer('XPO.ihsabwaqt'+mowjoodah.uid, function () {
				var kulwaqt = 0;
				anbaalist.adapter.each(function (item) {
					kulwaqt += matn2caaniyaat(item.matn);
				});
				innertext(mfateeh.waqtsaabiq, time.miqdaar(kulwaqt));
				var m = hisaab.maxba().xsoosyat[mowjoodah.muddah];
				if (m) {
					m = m[1];
					if (m === '0') {
						
					} else {
						var secs = parseint(m) * 60;
						setcss( mfateeh.irtiqaa, 'transition' );
						setcss( mfateeh.irtiqaa, 'width', ((kulwaqt/secs)*100)+'%' );
					}
				}
			}, 100);
			else {
				innertext(mfateeh.waqtsaabiq, '');
				setcss( mfateeh.irtiqaa, 'transition' );
				setcss( mfateeh.irtiqaa, 'width' );
			}
		},
		jaddad: function () {
			if (mowjoodah)
			maxzan.axav('XPO.anbaa', 0, {
				filter: {
					qissah: mowjoodah.uid,
				},
			}, helpers.now());
		},
		fahras: function (results) {
			results = results || oldresults || [];
			results.sort(function (a, b) {
				return a.created - b.created;
			});
			
			anbaalist.message(results.length ? undefined : translate('XPO.noanbaa') );
			
			results.forEach(function (item, i) {
				anbaalist.set(item);
			});
			
			if (backstack.states.view === 'XPO.anbaa') {
				anbaalist.select();
			}
			
			oldresults = results;
			
			anbaa.ihsabwaqt();
			
			anbaalist.last();
		},
		iftah: function (item, an3ash) { // open anbaa
			if (item) {
				mowjoodah = item;
				if (view.axav() !== 'XPO.anbaa' || an3ash) {
					view.ishtaghal('XPO.anbaa');
				}
			}
		},
		itlaq: function () {
			if (mowjoodah) {
				anbaalist.popall();
				innertext( mfateeh.mowdoo3, mowjoodah.mowdoo3 );
				innertext( mfateeh.waqtsaabiq, '' );
				setcss( mfateeh.irtiqaa, 'transition', 'none' );
				setcss( mfateeh.irtiqaa, 'width' );
				
				izhar(mfateeh.katabnaba);
				
				anbaalist.message( xlate('XPO.noanbaa') );
	
				mfateeh.xulwaheqonah.hidden = mowjoodah.sinf === 1 ? 0 : 1;
				if (mowjoodah.muddah) {
					var m = hisaab.maxba().xsoosyat[mowjoodah.muddah];
					if (m) {
						m = m[1];
						if (m === '0') {
							innertext( mfateeh.muddah, xlate('XPO.notimelimit') );
						} else {
							var hrs = parseint(m);
							innertext( mfateeh.muddah, time.miqdaar(hrs * 60) );
						}
					}
				}
				doa3daa();
				
				anbaa.jaddad();
				resize();
	
				dosoftkeys();
				auxbtn();
			}
		},
		adaaf: function (matn) {
			anbaalist.message();
			var item;
			item = {
				uid: anbaa.uid(),
				matn: matn,
				qissah: mowjoodah.uid,
			};
			maxzan.adaaf('XPO.anbaa', shallowcopy(item));
			anbaalist.set(item);
			anbaalist.select( anbaalist.id2num(item.uid) );
		},
	};

	maxzan.ixtalaq('XPO.anbaa', '', {
		mfateeh: ['XPO.qissah'],
	});

	listener('resize', function () {
		$.taxeer('XPO.resizeanbaa', function () { resize(); }, 100);
	});
	Hooks.set('XPO.raafi3', function (nabaa) {
		if (mowjoodah && sheet.zaahir('XPO.anbaa')) {
			if (nabaa === RF3BADAA) {
				sendbtn(-2); // busy
				auxbtn(3);
			}
			if (nabaa === RF3XATAM) {
				sendbtn(3);
			}
			if (nabaa === RF3INTAHAA) {
				ixtatamsoorah();
			}
		}
	});
	Hooks.set('XPO.huboot', function (huboot) {
		if (mowjoodah && sheet.zaahir('XPO.anbaa') && huboot && huboot.length) {
			raafi3.intaxab(huboot[0]);
		}
	});
	Hooks.set('XPO.musajjal', function (nabaa) {
		if (view.axav() === 'XPO.anbaa') {
			if (nabaa === MSJLXATAM) {
				var e = mfateeh.list.querySelector('[data-XPO.la3ib]');
				if (e) {
					popdata(e, 'XPO.la3ib');
					var ns = nextsibling(e);
					if (ns) {
						var o = anbaalist.adapter.get( getdata(ns, 'XPO.uid') );
						if (o && o.sinf === 1) {
							anbaalist.select( rasaaillist.id2num(o.uid) );
							anbaalist.press(K.en);
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
				sendbtn();
				auxbtn();
				$.taxeer('XPO.anbaafocus', function () {
					dosoftkeys();
				}, 10); // avoid 'enter' adding a linebreak
			}
		}
	});
	Hooks.set('XPO.ready', function () {
		shabakah.tawassat('XPO.anbaa', function (intahaa) {
			// receive anbaa updates when signed in
			intahaa( sessions.signedin() ? 1 : undefined );
		});
		maxzan.jawaab.axav('XPO.anbaa', function (jawaab) {
//			$.log( 'maxzan.jawaab.axav anbaa' );
			anbaa.fahras( jawaab );
		});
		maxzan.jawaab.adaaf('XPO.anbaa', function (jawaab) {
//			$.log( 'maxzan.jawaab.adaaf anbaa' );
			if (jawaab) {
				if (jawaab.qissah === mowjoodah.uid) {
				}
			}
		});
		maxzan.jawaab.havaf('XPO.anbaa', function (jawaab) {
			$.log( 'maxzan.jawaab.havaf anbaa', jawaab );
			var o = anbaalist.adapter.get(jawaab);
			if (o) {
				o.matn = 'this msg was deleted';
				anbaalist.set(o);
			}
//			if (isnum(jawaab)) anbaalist.pop( jawaab );
		});

		mfateeh = view.mfateeh('XPO.anbaa');
		
		resize();

		anbaalist = list( mfateeh.XPO.list ).idprefix('XPO.anbaa')
						.listitem('XPO.anbaaitem');
		
		anbaalist.uponpaststart = function () { this.first(); return 1; };
		anbaalist.beforeset = function (item) {
			var t = item.havaftaxeer, s = 'XPO.ixtaf';
			if (item.havaf || !isundef(t)) s = 'XPO.izhar';
			if (item.havaf > 1) item.matn = 'this msg was deleted';
			item.havafstr = s;
			return item;
		};
		anbaalist.afterset = function (item, clone, k) {
			var t = item.havaftaxeer;
			k.matn.contentEditable = !!(item.katab||0);
			if (item.katab) {
				$.taxeer('XPO.anbaakatab'+item.uid, function () {
					if (item.katab) {
						k.matn.focus();
						selectrange(k.matn, k.matn.textContent.length);
					}
				}, 20);
				setdata(clone, 'XPO.katab', 1);
			} else {
				popdata(clone, 'XPO.katab');
			}
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
			
			var ps = prevsibling(clone), yes = 1, margin = 0;
			if (ps) {
				var pskeys = templates.keys(ps);
				var previtem = anbaalist.adapter.get( getdata(ps, 'XPO.uid') );
				if (previtem) {
					if (item.maalik === previtem.maalik) yes = 0;
					if (!pskeys.padder.hidden) margin = 1;
				}
			}

			innertext(k.waqtqabl, time.miqdaar(matn2caaniyaat(item.matn)));

			if (margin && yes) setdata(clone, 'XPO.margin', 1);
			else popdata(clone, 'XPO.margin');
			if (clone && yes) {
				k.padder.hidden = 0;
				setdata(clone, 'XPO.hassoorah', 1);
				$.taxeer('XPO.anbaasoorah'+item.uid, function () {
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
			anbaa.ihsabwaqt();
		};
		anbaalist.onpress = function (item, key, uid) {
			if (item && !item.havaf) {
				if (key === K.en) {
					item.katab = !(item.katab||0);
					dosoftkeys(item.katab);
					if (!item.katab) {
						var m = anbaalist.axavmfateeh( item.uid );
						if (m) {
							item.matn = m.matn.innerText;
						}
					}
					anbaalist.set(item);
				}
				if (key === '0') {
					var t = item.havaftaxeer, s;
					if (isundef(t)) t = 1, s = 5; // 5s
					else if (t === 1) t = 2, s = 15; // 15s
					else if (t === 2) t = 3, s = 30; // 30s
					else if (t === 3) t = 4, s = 60; // 1m
					else if (t === 4) t = undefined; // cancel
					item.havaftaxeer = t;
					if (t) $.taxeer('XPO.havaftaxeer'+item.uid, function () {
						anbaalist.pop(item.uid);
						anbaa.ihsabwaqt();
					}, s*1000);
					else $.taxeercancel('XPO.havaftaxeer'+item.uid);
					anbaalist.set(item);
				}
			}
		};
		anbaalist.uponpastend = function () {
			anbaalist.last();
			return 1;
		};
	});
	Hooks.set('XPO.viewready', function (args) {
		switch (args.XPO.name) {
			case 'XPO.anbaa':
				webapp.header();
				if (mowjoodah) {
					musajjal.iltahaq(mfateeh);
					musajjal.intahaa();
					anbaa.itlaq();
				}
				break;
			default:
				musajjal.infasal();
				break;
		}
	});
})();