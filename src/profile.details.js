/*
 * this is for when we'll have a Profile API to add more items
 * kinda like the Settings API
 */
var Profile, profile, ISMMUBEENMAX = 48, TAGMAX = 15; 
;(function(){
	'use strict';

	var iftahkeys, iftahsinf, moneystr = 'money', maxba = {
		muntaxab: {},
	};
	var iftahdisplayname = function (item) {
		Hooks.run('dialog', {
			x: ISMMUBEENMAX,
			c: function (k) {
				item.tafseel = k;
				Offline.adaaf('profile', {
					uid:		item.uid,
					value:		k,
					pending:	1,
				});
			},
			m: 'hifz',
			a: item.value,
			q: 'displayname'
		});
	};
	var katabtags = function (item) { Hooks.run('sheet', {
		t: xlate(item.uid),
		ayyihaal: function () {
			iftahkeys.muyassar.adapter.each(function (o) {
				clearTimeout(o.taxeer);
			});
			
			iftahkeys = 0;
		},
		c: function () {
			var value = [];
			iftahkeys.muntaxab.adapter.each(function (o) {
				value.push( parseint(o.uid) );
			});
			
			Offline.adaaf('profile', {
				uid:		item.uid,
				value:		value,
				pending:	1,
			});
		},
		i: function (k) {
			iftahkeys = k;
			item.value = item.value || [];
			if (!isarr(item.value)) item.value = [];

			iftahkeys = bazaar.nasab({
				sinf: item.uid,
				mfateeh: k,
			});
		},
		n: 'profilemilk',
	}); };
	var iftahshape = function (item) { Hooks.run('sheet', {
		t: xlate(item.uid),
		ayyihaal: function () {
			if (iftahkeys.muntaxab.adapter)
			iftahkeys.muyassar.adapter.each(function (o) {
				clearTimeout(o.taxeer);
			});
			
			iftahkeys = 0;
		},
		c: function () {
			var value = [];
			if (iftahkeys.muntaxab.adapter)
			iftahkeys.muntaxab.adapter.each(function (o) {
				value.push( parseint(o.uid) );
			});
			
			Offline.adaaf('profile', {
				uid:		item.uid,
				value:		value,
				pending:	1,
			});
		},
		i: function (k) {
			iftahkeys = k;
			item.value = item.value || [];
			if (!isarr(item.value)) item.value = [];
			
			var r = profile.soorah(k.soorah);
			r.mowdoo3();
			iftahkeys = bazaar.nasab({
				sinf: item.uid,
				mfateeh: k,
				category: 1,
				muntahaa: 100,
				fimakaan: 1, // baidaa in place
				callback: function () {
					$.taxeer('soorahupdate', function () {
						var arr = [];
						if (iftahkeys.muntaxab.adapter)
						iftahkeys.muntaxab.adapter.each(function (o) {
							arr.push( o.uid );
						});
						profile.soorahmuntaxab(arr, r);
						r.update();
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
			}, 'pd', 'iconkeyboardarrowdown');
			softkeys.set(K.pu, function () {
				iftahkeys.fahras( r.up() );
				r.mowdoo3();
				return 1;
			}, 'pu', 'iconkeyboardarrowup');
		},
		n: 'profileshape',
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
	
	Profile = profile = {
		maxba: function (uid, value) { // set cache
			if (arguments.length === 0 ) return maxba;
			if (['shape', 'milk', 'wazaaif'].includes(uid)) {
				maxba[uid] = Object.assign({}, value);
				delete maxba[uid].time;
//				delete maxba[uid].categories;
			} else {
				maxba[uid] = value;
			}
		},
		getasmaa: function () {
			var asmaa = {};
			if (maxba.shape) {
				for (var rid in maxba.shape.categories) {
					asmaa[ rid ] = maxba.shape.categories[ rid ] || '';
				}
				for (var rid in maxba.shape) {
					if (rid !== 'categories')
						asmaa[ rid ] = maxba.shape[ rid ][ 1 ] || '';
				}
			}
			return asmaa;
		},
		getnaadir: function (category, kul) {
			var out = {};
			for (var i in kul) {
				if (!['time', 'categories'].includes(i)) {
					if (kul[i][2] === category)
						out[i] = kul[i];
				}
			}
			return out;
		},
		moneytafawwaq: function () {
			var e = profilelist.get(0);
			if (e) {
				if (!(view.axad() === 'profile' && backstack.darajah === 1)) {
//					profilelist.select( profilelist.id2num( moneystr ) );
					e = e.cloneNode(true);
					if (view.axad() !== 'profile') {
						var k = templates.keys(e);
						if (k) innertext( k.tafseel, xlate('moneymorein') );
					}
					e.onclick = function () {
						bazaar.open_money();
						innertext(tafawwaq, '');
					};
					innertext(tafawwaq, '');
					tafawwaq.append(e);
				}
				var animation = 'animation';
				setcss(e, animation, 'fadein 0.2s')
				e.dataset.tafawwaq = 1;
				$.taxeer('tafawwaqani', function () {
					setcss(e, animation);
				}, 500);
				$.taxeer('tafawwaq', function () {
					innertext(tafawwaq, '');
					delete e.dataset.tafawwaq;
				}, 5000);
			}
		},
		money: function (item) {
			var money = item ? bazaar.qeemah(item.value) : ['.', '.'];
			profilelist.set({
				uid: moneystr,
				sinf: moneystr,
				vahabp: money[0] ? 'izhar' : 'ixtaf',
				vahab: money[0] || 'ixtaf',
				fiddahp: money[0] && !money[1] ? 'ixtaf' : 'izhar',
				fiddah: money[1] || 0,
				mufarraq: 1,
				mowdoo3: xlate(moneystr),
				tafseel: xlate('moneygetmore'),
				_listitem: 'bazaarmoney',
			});
		},
		update: function () {
			var arr = maxba.profile || ['shape', 'name', 'displayname', 'milk',
										'wazaaif'];
			arr.forEach(function (o) {
				if (typeof o == 'string') o = { uid: o, value: '' };
				
				if (o.uid == 'xsoosyat') return;
				
				o.mowdoo3 = xlate(o.uid);
				o.tafseel = o.value;
				if (['shape'].includes(o.uid)) {
					o.tafseel = '';
					o.madad = xlate('taptocahnge');
					o._listitem = 'profileshape';
				}
					
				if (['name', 'displayname', 'shape'].includes(o.uid))
					o.madad = xlate('taptochange');
		
				o.hifz = o.pending ? xlate('pending') : 'ixtaf';
				if (['milk', 'wazaaif'].includes(o.uid)) {
					var m = o.value, b = maxba[o.uid];
					o.madad = xlate('taptoadd');
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
				var clone = profilelist.set(o);
				if (o.uid === 'shape' && clone)
					profile.soorah( templates.keys(clone).soorah, 120, 100, .55 );
			});
		},
		soorahmuntaxab: function (src, soorah) {
			soorah = soorah || soorahshape;
			var muntaxab = soorah.muntaxab;
			for (var i in soorahdefs) {
				muntaxab[i] = isundef(muntaxab[i]) ? soorahdefs[i] : muntaxab[i];
			}
			if (isarr(src)) soorah.adaafmuntaxab(src);
		},
		soorah: function (soorahtag, w, h, z) {
			if (window.shape && soorahtag) {
				soorahshape = shape(soorahtag);
				if (w && h) {
					soorahshape.setmaxwh(w, h);
					soorahshape.hajm(w, h);
				} else {
					soorahshape.setmaxwh(640, 400);
					soorahshape.hajm(640, 320);
					soorahshape.panhere(320, 120);
				}
				if (z) soorahshape.zoomlevel = z;
				if (insaan && shapepallete) {
					soorahshape.alwaan = shapepallete;
					soorahshape.adaafasmaa( profile.getasmaa() );
					soorahshape.adaafitlaaqaat( insaan.itlaaqaat ); // will update live with mod ixtyaaraat
					soorahshape.adaaf( insaan.library );
					profile.soorahmuntaxab( profile.maxba().muntaxab.shape );

					soorahshape.update();
				}
				return soorahshape;
			}
		},
	};
	
	Offline.create('profile', 0, {
		delay: -1, // never get from server, server uses broadcast for that
		keyvalue: 1
	});
	
	Hooks.set('ready', function () {
		var mfateeh = view.mfateeh('profile');

		profilelist = list( mfateeh.list ).idprefix('profile').listitem('profilekatab');
		
		profile.money(); // to keep money at the top of the list
		profile.update(); // to maintain order

		profilelist.onpress = function (item, key, uid) {
			if (['milk', 'wazaaif'].includes(item.uid))
				katabtags(item);
			else if (item.uid == 'shape') iftahshape(item);
			else if (item.uid == 'displayname') iftahdisplayname(item);
			else if (item.uid == 'money') bazaar.open_money();
		};
		Network.intercept('profile', function (finish) {
			/* receive profile updates when signed in
			 * like with multiple sessions, if u make changes on another client
			 * this one should receive those changes
			 */
			finish( sessions.signedin() ? 1 : undefined );
		});
		Offline.response.get('profile', function (response) {
			maxba.profile = response;
			maxba.muntaxab = maxba.muntaxab || {};
			response.forEach(function (item) {
				if (['xsoosyat', 'shape', 'milk', 'wazaaif']
					.includes(item.uid)) {
					maxba.muntaxab[item.uid] = item.value;
				}
			});
			profile.update();
//			profilelist.select();
		});
		Offline.response.get('bazaar', function (response) {
			response.forEach(function (item) {
				if (item.uid == moneystr)
					profile.money(item);
				else if (['xsoosyat', 'shape', 'milk', 'wazaaif',
						'xsoosyat_m', 'shape_m', 'milk_m', 'wazaaif_m']
					.includes(item.uid)) {
					profile.maxba(item.uid, item.value);
				}
			});
			profile.update();
		});

		$.taxeer('profile', function () { pager.intaxab('profile', 1); }, 500);
	});
	Hooks.set('viewready', function (args) {
		if (args.name == 'profile') {
			webapp.header( ['Profile', 0, 'iconperson'] );
			softkeys.list.basic(profilelist);
			profilelist.select();
			Offline.get('profile', 0, 0, Time.now());
		}
	});
	Hooks.set('restore', function (args) {
		if (view.axad() === 'profile' && backstack.darajah === 1)
			innertext(tafawwaq, '');
	});
	
})();
