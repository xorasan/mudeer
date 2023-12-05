//+ xataa
var qasas,
	tbl_qasas = 'qasas0';

;(function(){
	'use strict';
	
	var maxba = {}; // uid: {}
	
	qasas = {
		maxba: function (uid, k, v) {
			if (arguments.length === 0) return maxba;
			var m = maxba[uid];
			if (k && v && !m) m = maxba[uid] = {};
			if (m) {
				if (isundef(k)) { // remove from maxba
					delete maxba[uid];
				} else
				if (isundef(v)) {
					return m[k];
				} else {
					m[k] = v;
				}
			}
		},
		taxeer: function (uid, caaniyaat) {
			var v = qasas.maxba(uid, 'XPO.taxeer');
			var c = new Date().getTime();
			if (isundef(v) || v < c) v = c;

			v += caaniyaat*1000;

			qasas.maxba(uid, 'XPO.taxeer', v);
			qasas.maxba(uid, 'XPO.updated', c);
			
			qasas.intahaakul(uid);
			
			return v;
		},
		a3daa: function (uid, a3daa) {
			var v = qasas.maxba(uid, 'XPO.a3daa');
			if (!areobjectsequal(v, a3daa) && a3daa) {
				qasas.maxba(uid, 'XPO.a3daa', a3daa);
				qasas.maxba(uid, 'XPO.updated', new Date().getTime());
				
				qasas.intahaakul(uid);
			}
		},
		sinf: function (uid, sinf) {
			var v = qasas.maxba(uid, 'XPO.sinf'), yes;
			if (isnum(sinf) && v !== sinf) {
				qasas.maxba(uid, 'XPO.sinf', sinf);
				qasas.maxba(uid, 'XPO.updated', new Date().getTime());
				
				qasas.intahaakul(uid);
			}
		},
		is3udw: function (mklmh, uid, type) { // is member, type
			if (mklmh) {
				if (isstr(mklmh.a3daa0)) {
					if (mklmh.a3daa0.match(' '+uid+':'+(type||'')))
						return 1;
				} else if (mklmh.a3daa) {
					if (mklmh.a3daa[uid]) {
						if (type) return mklmh.a3daa[uid] === type;
						else return 1;
					}
				}
			}
		},
		intahaakul: function (uid) {
//			$.log( 'intahaakul', uid  );
			$.taxeer('XPO.qasasinahaa'+uid, function () {
				var v = qasas.maxba(uid, 'XPO.a3daa');
//				$.log( 'intahaakul ...', v );
				if (v) {
					v = Object.keys(v);
					if (v.length) {
						v = intify( v ); // [ int, int, ... ]
//						$.log( 'intahaakul out', v );
						Polling.intahaakul(v);
					}
				}
			}, 50);
		},
		qeemah: function (hisaab, qadr, arfa3) {
			var ashyaa = { uid0: hisaab.uid }, xataastr = 'XPO.ishtaraafalaah';
			
			if ( isarr(qadr.a3daa) && isnum(qadr.muddah) ) {
				if ( qadr.a3daa.length ) {
					var shayy, shayy2, uid = qadr.muddah;
					shayy = bazaar.xsoosyat[ uid ];
					shayy2 = bazaar.xsoosyat[ arfa3 ];
					
					// shayy exists
					if ( isarr( shayy ) ) {
						// shayy has a price
						if (shayy[0] > 0 && uid > arfa3) {
							var qeemah = shayy[0];
							if (shayy2 && shayy2[0]) qeemah = qeemah - shayy2[0];
							if (qeemah < 0) qeemah = 0;

							// enough money for shayy
							if (qeemah <= hisaab.naqd) {
								if (qeemah) {
//									ashyaa.naqd0 = hisaab.naqd - qeemah;
//									ashyaa.nafaqah0 = hisaab.nafaqah + qeemah;
								}
								
								arfa3 = uid;
							} else xataastr = 'XPO.naqdlayakfaa';
						} else xataastr = 'XPO.majjaani';
					} else xataastr = 'XPO.laayoojid';
				} else xataastr = 'XPO.xataafia3daa';
			} else xataastr = 'XPO.xataafizzaad';
			
			return [xataastr, ashyaa, arfa3];
		},
	};
})();
shabakah.tawassat('XPO.qasas', function (jawaab) {
	if (jawaab.hisaab) {
		var arr = [], objs = [], limit = 100, maxba = qasas.maxba(), yes;

		for (var i in maxba) {
			if (maxba[i].updated > jawaab.waqt
			&& qasas.is3udw(maxba[i], jawaab.hisaab.uid)) {
				objs[i] = {
					uid:		parseint(i),
					taxeer:		maxba[i].taxeer,
				};
				yes = 1;
			}
		}
		arr = Object.values(objs);
		wuqu3aat.query('select * from `'+Config.database.name+'`.`'+tbl_qasas+'` '+
					'where a3daa0 like ? '+
					'and updated0 > ? '+
					'order by updated0 asc limit 0,'+limit,
		[ '% '+jawaab.hisaab.uid+':%', jawaab.waqt ]).then(function (outcome) {
			outcome.rows.forEach(function (o, i) {
				var x = objs[o.uid0] || {}, a3daa = [], a3daaobj = {};
				o.a3daa0.split(' ').forEach(function (v) {
					v = v.split(':');
					var a = parseint(v[0]),
						b = parseint(v[1]);
					if (isnum(a) && isnum(b)) {
						a3daaobj[ a ] = b;
						a3daa.push([ a, b ]);
					}
				});
				qasas.a3daa(o.uid0, a3daaobj);
				x.uid			= o.uid0;
				x.sinf			= o.sinf0;
				x.mowdoo3		= o.mowdoo30;
				x.a3daa			= a3daa;
				x.muddah		= o.muddah0;
				x.muddaharfa3	= o.muddaharfa30;
				x.created		= o.created0;
				x.updated		= o.updated0;
				objs[o.uid0] = x;
			});
			arr = Object.values(objs);
			if (arr.length) jawaab.waaqat(arr), yes = 1;
			if (yes) jawaab.munfaq(); else jawaab.intahaa();
		});
	} else if (yes) jawaab.munfaq(); else jawaab.intahaa();
});
shabakah.waaqat('XPO.qasas', function (jawaab) {
	var qadr = jawaab.qadr;
	
	if (isarr(qadr)) {
		var arr = [];
		qadr.forEach(function (item) {
			if (item.havaf && isnum(item.uid)) arr.push( item.uid );
		});
		helpers.pop(Config.database.name, tbl_qasas, arr, function (outcome) {
			var outarr = [];
			outcome.forEach(function (uid) {
				if (uid) outarr.push({ uid: uid, havaf: 1 });
			});
			jawaab.waaqat(outarr).intahaa();
		});
	} else jawaab.intahaa();
	
	if (!jawaab.hisaab) { jawaab.intahaa(); return; } // not signed in
	if (!qadr) { jawaab.intahaa(); return; } // received nothing
});
shabakah.axav('XPO.qasas', 'XPO.ishtaraa', function (jawaab) {
	var qadr = jawaab.qadr;
	
	if (!jawaab.hisaab) { jawaab.intahaa(); return; } // not signed in
	if (!qadr) { jawaab.intahaa(); return; } // received nothing

	helpers.get(Config.database.name, tbl_qasas, {
		// .get returns false in callback on uids <0 without a database trip!
		uid0: parseint(qadr.uid),
	}, function (row) {
		// TODO check if this account is admin for this mklmh
		
		var muddaharfa3 = 0, xataastr;
		if (row) {
			muddaharfa3 = row.muddaharfa30;
			// direct conversation, invalid request
			if (row.sinf0 === 0) xataastr = 'XPO.xataafizzaad';
		}

		if (xataastr !== 'XPO.xataafizzaad') {
			var ret = qasas.qeemah(jawaab.hisaab, qadr, muddaharfa3),
				ashyaa = ret[1],
				muddaharfa3 = ret[2];
			
			xataastr = ret[0];
		}

		if (['XPO.ishtaraafalaah', 'XPO.majjaani'].includes(xataastr)) {
			qadr.created = new Date().getTime();
			qadr.updated = ashyaa.updated0 = new Date().getTime();
			var a3daa = '', a3daaobj = {};
			Object.values(qadr.a3daa).forEach(function (v) {
				var a = parseint(v[0]),
					b = parseint(v[1]);
				if (isnum(a) && isnum(b)) {
					a3daaobj[ a ] = b;
					a3daa += (' '+a+':'+b);
				}
			});
			helpers.set(Config.database.name, tbl_hsbt, [ashyaa], function (j) {
				helpers.set(Config.database.name, tbl_qasas, [{
					uid0:			parseint(qadr.uid),
					sinf0:			parseint(qadr.sinf) || 1,
					mowdoo30:		parsestring(qadr.mowdoo3, 64),
					muddah0:		parseint(qadr.muddah),
					muddaharfa30:	muddaharfa3,
					a3daa0:			a3daa,
					_created0:		qadr.created,
					updated0:		qadr.updated,
				}], function (outcome) {
					var row = outcome.rows[0];
					qasas.a3daa(row.uid0, a3daaobj);
					qasas.intahaakul(row.uid0); // force out
					jawaab.axav(xataastr).intahaa();
				}, { checkism: false });
			}, { checkism: false });
		}
		else {
			jawaab.axav(xataastr).intahaa();
		}
	});
});
Hooks.set('XPO.bazaarishtaraa', function (zumrah) {
	$.log( 'bazaarishtaraa', zumrah );
	if (zumrah == 600)
		return -1; // don't save anywhere else
});