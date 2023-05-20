//+ lughah daxeem daxxam
var maktab;
var asnaaf = [
'1,n,green',
'2,p,yellow',
'3,v,red',
'4,pp,orange',
'5,c,purple',
'7,adj,cyan',
'8,adv,pink',
];
;(function(){
	'use strict';
	
	var maktablist, tarjamahlist, mfateeh, __uid = 0, la3b = 0, qadnasab = 0,
	originalstr, strjadeed, fimarkaz = 1, damage, kblayout, tmptarjamah,
	daxeemmode,
	actonpaste = function () { $.taxeer('XPO.actonpaste', function () {
		maktab.adaafmatn(mfateeh.maktabbox.value);
		mfateeh.maktabbox.value = '';
		damage = 1;
		ihsabfarq();
		kunxurooj();
	}, 10); },
	resize = function () {
		if (mfateeh) {
			var iw = innerwidth();
			setcss(mfateeh.katabsutoor, 'left', (iw>640?(iw-640)/2:0)+'px');
			setcss(mfateeh.katabsutoor, 'right', (iw>640?(iw-640)/2:0)+'px');
			mfateeh.maktabbox.oninput && mfateeh.maktabbox.oninput();
		}
	},
	ihsabfarq = function () { $.taxeer('XPO.ihsabfarq', function () {
		strjadeed = maktab.axav().trim();
		if (originalstr !== strjadeed && !isundef(originalstr) || damage) {
			innertext(mfateeh.haalah, '*'+strjadeed.length);
		} else {
			innertext(mfateeh.haalah, ''+strjadeed.length);
		}
	}, 1000); },
	kunxurooj = function (t) { $.taxeer('XPO.kunxurooj', function () {
		if (isfun(maktab.xurooj)) {
			if (originalstr !== strjadeed || damage) {
				maktab.xurooj( maktab.axav().trim() );
			}
		}
	}, t||7000); },
	dodirection = function (imm) { $.taxeer('XPO.mktbdodir', function () {
		var arltrs = 0, enltrs = 0;
		var str = maktab.axav();
		for (var l in str) {
			if (alefbatas.includes(str[l])) {
				arltrs++;
			} else
				enltrs++;
		}
		mfateeh.taraf.dir = arltrs > enltrs ? 'rtl' : '';
		maktablist.intaxabscroll();
	}, imm ? 100 : 1000); },
	nazzaf = function (matn) {
		return (matn || '').trim().replace(/[\n]{3,}/g, '\n\n');;
	},
	arlayout = {
		q: 'ق', w: 'و', e: 'ع', r: 'ر', t: 'ت', y: 'ى', u: 'ُ', i: 'ي', o: 'ة', p: 'پ',
		a: 'ا', s: 'س', d: 'د', f: 'ف', g: 'غ', h: 'ه', j: 'ج', k: 'ك', l: 'ل',
		z: 'ز', x: 'خ', c: 'ش', v: 'ذ', b: 'ب', n: 'ن', m: 'م',

		Q: 'ء', W: 'ؤ', E: 'ٰ', R: 'ڑ', T: 'ط', Y: 'ۧ', U: 'ࣴ', I: 'ِ', O: 'ڈ', P: 'آ',
		A: 'َ', S: 'ص', D: 'ض', F: 'ً', G: 'گ', H: 'ح', J: 'چ', K: 'ٍ', L: 'ئ',
		Z: 'ظ', X: 'ژ', C: 'ث', V: 'ٹ', B: 'ـ', N: 'ں', M: 'ّ',
	},
	alefbatas =  'قوعرتىُيةپاسدفغهجكلزخشذبنم'
				+'ءؤٰڑطِۧࣴڈآَصضًگحچٍئظژثٹـںّ'
				+'أإ',
	alphabets =  'قوعرتىُيةپاسدفغهجكلزخشذبنم'
				+'ءؤٰڑطِۧࣴڈآَصضًگحچٍئظژثٹـںّ'
				+'أإ'
				+'،۔؟؛:'
				+'qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./`1234567890-='
				+'~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?',
	nasab = function () {
		if (qadnasab) return;
		
		kblayout = preferences.get('kblayout', 1);
		templates.get('XPO.maktab', mfateeh.maktab)();
		mfateeh = templates.mfateeh(mfateeh.maktab);
		maktablist = list( mfateeh.XPO.list ).idprefix('XPO.mktb')
						.listitem('XPO.maktabitem').freeflow(1);
		tarjamahlist = list( mfateeh.XPO.tarjamah ).idprefix('XPO.trjmh')
						.listitem('XPO.maktabitem').freeflow(1);
		maktablist.uponpaststart = function () { this.first(); return 1; };
		maktablist.onpress = function (item, key, uid) {
			if (isfun(maktab.bahac) && item && key === K.en)
				maktab.bahac(item.lafz);
		};
		maktablist.afterset = function (item, clone, k) {
			if (item._listitem === 'XPO.linebreak') return;
			ixtaf(k.ma3ni);
		};
		maktablist.uponpastend = function () {
			maktablist.deselect();
			mfateeh.XPO.maktabbox.focus();
			return 1;
		};
		mfateeh.katabsutoor.onclick = function () {
			mfateeh.maktabbox.focus();
		};
		mfateeh.maktabbox.onfocus = function () {
			maktablist.deselect();
		};
		mfateeh.maktabbox.onkeyup = function (e) {
			preventdefault(e);
		};
		mfateeh.maktabbox.onkeydown = function (e) {
			var yes = 1;
			var k = tolower(e.key);
			if (e.altKey) {}
			else if (k == K.pu) {
				mfateeh.scroller.scrollBy(0, -50);
			}
			else if (k == K.pd) {
				mfateeh.scroller.scrollBy(0, 50);
			}
			else if (e.ctrlKey && e.code == 'KeyV') { yes = 0, actonpaste(); }
			else if (e.ctrlKey && e.code == 'KeyC') { yes = 0; }
			else if (e.ctrlKey && e.code == 'KeyS') { yes = 0; }
			else if (e.ctrlKey && k == K.en) {
				if (isfun(maktab.tarjam)) {
					setcss(mfateeh.tarjamah, 'opacity', .5);
					maktab.tarjam( maktab.axav() );
				}
			}
			else maktab.adaaf(e.key, e);
			if (yes) preventdefault(e);
			return 1;
		};
		
		resize();
		qadnasab = 1;
	},
	naqal = function (other) {
		try {
			var old = markooz();
			if (other) {
				mfateeh.copier.value = tmptarjamah || '';
			} else {
				mfateeh.copier.value = strjadeed || originalstr;
			}
			mfateeh.copier.focus();
			mfateeh.copier.select();
			document.execCommand('copy');
			webapp.itlaa3('copied');
		} catch (err) {
			$.log('copy-error');
		}
		old.focus();
	};
	
	maktab = {
		uid: function () { return ++__uid; },
		lughah: 2,
		badallughah: function () {
			var l;
			Hooks.run('XPO.sheet', {
				n: 'XPO.lughah',
				t: 'XPO.lughah',
				i: function (k) {
					var yes;
					l = list(k.XPO.list).idprefix('XPO.lghh')
						.listitem('XPO.maktabitem');
					lughaat.forEach(function (lughah, i) {
						l.set({ uid: i, lafz: lughah, ma3ni: 'XPO.ixtaf' });
					});
					softkeys.list.basic(l);
					l.select(maktab.lughah);
					l.baidaa(maktab.lughah);
					l.onpress = function () { l.baidaa(); };
				},
				c: function (k) {
					var b = l.axav();
					if (b) {
						maktab.lughah = b.uid;
						preferences.set('lughah', maktab.lughah);
						innertext(mfateeh.lughah, b.lafz);
						if (isfun(maktab.tarjam)) {
							setcss(mfateeh.tarjamah, 'opacity', .5);
							maktab.tarjam( maktab.axav() );
						}
					}
				},
			});
		},
		mahfooz: function () { if (mfateeh && strjadeed) {
			originalstr = strjadeed;
			innertext(mfateeh.haalah, ''+strjadeed.length);
			strjadeed = undefined;
			damage = 0;
		} },
		havafkul: function () {
			tarjamahlist.popall();
			maktablist.popall();
			originalstr = undefined;
			ihsabfarq();
			dodirection(1);
		},
		adaafmatn: function (str) {
			str = tabdeel(str||'', [
				/([\,\.\!\:\;\'\"\/\-\+\=\&\%\@\*])/g, ' $1', // en punc
				/([\،\۔\؛\؟])/g, ' $1', // ar
			]);
			str = tabdeel(str, [/\ \ /g, ' ']);
			for (var i = 0; i < str.length; ++i) {
				maktab.adaaf(str[i], 0, 1);
			}
			if (isundef(originalstr)) {
				maktablist.first();
				originalstr = maktab.axav().trim();
			}
		},
		adaaf: function (key, e, nosave) {
			var changes, clone,
				ctrl = e && e.ctrlKey, shift = e && e.shiftKey,
				lv = fimarkaz ? maktablist : tarjamahlist,
				o = lv.adapter.get( maktablist.num2id() );

			if (mfateeh.taraf.dir === 'rtl') {
				if (key === 'ArrowLeft'	) lv.down();
				if (key === 'ArrowRight') lv.up();
				if (key === 'ArrowUp'	) lv.right();
				if (key === 'ArrowDown'	) lv.left();
			} else {
				if (key === 'ArrowLeft'	) lv.up();
				if (key === 'ArrowRight') lv.down();
				if (key === 'ArrowUp'	) lv.left();
				if (key === 'ArrowDown'	) lv.right();
			}

			if (['«', '»'].includes(key)) {
				daxeemmode = (key == '«' ? 1 : 0);
				return;
			}
			if (!fimarkaz) return;

			if (key === 'Backspace' && o) {
				if (!o.linebreak && o.lafz && o.lafz.length && !ctrl) {
					o.lafz = o.lafz.slice(0, -1);
					maktablist.set(o);
					changes = 1;
				} else {
					maktablist.pop();
					maktablist.intaxabsaamitan();
					changes = 1;
				}
			}

			if (['Enter', '\n'].includes(key)) {
				var after = maktablist.get( maktablist.selected );
				if (!shift && after) after = nextsibling(after);
				var o = {
					uid: maktab.uid(),
					lafz: '\n',
					linebreak: 1,
					before: after,
					_listitem: 'XPO.linebreak'
				};
				maktablist.set(o);
				maktablist.selected = parseint(maktablist.id2num( o.uid ));
				maktablist.intaxabsaamitan();
				changes = 1;
			}
			if (['b', 'ب'].includes(key) && ctrl) {
				maktab.daxxam(); changes = 1;
			}
			if (key === ' ') {
				var after = maktablist.get( maktablist.selected );
				if (!shift && after) after = nextsibling(after);
				var o = { uid: maktab.uid(), lafz: '', before: after };
				clone = maktablist.set(o);
				maktablist.selected = parseint(maktablist.id2num( o.uid ));
				maktablist.intaxabsaamitan();
				changes = 1;
			}
			if (!ctrl && alphabets.indexOf(key) > -1) {
				if ('أإ'.includes(key)) key = 'ا';
				
				if (e && kblayout && arlayout[key]) {
					key = arlayout[key];
				}
				
				if (!o || (o && o.linebreak)) {
					var after = maktablist.get( maktablist.selected );
					if (after) after = nextsibling(after);
					var o = { uid: maktab.uid(), lafz: '', before: after };
					clone = maktablist.set(o);
					maktablist.selected = parseint(maktablist.id2num( o.uid ));
					maktablist.intaxabsaamitan();
				}
				if (o) {
					o.lafz += key;
					maktablist.set(o);
					changes = 1;
				}
			}
			if (clone && daxeemmode) {
				clone.dataset.daxeem = 1;
			}
			if (changes && !nosave) {
				dodirection();
				ihsabfarq();
				kunxurooj();
			}
		},
		daxxam: function () {
			var lv = fimarkaz ? maktablist : tarjamahlist,
				o = lv.adapter.get( maktablist.num2id() );
			
			if (o) {
				var e = elementbyid(o.id_dom);
				if (e.dataset.daxeem)
					popdata(e, 'daxeem')
				else
					setdata(e, 'daxeem', 1)
			}
		},
		fahras: function (arr, zumraat, waqtsabaq) {
			if (isarr(arr)) {
				tmptarjamah = '';
				
				setcss(mfateeh.tarjamah, 'opacity');
				var str = [];
				if (zumraat)
				for (var i in zumraat) str.push( lughaat[i]+' <small>'+zumraat[i]+'</small>' );

				waqtsabaq = waqtsabaq || 0;
				innertext(mfateeh.waqtsabaq, parsefloat((waqtsabaq/1000)+'s', 2));
				innerhtml(mfateeh.lughaat, str.length ? str.join(' . ') : '...');

				tarjamahlist.popall(); var tmpstr = '', tmpstr2 = '';
				arr.forEach(function (item, i) {
					var item = {
						uid: i+1,
						lafz: item[0],
						ma3ni: item[1],
						data: {
							sinf: item[2],
						}
					};
					if (item.lafz == '\n') {
						tmptarjamah += '\n'+tmpstr+'\n'+tmpstr2;
						tmpstr = tmpstr2 = '';
						item._listitem = 'XPO.linebreak';
					} else {
						tmpstr += ' '+item.lafz;
						tmpstr2 += ' '+item.ma3ni;
					}
					tarjamahlist.set(item);
				});
				tmptarjamah += '\n'+tmpstr+'\n'+tmpstr2;
			}
		},
		axav: function (asarray) { // get 
			var str = asarray ? [] : '', jf, daxeem;
			if (mfateeh)
			maktablist.keys.items.childNodes.forEach(function (i) {
				var item = maktablist.adapter.get( getdata(i, 'XPO.uid') );
				if (item && item.lafz) {
					if (i.dataset.daxeem && !daxeem) {
						if (asarray) str.push('«');
						else str += '«';
						daxeem = 1;
					} else if (!i.dataset.daxeem && daxeem) {
						if (asarray) str.push('»');
						else str += '»';
						daxeem = 0;
					}
					if (asarray) {
						str.push(item.lafz);
					} else {
						if (item.lafz == '\n') str += '\n', jf = 1;
						else str += (jf ?  '' : ' ' )+item.lafz, jf = 0;
					}
				}
			});
			return str;
		},
		nasab: function (m) {
			if (!mfateeh && m) {
				mfateeh = m;
				nasab();
			}
		},
		ittasal: function () {
			la3b = 1;
			mfateeh.maktabbox.focus();
			innertext(mfateeh.lughah, lughaat[maktab.lughah]);
			dodirection();
			softkeys.set(K.sl, function () {
				fimarkaz = fimarkaz ? 0 : 1;
				softkeys.baidaa(K.sl, fimarkaz);
			}, 0, 'XPO.iconedit', fimarkaz);
			softkeys.set('2', function () {
				maktablist.press(K.en, 1);
			}, '2', 'XPO.iconadd');
			softkeys.set('3', function () {
				maktab.badallughah();
			}, '3', 'XPO.iconlanguage');
			softkeys.set('4', function () {
				naqal();
			}, '4', 'XPO.iconcopy');
			softkeys.set('5', function () {
				naqal(1);
			}, '5', 'XPO.iconcopy');
			softkeys.set('6', function () {
				kblayout = kblayout ? 0 : 1;
				preferences.set('kblayout', kblayout);
				softkeys.baidaa('6', kblayout);
			}, '6', 'XPO.iconkeyboard', kblayout);
			softkeys.set('7', function () {
				kunxurooj(1000);
			}, '7', 'XPO.iconsave');
		},
		inqata3: function () {
			la3b = 0;
			mfateeh.maktabbox.blur();
			maktablist.deselect();
			$.taxeercancel('XPO.ihsabfarq');
			$.taxeercancel('XPO.mktbdodir');
			$.taxeercancel('XPO.kunxurooj');
		},
	};

	listener('resize', function () {
		$.taxeer('XPO.resizemaktab', function () { resize(); }, 100);
	});

	listener('keydown', function (e) {
		if (e.ctrlKey) {
			var yes, a = e.key;
			if (['s', 'س'].includes(a)) kunxurooj(1000), yes = 1;
			if (['c', 'ش'].includes(a)) naqal(), yes = 1;
			if (yes) preventdefault(e);
		}
	});
	Hooks.set('XPO.ready', function () {
		var lughah = preferences.get('lughah', 1);
		if (lughah) maktab.lughah = lughah;
	});

})();