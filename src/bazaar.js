//+ qeemah_raw uid_raw mushtaran madad_raw axav iftahnaqd taptobuy
var bazaar, ISMMUBEENMAX = 48;
;(function(){
	'use strict';
	
	var naqdstr = 'XPO.naqd', itemtopurchase, tanseeb;
	
	bazaar = {
		nasab: function (o) {
			var k = o.mfateeh;
			o.idprefix = o.idprefix || '';
			o.listitem = o.listitem || 'XPO.bazaaritem';
			o.muyassar = list( k.muyassar ).idprefix(o.idprefix+'XPO.muyassar')
						.listitem(o.listitem).mowdoo3('XPO.ishtaraa', 1);
			if (!o.mustaqeem) {
				o.majjaani = list( k.majjaani ).idprefix(o.idprefix+'XPO.majjaani')
							.listitem(o.listitem).mowdoo3('XPO.majjaani', 1);
				o.mshtryaat = list( k.mshtryaat ).idprefix(o.idprefix+'XPO.mshtryaat')
							.listitem(o.listitem).mowdoo3('XPO.mushtaran', 1);
				o.majjaani.beforepress = function () {
					o.mshtryaat.rakkaz();
					o.muyassar.rakkaz();
					if (o.muntaxab) o.muntaxab.rakkaz();
				};
				o.mshtryaat.beforepress = function () {
					o.majjaani.rakkaz();
					o.muyassar.rakkaz();
					if (o.muntaxab) o.muntaxab.rakkaz();
				};
				o.muyassar.beforepress = function () {
					o.majjaani.rakkaz();
					o.mshtryaat.rakkaz();
					if (o.muntaxab) o.muntaxab.rakkaz();
				};
			}
			o.muyassar.onpress = function (item) {
				if (o.fimakaan && o.mustaqeem) { // dont remove just highlight
					this.baidaa();
				} else
					bazaar.taptobuy(o.sinf, item, o);
			};
			
			// if higher priced items purchased, lower become free
//			o.mustaqeem
			/* you can send this hint in once you've selected the muddah for a
			 * mklmh & saved the it, the next time it is edited, this hint makes
			 * it so that lower muddaat won't be available, this hint needs a
			 * bazaar value to calc what values are lower than it
			 * */
//			o.a3laafaqat
			
			if (!o.sinf) return;
			
			if (o.mustaqeem) {
				o.muyassar.mowdoo3();
				if (o.mowdoo3) o.muyassar.mowdoo3(o.mowdoo3, 1);
			}
			if (o.freeflow !== 0 && !o.grid) {
				if (!o.mustaqeem) {
					o.mshtryaat.freeflow(1);
					o.majjaani.freeflow(1);
				}
				o.muyassar.freeflow(1);
			}
			if (o.grid) {
				if (!o.mustaqeem) {
					o.mshtryaat.grid(o.grid);
					o.majjaani.grid(o.grid);
				}
				o.muyassar.grid(o.grid);
			}
			if (o.munfarid) {
				o.majjaani.onpress =
				o.mshtryaat.onpress = function (item) {
					o.callback && o.callback(item);
				};
			}
			else if (!o.mustaqeem) {
				o.muntaxab = list( k.muntaxab ).idprefix(o.idprefix+'XPO.muntaxab')
							.listitem(o.listitem).mowdoo3('XPO.muntaxab', 1)
							.muntahaa(o.muntahaa || 15);

				o.muntaxab.beforepress = function () {
					if (o.mshtryaat) o.mshtryaat.rakkaz();
					if (o.majjaani) o.majjaani.rakkaz();
					o.muyassar.rakkaz();
				};
				if (o.mustaqeem) {
					o.muyassar.mowdoo3();
					if (o.mowdoo3) o.muyassar.mowdoo3(o.mowdoo3, 1);
				}
				if (o.fimakaan) o.muntaxab.ixtaf();
				if (o.freeflow !== 0 && !o.grid) {
					if (!o.mustaqeem)
						o.muntaxab.freeflow(1);
				}
				if (o.grid) {
					if (!o.mustaqeem)
						o.muntaxab.grid(o.grid);
				}
				
				o.muntaxab.beforeset = function (item) {
					if (isnum(o.zumrah)) { // only allow one selected tag per sinf
						var topop = [];
						o.muntaxab.adapter.each(function (olditem) {
							if (olditem.zumrah === item.zumrah && olditem.uid !== item.uid) {
								topop.push( olditem);
							}
						});
						topop.forEach(function (i) {
							o.muntaxab.onpress( i );
						});
					}
					o.callback && o.callback(item);
					return item;
				};

				k.bahac && o.mshtryaat.bahac(k.bahac);

				o.mshtryaat.uponbahac = function (str) {
					bazaar.bahac(o, str);
				};
				o.muntaxab.onpress = function (item) {
					bazaar.adaaf( o, item.uid, item.mowdoo3, item.qeemah_raw, item.tafseel );
					this.pop( item.uid );
					if (this.length() === 0) focusnext(this.element);
					o.callback && o.callback(item);
				};
				o.majjaani.onpress =
				o.mshtryaat.onpress = function (item) {
					var item = Object.assign({}, item);
					item.madad = xlate('XPO.taptoremove');
					item.premium = item.qeemah_raw === 0 ? 'XPO.ixtaf' : 'XPO.izhar';
					item.qeemah = 'XPO.ixtaf';
					if (o.muntaxab.set(item)) {
						if (o.fimakaan) { // dont remove just highlight
							this.baidaa();
						} else {
							this.pop(item.uid);
							this.select();
//							o.muntaxab.intaxabsaamitan();
							if (this.length() === 0) focusprev(this.element);
						}
						o.callback && o.callback(item);
					}
				};
			}

			// call this 1st, because bahac checks muntaxablist.adapter
			bazaar.fahras(o);
			bazaar.bahac(o, 0);
			
			if (k.bahac)
			$.taxeer('XPO.shaklrakkaz', function () {
				k.bahac.focus();
			}, 100);
			else {
				if (!o.mustaqeem) {
					o.majjaani.rakkaz(1, 1);
					o.majjaani.select();
				}
			}
			o.fahras = function (zumrah) {
				o.zumrah = zumrah;
				bazaar.bahac(o, 0); // auto clears all lists

				if (!o.mustaqeem) {
					o.muntaxab.	rakkaz();
					o.mshtryaat.rakkaz();
					o.majjaani.	rakkaz();
				}
				o.muyassar.	rakkaz();

				if (o.mustaqeem) {
					if (o.muyassar.length())	o.muyassar.		select(0);
					if (o.intaxab) o.muyassar.baidaa( o.muyassar.id2num( o.intaxab ) );
				} else {
						 if (o.mshtryaat.length())	o.mshtryaat.	select(0);
					else if (o.majjaani.length())	o.majjaani.		select(0);
					else if (o.muyassar.length())	o.muyassar.		select(0);
					else if (o.muntaxab.length())	o.muntaxab.		select(0);
				}
			};
			return o;
		},
		fahras: function (o) {
			var b = hisaab.maxba()[o.sinf],
				m = hisaab.maxba().muntaxab[o.sinf];
			if (b) {
				if (isarr(m) && m.length) {
					m.forEach(function (i) {
						if (b[i]) { // does it exist in bazaar
							o.muntaxab.set({
								uid: parseint(i),
								mowdoo3: b[ i ][1],
								zumrah: b[ i ][2],
								madad: xlate('XPO.taptoremove'),
								qeemah_raw: b[ i ][0] === 0 ? 0 : -1,
								qeemah: 'XPO.ixtaf',
								premium: b[ i ][0] === 0 ? 'XPO.ixtaf' : 'XPO.izhar',
							});
						}
					});
				}
			}
		},
		taptobuy: function (sinf, o, tnsb) {
			if (o && o.qeemah_raw && tnsb.muyassar && tnsb.sinf) {
				if (o.madad == xlate('XPO.taptobuy')) {
					o.madad = xlate('XPO.tapagainbuy');
					tnsb.muyassar.set(o);
					clearTimeout(o.taxeer);
					o.taxeer = setTimeout(function () {
						o.madad = xlate('XPO.taptobuy');
						tnsb.muyassar && tnsb.muyassar.set(o);
					}, 1000);
				} else if (o.madad == xlate('XPO.tapagainbuy')) {
					itemtopurchase = o;
					tanseeb = tnsb;
					shabakah.axav('XPO.bazaar', 'XPO.ishtaraa', [tnsb.sinf, parseint(o.uid)]);
					o.madad = xlate('XPO.buyprocess');
					tnsb.muyassar.set(o);
					clearTimeout(o.taxeer);
					o.taxeer = setTimeout(function () {
						o.madad = xlate('XPO.taptobuy');
						tnsb.muyassar && tnsb.muyassar.set(o);
					}, 15000);
				}
			};
		},
		adaaf: function (o, uid, mowdoo3, qeemah, tafseel) {
			var shouldbefree = 0, discount = 0;
			var b = hisaab.maxba()[o.sinf];
			// qeemah -1=mshtryaat, 0=majjaani, 1=muyassar
			var LV = o.muyassar, // available
				item = {
					uid: parseint(uid),
					mowdoo3: mowdoo3,
					zumrah: b[ uid ][2],
					madad: o.fimakaan ? xlate('XPO.taptoselect') : xlate('XPO.taptoadd'),
					qeemah: 'XPO.ixtaf',
					qeemah_raw: qeemah,
					tafseel: tafseel,
				};

			if (isnum(o.arfa3)) {
				if (item.uid < o.arfa3) {
					shouldbefree = 1;
				} else {
					if (b[ o.arfa3 ]) discount = b[ o.arfa3 ][0];
				}
			}

			if (qeemah === -1) {
				LV = o.mshtryaat; // purchased
			}
			else if (qeemah === 0) {
				LV = o.majjaani; // free
			}
			else if (qeemah > 0) {
				if (!shouldbefree) {
					if (isnum(discount)) qeemah = qeemah - discount;
					if (qeemah > 0) {
						qeemah			= bazaar.qeemah(qeemah);
						item.qeemah		= 'XPO.izhar';
						item.vahabp		= qeemah[0] == 0 ? 'XPO.ixtaf' : 'XPO.izhar';
						item.vahab		= qeemah[0];
						item.fiddahp	= qeemah[0] && !qeemah[1] ? 'XPO.ixtaf' : 'XPO.izhar',
						item.fiddah		= qeemah[1];
						item.madad		= xlate('XPO.taptobuy');
					}
				}
				item._listitem	= o.listitem;
			}
			if (o.mustaqeem) {
				item.madad = xlate('XPO.taptoselect');
				LV = o.muyassar;
			}
			
			// to allow custom listitem setup kmcl .beforeset
			if (isfun(o.saabiqan)) item = o.saabiqan(item);

			if (LV) {
				LV.set(item);
				return LV
			}
		},
		mowjood: function (o, i) {
			if (!isundef(o.intaxab)) {
				if (o.intaxab === parseint(i))
					return 1;
				return 0;
			} else
			if (o.muntaxab && o.muntaxab.adapter.get( i )) // muntaxab
				return 1;
			
			return 0;
		},
		bahac: function (o, str) {
//			if (!str) return;

			var m, b = hisaab.maxba()[o.sinf];
			if (b && o.muyassar) {
				if (!o.mustaqeem) {
					o.mshtryaat.popall();
					o.majjaani.popall();
				}
				o.muyassar.popall();
				// if you're saving mshtryaat not in hisaab but elsewhere
				if (o.mshtryaatsaabiq) m = o.mshtryaatsaabiq;
				else if (o.sinf == 'XPO.xsoosyat') m = hisaab.maxba().xsoosyat_m;
				else if (o.sinf == 'XPO.milk'	 ) m = hisaab.maxba().milk_m	;
				else if (o.sinf == 'XPO.wazaaif' ) m = hisaab.maxba().wazaaif_m	;
				else if (o.sinf == 'XPO.shakl'	 ) m = hisaab.maxba().shakl_m	;
				if (isarr(m)) {
					if (m.length) // purchased
					m.forEach(function (i) {
						if (b[ i ]) {
							if (!str || b[ i ][1].includes(str)) {
								var yes = 1;
								if (isnum(o.zumrah)) {
									yes = o.zumrah === b[ i ][2];
								}
								var mowjood = bazaar.mowjood(o, i);
								if (o.fimakaan && !o.mustaqeem) mowjood = o.muntaxab.adapter.get( i );
								if (yes && (!mowjood || o.fimakaan)) {
									var LV = bazaar.adaaf(o, i, b[i][1], -1, b[i][3]);
									if (o.fimakaan && mowjood && LV)
										LV.baidaa( LV.id2num( parseint(i) ) );
								}
							}
						}
					});
					for (var i in b) {
						if ( !['XPO.waqt', 'XPO.zumar'].includes(i)
						&& !m.includes( parseint(i) ) ) {
							if (!str || b[ i ][1].includes(str)) {
								var yes = 1;
								if (isnum(o.zumrah)) {
									yes = o.zumrah === b[ i ][2];
								}
								var mowjood = bazaar.mowjood(o, i);
								if (o.fimakaan && !o.mustaqeem) mowjood = o.muntaxab.adapter.get( i );
								if (yes && (!mowjood || o.fimakaan)) {
									var LV = bazaar.adaaf(o, i, b[i][1], b[i][0], b[i][3]);
									if (o.fimakaan && mowjood && LV)
										LV.baidaa( LV.id2num( parseint(i) ) );
								}
							}
						}
					}
				}
			}
		},
		iftahnaqd: function () { Hooks.run('XPO.sheet', {
			i: function (k) {
				var selected;
				var naqdlist = list(k.list).idprefix('XPO.naqd')
									.listitem('XPO.bazaarishtaraa')
									.grid(2);
				naqdlist.uponrakkaz = function (v) {
					if (v) attribute(k.ishtaraa, 'disabled', '1');
				};
				naqdlist.onpress = function (item, key, uid) {
					selected = item;
					this.baidaa();
					$.taxeer('XPO.focusdelay', function () {
						attribute(k.ishtaraa, 'disabled', '');
						naqdlist.rakkaz();
						k.ishtaraa.focus();
					}, 100);
					return 1;
				};
				softkeys.list.basic(naqdlist);
				var sutoor = ['Personal', 'Pro', 'Power', 'Business', 'Expansion', 'Dominance'];
				[1, 5, 10, 50, 100, 250].forEach(function (item, i) {
					var naqd = bazaar.qeemah(item);
					naqdlist.set({
						uid: i,
						qeemah_raw: item,
						vahabp: naqd[0] ? 'XPO.izhar' : 'XPO.ixtaf',
						vahab: naqd[0] || 'XPO.ixtaf',
						fiddahp: naqd[1] ? 'XPO.izhar' : 'XPO.ixtaf',
						fiddah: naqd[1] || 'XPO.ixtaf',
						mowdoo3: '$'+(item * 2),
						tafseel: sutoor[i],
					});
				});
				naqdlist.select();
				k.ishtaraa.onclick = function () {
					shabakah.axav('XPO.bazaar', 'XPO.naqd', selected.qeemah_raw);
					attribute(k.ishtaraa, 'disabled', 1);
					innertext(k.ishtaraa, 'processing...');
				};
			},
			n: 'XPO.naqdgetmore',
			t: xlate('XPO.naqd'),
		}); },
		qeemah: function (q) {
			return [ q - (q % 1), Math.round( (q % 1) * 100 ) ];
		},
	};
	
	maxzan.ixtalaq('XPO.bazaar', 0, {
		taxeer: -1, // never axav from xaadim, xaadim uses nashar for that
		kaleedqadr: 1,
	});
	
	Hooks.set('XPO.ready', function () {
		shabakah.tawassat('XPO.bazaar', function (intahaa) {
			// receive bazaar updates when signed in
			intahaa( sessions.signedin() ? 1 : undefined );
		});
		shabakah.jawaab.axav('XPO.bazaar', 'XPO.naqd', function (jawaab) {
			if (sheet && sheet.zaahir('XPO.naqdgetmore')) {
				webapp.itlaa3('transaction successful');
				backstack.back();
			}
		});
		shabakah.jawaab.axav('XPO.bazaar', 'XPO.ishtaraa', function (jawaab) {
			if (itemtopurchase && isarr(jawaab)) {
				if (tanseeb.muyassar && tanseeb.muyassar) {
					var xataastr = jawaab[2];
					var o = tanseeb.muyassar.adapter.get(jawaab[1]);
					if (o) {
						clearTimeout(o.taxeer);
						if (xataastr === 'XPO.ishtaraafalaah') {
							// even if it fails, nashar handles it
							o.madad = xlate('XPO.taptoremove');
							o.qeemah_raw = -1;
							o.premium = 'XPO.izhar';
							if (tanseeb.muntaxab) o._listitem = tanseeb.muntaxab._listitem;
							// temporarily show total money box on top most layer
							hisaab.naqdtafawwaq();
							var yes;
							if (tanseeb.muntaxab && !tanseeb.muntaxab.set(o)) { // if list is full
								// try adding it to purchased
								yes = 1;
							} else {
								yes = 1;
							}
							if (yes) {
								o.premium = 'XPO.ixtaf';
								o.madad = xlate('XPO.taptoadd');
								o._listitem = tanseeb.muyassar._listitem;
								tanseeb.muyassar && tanseeb.muyassar.set(o);
							}
							tanseeb.muyassar.pop(o.uid);
						}
						else {
							if (xataastr === 'XPO.naqdlayakfaa') hisaab.naqdtafawwaq();
							o.madad = xlate(xataastr);
							o.taxeer = setTimeout(function () {
								 o.madad = xlate('XPO.taptobuy');
								 tanseeb.muyassar && tanseeb.muyassar.set(o);
							}, 2000);
							tanseeb.muyassar.set(o);
						}
					}
				}
			}
		});
		
		// this is to build the cache first so hisaab tags will show up
		maxzan.axav('XPO.bazaar', 0, 0, helpers.now());
	});
	
})();
