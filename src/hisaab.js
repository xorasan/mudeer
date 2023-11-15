//+ adaaf qeemah_raw jaddad naqd naqdtafawwaq maxba fahras bahac hisaab zumar
var hisaab, ISMMUBEENMAX = 48, TAGMAX = 15; 
var soorahshakl, hisaablist;
;(function(){
	'use strict';

	var iftahkeys, iftahsinf, naqdstr = 'XPO.naqd', maxba = {
		muntaxab: {},
	};
	var iftahismmubeen = function (item) {
		Hooks.run('XPO.dialog', {
			x: ISMMUBEENMAX,
			c: function (k) {
				item.tafseel = k;
				maxzan.adaaf('XPO.hisaab', {
					uid:		item.uid,
					qadr:		k,
					pending:	1,
				});
			},
			m: 'XPO.hifz',
			a: item.qadr,
			q: 'XPO.ismmubeen'
		});
	};
	var katabtags = function (item) { Hooks.run('XPO.sheet', {
		t: xlate(item.uid),
		ayyihaal: function () {
			iftahkeys.muyassar.adapter.each(function (o) {
				clearTimeout(o.taxeer);
			});
			
			iftahkeys = 0;
		},
		c: function () {
			var qadr = [];
			iftahkeys.muntaxab.adapter.each(function (o) {
				qadr.push( parseint(o.uid) );
			});
			
			maxzan.adaaf('XPO.hisaab', {
				uid:		item.uid,
				qadr:		qadr,
				pending:	1,
			});
		},
		i: function (k) {
			iftahkeys = k;
			item.qadr = item.qadr || [];
			if (!isarr(item.qadr)) item.qadr = [];

			iftahkeys = bazaar.nasab({
				sinf: item.uid,
				mfateeh: k,
			});
		},
		n: 'XPO.hisaabmilk',
	}); };
	var iftahshakl = function (item) { Hooks.run('XPO.sheet', {
		t: xlate(item.uid),
		ayyihaal: function () {
			if (iftahkeys.muntaxab.adapter)
			iftahkeys.muyassar.adapter.each(function (o) {
				clearTimeout(o.taxeer);
			});
			
			iftahkeys = 0;
		},
		c: function () {
			var qadr = [];
			if (iftahkeys.muntaxab.adapter)
			iftahkeys.muntaxab.adapter.each(function (o) {
				qadr.push( parseint(o.uid) );
			});
			
			maxzan.adaaf('XPO.hisaab', {
				uid:		item.uid,
				qadr:		qadr,
				pending:	1,
			});
		},
		i: function (k) {
			iftahkeys = k;
			item.qadr = item.qadr || [];
			if (!isarr(item.qadr)) item.qadr = [];
			
			var r = hisaab.soorah(k.soorah);
			r.mowdoo3();
			iftahkeys = bazaar.nasab({
				sinf: item.uid,
				mfateeh: k,
				zumrah: 1,
				muntahaa: 100,
				fimakaan: 1, // baidaa in place
				callback: function () {
					$.taxeer('XPO.soorahupdate', function () {
						var arr = [];
						if (iftahkeys.muntaxab.adapter)
						iftahkeys.muntaxab.adapter.each(function (o) {
							arr.push( o.uid );
						});
						hisaab.soorahmuntaxab(arr, r);
						r.jaddad();
					}, 150);
				},
			});

			softkeys.set(K.lf, function () {
				r.left();
				return 1;
			});
			softkeys.set(K.rt, function () {
				r.right();
				return 1;
			});
			softkeys.set(K.pd, function () {
				iftahkeys.fahras( r.down() );
				r.mowdoo3();
				return 1;
			}, 'pd', 'XPO.iconkeyboardarrowdown');
			softkeys.set(K.pu, function () {
				iftahkeys.fahras( r.up() );
				r.mowdoo3();
				return 1;
			}, 'pu', 'XPO.iconkeyboardarrowup');
		},
		n: 'XPO.hisaabshakl',
	}); };
	var soorahdefs = {
//		900		: 'normal',		// head
//		1800	: 'masculine',	// sholders
//		1300	: 'thick',		// neck
//		700		: 'square',		// face
//		1700	: 'almond',		// sclera
//		600		: 'hooded',		// eyes
//		1000	: 'normal',		// iris
//		100		: 'upward',		// brows
//		200		: 'empty',		// cheeks
//		1500	: 'convex',		// nosebridge
//		400		: 'small',		// chin
//		1400	: 'upturned',	// nose base
//		1600	: 'upturned',	// nostrils
//		1200	: 'thin',		// lips
//		800		: 'quiff',		// hair
//		500		: 'small',		// ears
//		1100	: 'outwards',	// jaws
//		300		: 'muscular',	// chest
//		1900	: 'muscular',	// upperarms
	};
	
	hisaab = {
		maxba: function (uid, qadr) { // set cache
			if (arguments.length === 0 ) return maxba;
			if (['XPO.shakl', 'XPO.milk', 'XPO.wazaaif'].includes(uid)) {
				maxba[uid] = Object.assign({}, qadr);
				delete maxba[uid].waqt;
//				delete maxba[uid].zumar;
			} else {
				maxba[uid] = qadr;
			}
		},
		axavasmaa: function () {
			var asmaa = {};
			if (maxba.shakl) {
				for (var rid in maxba.shakl.zumar) {
					asmaa[ rid ] = maxba.shakl.zumar[ rid ] || '';
				}
				for (var rid in maxba.shakl) {
					if (rid !== 'XPO.zumar')
						asmaa[ rid ] = maxba.shakl[ rid ][ 1 ] || '';
				}
			}
			return asmaa;
		},
		axavnaadir: function (zumrah, kul) {
			var out = {};
			for (var i in kul) {
				if (!['XPO.waqt', 'XPO.zumar'].includes(i)) {
					if (kul[i][2] === zumrah)
						out[i] = kul[i];
				}
			}
			return out;
		},
		naqdtafawwaq: function () {
			var e = hisaablist.get(0);
			if (e) {
				if (!(view.axad() === 'XPO.hisaab' && backstack.darajah === 1)) {
//					hisaablist.select( hisaablist.id2num( naqdstr ) );
					e = e.cloneNode(true);
					if (view.axad() !== 'XPO.hisaab') {
						var k = templates.keys(e);
						if (k) innertext( k.tafseel, xlate('XPO.naqdmorein') );
					}
					e.onclick = function () {
						bazaar.iftahnaqd();
						innertext(XPO.tafawwaq, '');
					};
					innertext(XPO.tafawwaq, '');
					XPO.tafawwaq.append(e);
				}
				var animation = 'animation';
				setcss(e, animation, 'fadein 0.2s')
				e.dataset.tafawwaq = 1;
				$.taxeer('XPO.tafawwaqani', function () {
					setcss(e, animation);
				}, 500);
				$.taxeer('XPO.tafawwaq', function () {
					innertext(XPO.tafawwaq, '');
					delete e.dataset.tafawwaq;
				}, 5000);
			}
		},
		naqd: function (item) {
			var naqd = item ? bazaar.qeemah(item.qadr) : ['.', '.'];
			hisaablist.set({
				uid: naqdstr,
				sinf: naqdstr,
				vahabp: naqd[0] ? 'XPO.izhar' : 'XPO.ixtaf',
				vahab: naqd[0] || 'XPO.ixtaf',
				fiddahp: naqd[0] && !naqd[1] ? 'XPO.ixtaf' : 'XPO.izhar',
				fiddah: naqd[1] || 0,
				mufarraq: 1,
				mowdoo3: xlate(naqdstr),
				tafseel: xlate('XPO.naqdgetmore'),
				_listitem: 'XPO.bazaarnaqd',
			});
		},
		jaddad: function () {
			var arr = maxba.hisaab || ['XPO.shakl', 'XPO.ism', 'XPO.ismmubeen', 'XPO.milk',
										'XPO.wazaaif'];
			arr.forEach(function (o) {
				if (typeof o == 'string') o = { uid: o, qadr: '' };
				
				if (o.uid == 'XPO.xsoosyat') return;
				
				o.mowdoo3 = xlate(o.uid);
				o.tafseel = o.qadr;
				if (['XPO.shakl'].includes(o.uid)) {
					o.tafseel = '';
					o.madad = xlate('XPO.taptocahnge');
					o._listitem = 'XPO.hisaabshakl';
				}
					
				if (['XPO.ism', 'XPO.ismmubeen', 'XPO.shakl'].includes(o.uid))
					o.madad = xlate('XPO.taptochange');
		
				o.hifz = o.pending ? xlate('XPO.pending') : 'XPO.ixtaf';
				if (['XPO.milk', 'XPO.wazaaif'].includes(o.uid)) {
					var m = o.qadr, b = maxba[o.uid];
					o.madad = xlate('XPO.taptoadd');
					o.tafseel = '';
					if (b) {
						if (isarr(m) && m.length) {
							o.tafseel += m.length+' / '+TAGMAX;
//							m.forEach(function (i) {
//								if (b[ i ]) o.tafseel += ' '+b[ i ][1];
//							});
						}
					}
				}
				var clone = hisaablist.set(o);
				if (o.uid === 'XPO.shakl' && clone)
					hisaab.soorah( templates.keys(clone).soorah, 120, 100, .55 );
			});
		},
		soorahmuntaxab: function (src, soorah) {
			soorah = soorah || soorahshakl;
			var muntaxab = soorah.muntaxab;
			for (var i in soorahdefs) {
				muntaxab[i] = isundef(muntaxab[i]) ? soorahdefs[i] : muntaxab[i];
			}
			if (isarr(src)) soorah.adaafmuntaxab(src);
		},
		soorah: function (soorahtag, w, h, z) {
			if (shakl && soorahtag) {
				soorahshakl = shakl(soorahtag);
				if (w && h) {
					soorahshakl.setmaxwh(w, h);
					soorahshakl.hajm(w, h);
				} else {
					soorahshakl.setmaxwh(640, 400);
					soorahshakl.hajm(640, 320);
					soorahshakl.panhere(320, 120);
				}
				if (z) soorahshakl.zoomlevel = z;
				if (insaan && shaklpallete) {
					soorahshakl.alwaan = shaklpallete;
					soorahshakl.adaafasmaa( hisaab.axavasmaa() );
					soorahshakl.adaafitlaaqaat( insaan.itlaaqaat ); // will update live with mod ixtyaaraat
					soorahshakl.adaaf( insaan.library );
					hisaab.soorahmuntaxab( hisaab.maxba().muntaxab.shakl );

					soorahshakl.jaddad();
				}
				return soorahshakl;
			}
		},
	};
	
	maxzan.ixtalaq('XPO.hisaab', 0, {
		taxeer: -1, // never axav from xaadim, xaadim uses nashar for that
		kaleedqadr: 1
	});
	
	Hooks.set('XPO.ready', function () {
		var mfateeh = view.mfateeh('XPO.hisaab');

		hisaablist = list( mfateeh.XPO.list ).idprefix('XPO.hisaab')
					.listitem('XPO.hisaabkatab');
		
		hisaab.naqd(); // to keep naqd at the top of the list
		hisaab.jaddad(); // to maintain order

		hisaablist.onpress = function (item, key, uid) {
			if (['XPO.milk', 'XPO.wazaaif'].includes(item.uid))
				katabtags(item);
			else if (item.uid == 'XPO.shakl') iftahshakl(item);
			else if (item.uid == 'XPO.ismmubeen') iftahismmubeen(item);
			else if (item.uid == 'XPO.naqd') bazaar.iftahnaqd();
		};
		shabakah.tawassat('XPO.hisaab', function (intahaa) {
			// receive hisaab updates when signed in
			intahaa( sessions.signedin() ? 1 : undefined );
		});
		maxzan.jawaab.axav('XPO.hisaab', function (jawaab) {
			maxba.hisaab = jawaab;
			maxba.muntaxab = maxba.muntaxab || {};
			jawaab.forEach(function (item) {
				if (['XPO.xsoosyat', 'XPO.shakl', 'XPO.milk', 'XPO.wazaaif']
					.includes(item.uid)) {
					maxba.muntaxab[item.uid] = item.qadr;
				}
			});
			hisaab.jaddad();
//			hisaablist.select();
		});
		maxzan.jawaab.axav('XPO.bazaar', function (jawaab) {
			jawaab.forEach(function (item) {
				if (item.uid == naqdstr)
					hisaab.naqd(item);
				else if (['XPO.xsoosyat', 'XPO.shakl', 'XPO.milk', 'XPO.wazaaif',
						'XPO.xsoosyat_m', 'XPO.shakl_m', 'XPO.milk_m', 'XPO.wazaaif_m']
					.includes(item.uid)) {
					hisaab.maxba(item.uid, item.qadr);
				}
			});
			hisaab.jaddad();
		});

//		$.taxeer('hisaab', function () { pager.intaxab('hisaab', 1); }, 500);
	});
	Hooks.set('XPO.viewready', function (args) {
		if (args.XPO.name == 'XPO.hisaab') {
			webapp.header( /*xlate('XPO.hisaab')*/ );
			softkeys.list.basic(hisaablist);
			hisaablist.select();
			maxzan.axav('XPO.hisaab', 0, 0, helpers.now());
		}
	});
	Hooks.set('XPO.restore', function (args) {
		if (view.axad() === 'XPO.hisaab' && backstack.darajah === 1)
			innertext(XPO.tafawwaq, '');
	});
	
})();
