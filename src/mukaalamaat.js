//+ fahras an3ash kitabat ta3daadmatn iftah intaa
/* qanaah 
 * 	[ musalsal max: 24?
 * 		[ mukaalamah
 * 
 * */
var mukaalamaat;
;(function(){
	var mukaalamaatlist, keys, oldresults = [], soorah,
	waqtsaabiq = 0, mklmttaxeer = 3*60*1000,
	ta3daad = function () {
		var l = mukaalamaatlist.length();
		if (view.axav() === 'XPO.mukaalamaat' && backstack.darajah === 1) {
			webapp.header( l ? (l+' '+translate('XPO.mukaalamaat'))
							: translate('XPO.nomukaalamaat') );
			mukaalamaatlist.select();
		}
		mukaalamaatlist.message(l ? undefined : translate('XPO.nomukaalamaat') );
	};
	
	mukaalamaat = {
		raakib: function (a3daa) { // non-member profile
			if (isarr(a3daa))
			for (var i = 0; i < a3daa.length; ++i) {
				var v = a3daa[i];
				if (v[1] !== 1) return v;
			}
		},
		intaa: function (a3daa) { // your profile
			if (isarr(a3daa))
			for (var i = 0; i < a3daa.length; ++i) {
				var v = a3daa[i];
				if (v[0] === sessions.uid()) return v;
			}
		},
		uxraa: function (a3daa) { // other profile
			if (isarr(a3daa))
			for (var i = 0; i < a3daa.length; ++i) {
				var v = a3daa[i];
				if (v[0] !== sessions.uid()) return v;
			}
		},
		haalah: function (m) { // condition of mukaalamah
			var haalah = 0, byyou = 0, msg = '';
			var uxraa = mukaalamaat.uxraa(m.a3daa);
			var intaa = mukaalamaat.intaa(m.a3daa);
			if (isarr(uxraa) && isarr(intaa)) {
				if (uxraa[1] === -3) { // he blocked you
					haalah = -3;
					msg = 'XPO.mklmhmas3oob';
				} else
				if (intaa[1] === -3) { // you blocked him
					haalah = -3;
					byyou = 1;
					msg = 'XPO.mklmhtas3oob';
				} else
				if ([-2, 0].includes(intaa[1]) && uxraa[1] === 1) { // you've rejected or stale
					haalah = intaa[1];
					byyou = 1;
					msg = haalah ? 'XPO.mklmhtatrood' : 'XPO.mklmhda3aw';
				} else
				if (intaa[1] === -1 && uxraa[1] === 1) { // you are invited
					haalah = -1;
					msg = 'XPO.mklmhyad3aak';
				} else
				if (intaa[1] === 1 && uxraa[1] === -1) { // he is invited
					haalah = -1;
					byyou = 1;
					msg = 'XPO.mklmhtad3oot';
				} else
				if ([-2, 0].includes(uxraa[1]) && intaa[1] === 1) { // he's rejected or stale
					haalah = uxraa[1];
					msg = haalah ? 'XPO.mklmhmatrood' : 'XPO.mklmhda3aw';
				} else
				if (intaa[1] === 0 && uxraa[1] === 0) { // both can invite
					haalah = 0;
					// if not a real mklmh, don't allow blocking
					if (m.uid < 0) byyou = 1;
					msg = 'XPO.mklmhda3aw';
				} else
				if (intaa[1] === 1 && uxraa[1] === 1) { // both are members
					haalah = 1;
				}
			}
			return [haalah, byyou, msg]; // [haalah, ?byyou, msg]
		},
		jaddad: function () {
			if (isnum(waqtsaabiq) && time.now() - waqtsaabiq < mklmttaxeer) {
			} else {
				waqtsaabiq = time.now();
				maxzan.axav('XPO.mukaalamaat', 0, 0, helpers.now());
			}
		},
		fahras: function (results) {
			results = results || oldresults || [];
			results.sort(function (a, b) {
				return b.updated - a.updated;
			});
			
			mukaalamaatlist.popall();
			
			results.forEach(function (item, i) {
				mukaalamaatlist.set(item);
			});

			ta3daad();
			oldresults = results;
		},
		iftah: function () { // open mukaalamah
			var suid = sessions.uid(), out = { }, l;
			Hooks.run('XPO.sheet', {
				n: 'XPO.mukaalamah',
				t: 'XPO.mukaalamah',
				i: function (k) {
					k.bahaca3daa.focus();
					l = list( k.a3daa ).idprefix('XPO.a3daa')
								.listitem('XPO.a3daaitem');
					l.onpress = function (o) {
						l.baidaa();
					};
					l.afterset = function (o, clone, k) {
						soorah = setshakl(o, k.soorah);
						soorah.zoomlevel = 0.15;
						soorah.panned.y = 14;
						soorah.jaddad();
					};
					var adaaf = function (nataaij) {
						l.popall();
						nataaij.forEach(function (o) {
							if (o.uid !== suid)
							l.set({
								uid: o.uid,
								shakl: o.shakl,
								mowdoo3: o.displayname || ('@'+o.username),
							});
						});
					};
					k.bahaca3daa.onkeyup = function () {
						var str = this.value;
						if (str.length)
							hisaabaat.bahac(str, function (nataaij) {
								adaaf(nataaij);
							});
						else
							l.popall();
					};
					k.bahaca3daa.onkeyup();
				},
				c: function () {
					if (l)
					$.taxeer('XPO.mukaalamaatiftah', function () {
						var o = l.axav();
						if (o.uid !== suid) {
							rasaail.iftah({
								mowdoo3: o.displayname || o.username,
								a3daa: [[suid, 1], [o.uid, 0]]
							});
						}
					}, 100);
				},
			});
		},
		da3wah: function (profile) {
			shabakah.axav('XPO.mukaalamaat', 'XPO.da3wah', profile);
		},
		bahac: function (profile, cb) {
			if (isfun(cb) && isnum(profile))
			maxzan.axavforun('XPO.mukaalamaat', 0, {
				filter: { sinf: 0 }
			}, function (arr) {
				var done = 0;
				for (var i = 0; i < arr.length; ++i) {
					if (done) break;
					var item = arr[i];
					if (isarr(item.a3daa))
					for (var j = 0; j < item.a3daa.length; ++j) {
						if (item.a3daa[j][0] === profile) {
							cb(item);
							done = 1;
							break;
						}
					}
				}
			});
		},
	};

	maxzan.ixtalaq('XPO.mukaalamaat', 0, {
		taxeer: -1, // never axav from xaadim, xaadim uses nashar for that
		mfateeh: ['XPO.sinf'],
		tashkeel: function (o) {
			return { uid: o.uid, a3daa: o.a3daa };
		},
	});

	Hooks.set('XPO.ready', function () {
		shabakah.tawassat('XPO.mukaalamaat', function (intahaa) {
			// receive mukaalamaat updates when signed in
			intahaa( sessions.signedin() ? 1 : undefined );
		});
		maxzan.jawaab.axav('XPO.mukaalamaat', function (jawaab) {
//			$.log( 'maxzan.jawaab.axav mukaalamaat', jawaab );
			mukaalamaat.fahras( jawaab );
		});
		shabakah.jawaab.axav('XPO.mukaalamaat', 'XPO.da3wah', function (jawaab) {
//			$.log( 'maxzan.jawaab.adaaf mukaalamaat da3wah', jawaab );
			if (jawaab) {
				rasaail.itlaqhaalah(jawaab);
			}
		});
		maxzan.jawaab.adaaf('XPO.mukaalamaat', function (jawaab) {
//			$.log( 'maxzan.jawaab.adaaf mukaalamaat', jawaab );
			if (jawaab) {
				if (jawaab.a3daa) {
					mukaalamaatlist.pop( jawaab.uid );
					jawaab.awwal = 1;
					mukaalamaatlist.set( jawaab );
				}
				if (view.axav() === 'XPO.mukaalamaat') {
					mukaalamaatlist.select( parseint(mukaalamaatlist.id2num(jawaab.uid)) );
					ta3daad();
				}
				rasaail.itlaqhaalah(jawaab);
				rasaail.itlaqtaxeer(jawaab);
			}
		});
		maxzan.jawaab.havaf('XPO.mukaalamaat', function (jawaab) {
			if (isnum(jawaab)) mukaalamaatlist.pop( jawaab );
		});

		keys = view.mfateeh('XPO.mukaalamaat');

		mukaalamaatlist = list( keys.XPO.list ).idprefix('XPO.mukaalamaat')
						.listitem('XPO.mukaalamahitem');
		
		mukaalamaatlist.afterset = function (item, clone, k) {
			var haalah = mukaalamaat.haalah(item);
			if (k) {
				setdata(k.waqtqabl, 'XPO.time', item.created);
				innertext(k.message, xlate(haalah[2], '') );
			}
			var uxraa = mukaalamaat.uxraa(item.a3daa);
			if (uxraa && clone) {
				$.taxeer('XPO.a3daa'+item.uid, function () {
					innerhtml(k.soorah, '');
					hisaabaat.axav([uxraa[0]], function (nataaij) {
						nataaij.forEach(function (o) {
							soorah = setshakl(o, k.soorah, 1);
							soorah.zoomlevel = .3;
							soorah.panned.y = 25;
//							soorah.mowdoo3( o.username.substr(0, 6) );
							soorah.jaddad();
							innertext(k.message, xlate(haalah[2], o.displayname||o.username) );
						});
					});
				}, 50);
			}
		};
		mukaalamaatlist.beforeset = function (item) {
			var ret = mukaalamaat.uxraa(item.a3daa);
			if (ret) {
				hisaabaat.axav([ret[0]], function (nataaij) {
					nataaij.forEach(function (o) {
						item.mowdoo3 = o.displayname || o.username;
					});
				});
			}
			return item;
		};
		mukaalamaatlist.onpress = function (item, key, uid) {
			rasaail.iftah(item);
		};

	});
	Hooks.set('XPO.viewready', function (args) {
		switch (args.XPO.name) {
//			case 'XPO.muhawwal':
//				var m = view.mfateeh('muhawwal');
////				innertext(m.list, muhawwal(0));
//				setcss(m.list, 'width', '50%');
//				setcss(m.list2, 'width', '50%');
//				setcss(m.list, 'font-size', '100%');
//				m.list.onkeyup = function () {
//					innertext(m.list2, muhawwal(m.list.value, 1));
//				};
//				break;
			case 'XPO.mukaalamaat':
//				view.ishtaghal('XPO.muhawwal');
//				break;
				var m = rasaail.mowjoodah();
				if (m) {
					view.ishtaghal('XPO.rasaail');
				} else {
					ta3daad();
					
					mukaalamaat.jaddad();
					
					softkeys.list.basic(mukaalamaatlist);
					softkeys.set(K.sl, function () {
						mukaalamaat.iftah();
						return 1;
					}, 0, 'XPO.iconadd');
					break;
				}
		}
	});
})();