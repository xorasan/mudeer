//+ xataa
var mukaalamaat,
	tbl_mklmt = 'mukaalamaat0';

;(function(){
	'use strict';
	
	var maxba = {}; // uid: {}
	
	mukaalamaat = {
		raakib: function (a3daa) { // non-member profile
			if (isarr(a3daa))
			for (var i = 0; i < a3daa.length; ++i) {
				var v = a3daa[i];
				if (v[1] !== 1) return v;
			}
		},
		uxraa: function (a3daa, suid) { // other profile
			if (isarr(a3daa))
			for (var i = 0; i < a3daa.length; ++i) {
				var v = a3daa[i];
				if (v[0] !== suid) return v;
			}
		},
		intaa: function (a3daa, suid) {
			if (isarr(a3daa))
			for (var i = 0; i < a3daa.length; ++i) {
				var v = a3daa[i];
				if (v[0] === suid) return v;
			}
		},
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
			var v = mukaalamaat.maxba(uid, 'XPO.taxeer');
			var c = new Date().getTime();
			if (isundef(v) || v < c) v = c;

			v += caaniyaat*1000;

			mukaalamaat.maxba(uid, 'XPO.taxeer', v);
			mukaalamaat.maxba(uid, 'XPO.updated', c);
			
			mukaalamaat.intahaakul(uid);
			
			return v;
		},
		a3daa: function (uid, a3daa) {
			var v = mukaalamaat.maxba(uid, 'XPO.a3daa');
			if (!areobjectsequal(v, a3daa) && a3daa) {
				mukaalamaat.maxba(uid, 'XPO.a3daa', a3daa);
				mukaalamaat.maxba(uid, 'XPO.updated', new Date().getTime());
				
				mukaalamaat.intahaakul(uid);
			}
		},
		a3daa2str: function (arr) {
			var str = '';
			arr.forEach(function (o) {
				str += ' '+o[0]+':'+o[1];
			});
			return str;
		},
		toa3daa: function (str) {
			var a3daa = [];
			str.trim().split(' ').forEach(function (v) {
				v = intify(v.split(':'));
				a3daa.push( [v[0], v[1]] );
			});
			return a3daa;
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
		ismaftooh: function (mklmh, uid) { // are both members
			if (mklmh) {
				if (isstr(mklmh.a3daa0)) {
					if (mklmh.a3daa0.match(' '+uid+':1')
					&&	mklmh.a3daa0.match(/\:1/g).length >= 2)
						return 1;
				} else if (mklmh.a3daa) {
					var v = Object.values(mklmh.a3daa);
					if (mklmh.a3daa[uid] === 1 && v[0] === 1 && v[1] === 1) {
						return 1;
					}
				}
			}
		},
		intahaakul: function (uid) {
//			$.log( 'intahaakul', uid  );
			$.taxeer('XPO.mlkmtinahaa'+uid, function () {
				var v = mukaalamaat.maxba(uid, 'XPO.a3daa');
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
	};
})();
shabakah.tawassat('XPO.mukaalamaat', function (jawaab) {
	if (jawaab.hisaab) {
		var arr = [], objs = [], limit = 100, maxba = mukaalamaat.maxba(), yes;

		for (var i in maxba) {
			if (maxba[i].updated > jawaab.waqt
			&& mukaalamaat.is3udw(maxba[i], jawaab.hisaab.uid)) {
				objs[i] = {
					uid:		parseint(i),
					taxeer:		maxba[i].taxeer,
				};
				yes = 1;
			}
		}
		arr = Object.values(objs);
		wuqu3aat.query('select * from `'+Config.database.name+'`.`'+tbl_mklmt+'` '+
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
				mukaalamaat.a3daa(o.uid0, a3daaobj);
				x.uid			= o.uid0;
				x.a3daa			= a3daa;
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
shabakah.waaqat('XPO.mukaalamaat', function (jawaab) {
	var qadr = jawaab.qadr;
	
	if (!jawaab.hisaab) { jawaab.intahaa(); return; } // not signed in
	if (!qadr) { jawaab.intahaa(); return; } // received nothing
	
	if (isarr(qadr)) {
		var arr = [];
		qadr.forEach(function (item) {
			if (isnum(item.uid)) arr.push({ uid0: item.uid });
		});
		helpers.getallbyuid(Config.database.name, tbl_mklmt, arr, function (rows) {
			var suid = jawaab.hisaab.uid, ct = new Date().getTime(),
				riddah = [], mklmt = [], lihifz = [];
			qadr.forEach(function (item) {
				var m = parseint(item.uid), mklmh = rows.get(m), a3daa2 = item.a3daa;
				if (isarr(a3daa2) && mklmh && mukaalamaat.is3udw(mklmh, suid)) {
					// judge where we are at already
					var a3daa = mukaalamaat.toa3daa(mklmh.a3daa0), yes = 1,
						uxraa = mukaalamaat.uxraa(a3daa, suid),
						intaa = mukaalamaat.intaa(a3daa, suid),
						uxraa2 = mukaalamaat.uxraa(a3daa2, suid),
						intaa2 = mukaalamaat.intaa(a3daa2, suid),
						o = {
							uid: m,
							created: mklmh.created0,
							updated: mklmh.updated0,
						},
						shayy = { uid0: m, updated0: ct };

					if (isarr(uxraa) && isarr(intaa)) {
						// other has -3:blocked, you can't do anything
						// you have self -3:blocked, wanna unblock 0:stale
						// you're 0:stale, wanna -1:invite other and 1:member self
						// you have self -2:rejected, wanna accept 1:member
						// you're 1:member, another is -1:invited, nothing to do
						// you're -1:invited, another is 1:member, 1:accept, -2:reject, -3:block
						// else in any case you wanna self -3:block except other's -3

						if (uxraa[1] === -3) {
							yes = 0;
						} else
						if (intaa[1] === -3) {
							if (intaa2[1] === 0) intaa[1] = 0;
							if (intaa2[1] === 1) {
								intaa[1] = 1;
								if (uxraa[1] !== -2) {
									uxraa[1] = -1;
									shayy.havaf0 = ct;
								}
							}
						} else
						if ([-2, 0].includes(intaa[1])) {
							if (intaa2[1] === 1) {
								intaa[1] = 1;
								if (uxraa[1] === 0) {
									uxraa[1] = -1;
									shayy.havaf0 = ct;
								}
							}
						} else
						if (intaa[1] === 0 && uxraa[1] === 1) {
							if (intaa2[1] === 1) {
								intaa[1] = 1;
							}
						} else
						if (intaa[1] === -1 && uxraa[1] === 1) {
							if (intaa2[1] === 1) {
								intaa[1] = 1;
							}
							if (intaa2[1] === -2) {
								intaa[1] = -2;
								shayy.havaf0 = ct;
							}
							if (intaa2[1] === -3) {
								intaa[1] = -3;
							}
						}

						if (uxraa[1] !== -3 && intaa2[1] === -3) {
							intaa[1] = -3;
							if (uxraa[1] === -1) uxraa[1] = 0;
						}
						
						if (yes) {
							var a3daastr = mukaalamaat.a3daa2str([intaa, uxraa]);
							o.a3daa = [intaa, uxraa];
							shayy.a3daa0 = a3daastr;
							o.havaf = shayy.havaf0;
							mklmt.push(o);
							lihifz.push(shayy);
						}
					} else riddah.push(o);
				} else riddah.push({ uid: m, havaf: -1 });
			});
			helpers.set(Config.database.name, tbl_mklmt, lihifz, function (outcome) {
				jawaab.waaqat(mklmt.concat(riddah)).intahaa();
			}, { checkism: false });
		});
	} else jawaab.intahaa();
});
shabakah.axav('XPO.mukaalamaat', 'XPO.da3wah', function (jawaab) {
	var prof1 = jawaab.qadr, prof0 = jawaab.hisaab.uid;
	
	if (!jawaab.hisaab) { jawaab.intahaa(); return; } // not signed in
	if (!isnum(prof1) || prof1 <= 0 || prof1 === prof0) {
		jawaab.intahaa(); return;
	} // received nothing

	helpers.get(Config.database.name, tbl_hsbt, { uid0: prof1 }, function (hsb) {
	if (hsb)
	wuqu3aat.query('select * from `'+Config.database.name+'`.`'+tbl_mklmt+'` '+
				'where (a3daa0 like ? or a3daa0 like ?) '+
				'order by updated0 asc limit 0,'+1,
	[ '% '+prof1+':% '+prof0+':%', ' '+prof0+':% '+prof1+':%' ]).then(function (outcome) {
		// prof0:1 ensures you're requesting, if nothing found, returns xataa :)
		var haalah = 0, uid, row = outcome.rows[0], out = {},
			a3daa, a3daaobj = {}, a3daastr = '';
		if (row) {
			uid = row.uid0; a3daa = row.a3daa0;
			out.uid = uid;
			out.created = row.created0;
			out.updated = row.updated0;
			out.a3daa = [[prof0, 1], [prof1, -1]];
			a3daa.split(' ').forEach(function (v) {
				v = v.split(':');
				var a = parseint(v[0]), b = parseint(v[1]);
				if (isnum(a) && isnum(b)) {
					a3daaobj[ a ] = b;
					a3daastr += ' '+a+':';
					if (a === prof0) {
						a3daastr += 1;
					} else {
						a3daastr += -1;
					}
				}
			});
		} else {
			out.a3daa = [[prof0, 1], [prof1, -1]];
			a3daaobj[ prof0 ] = 1;
			a3daaobj[ prof1 ] = -1;
			a3daastr = ' '+prof0+':1 '+prof1+':-1';
		}

		if (haalah === 0) { // only request if 7d passed or never requested b4
			var created = new Date().getTime();
			helpers.set(Config.database.name, tbl_mklmt, [{
				uid0:			uid,
				a3daa0:			a3daastr,
				_created0:		created,
				updated0:		created,
			}], function (outcome) {
				var row = outcome.rows[0];
				out.uid = row.uid0;
				out.created = row.created0;
				out.updated = row.updated0;
				mukaalamaat.a3daa(row.uid0, a3daaobj);
				mukaalamaat.intahaakul(row.uid0); // force out
				jawaab.axav(out).intahaa();
			}, { checkism: false });
		}
		else jawaab.axav(out).intahaa();
	});
	else jawaab.axav().intahaa();
	});
});
shabakah.duf3ah('XPO.mukaalamaat', function () {
	wuqu3aat.query('select * from `'+Config.database.name+'`.`'+tbl_mklmt+'` '+
				'where a3daa0 like ? '+
				'order by updated0 asc limit 0,'+100,
	[ '%:-2%' ]).then(function (outcome) {
		var tarmeem = [], ct = new Date().getTime();
		outcome.rows.forEach(function (o) {
			if (ct-o.havaf0 < 5 * 60 * 1000) tarmeem.push({
				uid0: o.uid0,
				ad3aa0: o.a3daa0.replace(':-2', ':0'),
				havaf0: ct,
			});
			helpers.set(Config.database.name, tbl_mklmt, tarmeem, function (outcome) {
			}, { checkism: false });
		});
	});
});
