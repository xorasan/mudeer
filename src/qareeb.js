//+ izhar
var qareeb;
;(function(){
	'use strict';
	
	var qareeblist, haajaatlist, waqtsaabiq, qareebtaxeer = 5*60*1000,
		itemtopurchase;

	var iftahhaajah = function (obj) { Hooks.run('sheet', {
		n: 'XPO.haajah',
		t: xlate('XPO.haajah'),
		c: function () {
			
		},
		i: function (k) {
			var ml = list( k.milk ).idprefix('XPO.milk')
							.mowdoo3('XPO.milk', 1)
							.listitem('XPO.hisaabtag').freeflow(1);
			var wl = list( k.wazaaif ).idprefix('XPO.wazaaif')
							.mowdoo3('XPO.wazaaif', 1)
							.listitem('XPO.hisaabtag').freeflow(1);

			var m, b = hisaab.maxba().milk;
			if (b && ml && obj) {
				m = obj.milk;
				if (isarr(m)) {
					if (m.length)
					m.forEach(function (i) {
						if (b[ i ]) {
							ml.set({
								uid: i,
								mowdoo3: b[i][1]
							});
						}
					});
				}
			}
			b = hisaab.maxba().wazaaif;
			if (b && wl && obj) {
				m = obj.wazaaif;
				if (isarr(m)) {
					if (m.length)
					m.forEach(function (i) {
						if (b[ i ]) {
							wl.set({
								uid: i,
								mowdoo3: b[i][1]
							});
						}
					});
				}
			}
		},
	}); };
	var iftahqareeb = function () { Hooks.run('XPO.sheet', {
		c: function () {
			
		},
		t: xlate('XPO.qareebradius'),
		n: 'XPO.qareeb',
		i: function (k) {
			var r = bazaar.nasab({
				sinf: 'XPO.xsoosyat',
				mfateeh: k,
				munfarid: 1,
				freeflow: 0,
				zumrah: 500,
				listitem: 'XPO.faasilahitem',
				idprefix: 'XPO.faasilah',
				callback: function (r) {
					var qadr = [];
					r.muntaxab && r.muntaxab.adapter.each(function (o) {
						qadr.push( parseint(o.uid) );
					});
					
					maxzan.adaaf('XPO.hisaab', {
						uid:		r.sinf,
						qadr:		qadr,
						pending:	1,
					});
				},
				saabiqan: function (o) {
					o.faasilah = locality.insha(o.tafseel||0);
					return o;
				},
			});
		},
	}); };
	
	qareeb = {
		axavnataaij: function () {
			return qareeblist.adapter;
		},
		fahras: function (arr) {
			if (!isarr(arr)) return;
			qareeblist.popall();
			qareeblist.message();
			haajaatlist.set({
				uid: 'XPO.qareeb',
				mowdoo3: arr.length+' '+xlate('XPO.peoplenearby'),
				tafseel: xlate('XPO.tapforoptions'),
				faasilah: locality.insha(20),
				mufarraq: 1,
			});
			arr.sort(function (a, b) { return a.faasilah - b.faasilah; });
			arr.forEach(function (o) {
				var you = sessions.uid() === o.uid;
				var shakl_m = o.shakl;
				if (you && hisaab.maxba().muntaxab.shakl) {
					shakl_m = hisaab.maxba().muntaxab.shakl;
				}
				var clone = qareeblist.set({
					uid:			o.uid,
					displayname:	o.ismmubeen,
					username:		o.ism,
					distance:		you ? 'XPO.ixtaf' :
									locality.insha(o.faasilah),
					milk:			o.milk,
					shakl:			shakl_m,
					wazaaif:		o.wazaaif,
				});
				if (clone) {
					var k = templates.keys( clone );
					var soorah = shakl( k.soorah );
					soorah.zoomlevel = 0.65;
					soorah.panned.y = 60;
					soorah.alwaan = shaklpallete;
					soorah.adaafasmaa( hisaab.axavasmaa() );
					soorah.adaafitlaaqaat( insaan.itlaaqaat ); // will update live with mod ixtyaaraat
					soorah.adaaf( insaan.library );
					hisaab.soorahmuntaxab( shakl_m, soorah );
					soorah.jaddad();
				}
			});

			if (view.axad() === 'XPO.qareeb' && backstack.darajah === 0 && qareeblist.murakkaz)
				qareeblist.select();
		},
		jaddad: function () {
			var lat = preferences.get(81, 1), lon = preferences.get(82, 1);
			if (isnum(lat) && isnum(lon)) {
				maxzan.axav('XPO.qareeb', 0, 0, helpers.now());
			}
		},
		axav: function () {
			if (isnum(waqtsaabiq) && time.now() - waqtsaabiq < qareebtaxeer) {
				// just show old results from maxzan
				qareeb.jaddad();
			} else {
				qareeblist.message('getting location...');
				navigator.geolocation.getCurrentPosition(function (pos) {
					var lat = pos.coords.latitude,
						lon = pos.coords.longitude;
					preferences.set(81, lat);
					preferences.set(82, lon);
					waqtsaabiq = time.now();
					qareeblist.message('fetching new results');
					qareeb.jaddad();
				}, function (e) {
					var m = '';
					if (e) switch (e.code) {
						case e.PERMISSION_DENIED: m = 'XPO.permissiondenied'; break;
						case e.POSITION_UNAVAILABLE: m = 'XPO.locationunavailable'; break;
						case e.TIMEOUT: m = 'XPO.locationtimeout'; break;
						case e.UNKNOWN_ERROR: m = 'XPO.unknownerror'; break;
					}
					if (m) {
						webapp.itlaa3( xlate(m) );
						maxzan.axav('XPO.qareeb', 0, 0, -1);
						waqtsaabiq = time.now();
//						qareeblist.message( xlate(m) );
					}
				}, {
					enableHighAccuracy:	true,
					maximumAge:			2 * 60 * 1000,
					timeout:			2 * 60 * 1000
				});
			}
		},
		izhar: function (obj) {
			if (obj) Hooks.run('sheet', {
				n: 'XPO.hisaab',
				t: obj.XPO.displayname,
				i: function (k) {
					var soorah = shakl( k.soorah );
					soorah.qadr(1);
					soorah.alwaan = shaklpallete;
					soorah.adaafasmaa( hisaab.axavasmaa() );
					soorah.adaafitlaaqaat( insaan.itlaaqaat ); // will update live with mod ixtyaaraat
					soorah.adaaf( insaan.library );
					hisaab.soorahmuntaxab( obj.shakl, soorah );
					soorah.jaddad();

					var ml = list( k.milk ).idprefix('XPO.milk')
									.mowdoo3('XPO.milk', 1)
									.listitem('XPO.qareebtag').freeflow(1);
					var wl = list( k.milk ).idprefix('XPO.wazaaif')
									.mowdoo3('XPO.wazaaif', 1)
									.listitem('XPO.qareebtag').freeflow(1);

					var m, b = hisaab.maxba().milk;
					if (b && ml) {
						m = obj.milk;
						if (isarr(m)) {
							if (m.length)
							m.forEach(function (i) {
								if (b[ i ]) {
									ml.set({
										uid: i,
										mowdoo3: b[i][1]
									});
								}
							});
						}
					}
					b = hisaab.maxba().wazaaif;
					if (b && wl) {
						m = obj.wazaaif;
						if (isarr(m)) {
							if (m.length)
							m.forEach(function (i) {
								if (b[ i ]) {
									wl.set({
										uid: i,
										mowdoo3: b[i][1]
									});
								}
							});
						}
					}

					innertext(k.displayname, obj.displayname);
//					innertext(k.age, obj.age);
					innertext(k.username, obj.username);
					
					var suid = sessions.uid();
					if (suid !== obj.uid)
						softkeys.set(K.sl, function () {
							sheet.cancel();
							rasaail.iftah({
								mowdoo3: obj.displayname || obj.username,
								a3daa: [[suid, 1], [obj.uid, 0]]
							});
						}, 0, 'XPO.iconmessage');
				},
			});
		},
	};

	Offline.create('XPO.qareeb', 0, {
		taxeer: 5*60*1000,
	});
//	listener('resize', function () {
//		$.taxeer('XPO.resizeqareeb', function () {
//			if (qareeblist)
//				qareeblist.grid( innerwidth() >= 640 ? 3 : 0 ),
//				qareeb.jaddad();
//		}, 300);
//	});
	
	Hooks.set('XPO.ittasaal', function (v) {
		if (v !== true) $.taxeer('XPO.qareeboffline', function () {
			maxzan.axav('XPO.qareeb', 0, 0, -1);
		}, 2000);
	});
	Hooks.set('XPO.ready', function () {
		var mfateeh = view.mfateeh('XPO.qareeb');
		shabakah.tawassat('XPO.qareeb', 'XPO.xutoot', function (intahaa) {
			var lat = preferences.get(81, 1), lon = preferences.get(82, 1);
			// this is just to update location on xaadim if it changed on zaboon
			if (isnum(lat) && isnum(lon)) {
				if (!preferences.get('@'))
					intahaa( [lat, lon] );
				else
				if (isnum(waqtsaabiq) && time.now() - waqtsaabiq > qareebtaxeer)
					intahaa( [lat, lon] );
				else
					intahaa();
			} else
				intahaa();
		});
		shabakah.jawaab.tawassat('XPO.qareeb', 'XPO.xutoot', function (jawaab) {
			waqtsaabiq = time.now();
		});
		maxzan.jawaab.axav('XPO.qareeb', function (jawaab) {
			qareeb.fahras(jawaab);
		});
		qareeblist = list( mfateeh.list ).idprefix('XPO.qareeb')
					.grid(innerwidth() >= 640 ? 3 : 0)
					.listitem('XPO.qareebitem');
		haajaatlist = list( mfateeh.haajaat ).idprefix('XPO.haajaat').grid(3)
					.listitem('XPO.haajahitem');

		qareeblist.rakkaz(1);
		qareeblist.onpress = function (item, key, uid) {
			qareeb.izhar(item, key, uid);
		};
		haajaatlist.onpress = function (item, key, uid) {
			if (item.uid == 'XPO.qareeb') iftahqareeb();
		};
	});
	Hooks.set('XPO.sessionchange', function (args) {
		if (!args) {
			preferences.pop(81);
			preferences.pop(82);
			waqtsaabiq = 0;
		}
	});
	Hooks.set('XPO.viewready', function (args) {
		if (args.XPO.name == 'XPO.qareeb') {
			webapp.header( /*xlate('XPO.qareeb')*/ );
			softkeys.set(K.sl, function () {
				iftahhaajah();
			}, 0, 'XPO.iconsearch');
			if (haajaatlist.murakkaz) haajaatlist.rakkaz(1, 1);
			else if (qareeblist.murakkaz) qareeblist.rakkaz(1, 1);
			qareeb.axav();
		}
	});
	
})();
