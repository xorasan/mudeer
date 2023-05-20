//+ fahras an3ash kitabat ta3daadmatn iftah
/* qanaah (channel)
 * 	[ musalsal (series) max: 24?
 * 		[ qissah (story)
 * 			[ anbaa (events) 
 * */
var qasas;
;(function(){
	var qasaslist, keys, oldresults = [], __uid = 0, soorah,
	waqtsaabiq = 0, mklmttaxeer = 3*60*1000,
	uid = function (strin) {
		return ++__uid;
	},
	ta3daad = function () {
		var l = qasaslist.length();
		if (view.axav() === 'XPO.qasas') {
			webapp.header( l ? (l+' '+translate('XPO.qasas'))
							: translate('XPO.noqasas') );
			qasaslist.select();
		}
		qasaslist.message(l ? undefined : translate('XPO.noqasas') );
	};
	
	qasas = {
		jaddad: function () {
			if (isnum(waqtsaabiq) && time.now() - waqtsaabiq < mklmttaxeer) {
			} else {
				waqtsaabiq = time.now();
				maxzan.axav('XPO.qasas', 0, 0, helpers.now());
			}
		},
		fahras: function (results) {
			results = results || oldresults || [];
			results.sort(function (a, b) {
				return b.updated - a.updated;
			});
			
			qasaslist.popall();
			
			results.forEach(function (item, i) {
				qasaslist.set(item);
			});

			ta3daad();
			oldresults = results;
		},
		iftah: function (item) { // open qissah
			var suid = sessions.uid(), r, a3daa = {}, a3daalist, xulwahlist,
				out = { uid: item.uid };
			item && Hooks.run('XPO.sheet', {
				n: 'XPO.qissah',
				t: 'XPO.qissah',
				i: function (k) {
					k.XPO.mowdoo3.focus();
					k.XPO.mowdoo3.value = item.XPO.mowdoo3||'';
					r = bazaar.nasab({
						sinf: 'XPO.xsoosyat',
						mfateeh: k,
						mowdoo3: 'XPO.muddah',
						arfa3: parseint( item.muddaharfa3 || 0 ),
						zumrah: 600,
						fimakaan: 1,
						mustaqeem: 1,
						grid: 2,
						intaxab: parseint( item.muddah || 0 ),
						listitem: 'XPO.muddahitem',
						idprefix: 'XPO.muddah',
						callback: function () {
							var qadr = [];
							r.muntaxab && r.muntaxab.adapter.each(function (o) {
								qadr.push( parseint(o.uid) );
							});
						},
						saabiqan: function (o) {
							if (o.mowdoo3 === '0') {
								o.mowdoo3 = xlate('XPO.notimelimit');
								o.tafseel = xlate('XPO.autodeleteold');
							} else {
								var hrs = parseint(o.mowdoo3);
								o.mowdoo3 = time.miqdaar(hrs * 60);
								o.tafseelp = 'XPO.ixtaf';
							}
							return o;
						},
					});

					item.a3daa = item.a3daa || [];
					if (item.a3daa.length === 0)
						a3daa[ suid ] = [ suid , 3 ];
					item.a3daa.forEach(function (o) {
						if (o[0]) {
							o[1] = o[1] || 0;
							a3daa[ o[0] ] = o;
						}
					});
					xulwahlist = list( k.XPO.xulwah ).idprefix('XPO.xulwah').grid(2)
								.listitem('XPO.muddahitem').mowdoo3('XPO.xulwah', 1);
					[{
						uid: 1,
						mowdoo3: 'private',
						qeemah: 'XPO.ixtaf',
						madad: xlate('XPO.taptoselect'),
					}, {
						uid: 2,
						mowdoo3: 'public',
						qeemah: 'XPO.ixtaf',
						madad: xlate('XPO.taptoselect'),
					}].forEach(function (item) {
						xulwahlist.set(item);
					});
					xulwahlist.onpress = function (o) {
						xulwahlist.baidaa();
					};
					xulwahlist.baidaa( xulwahlist.id2num(item.sinf) );
					
					a3daalist = list( k.XPO.a3daa ).idprefix('XPO.a3daa')
								.listitem('XPO.a3daaitem').mowdoo3('XPO.a3daa', 1);
					a3daalist.onpress = function (o) {
						if (Object.keys(a3daa).length < 8 || o.waqf) {
							o.waqf = o.waqf || 0;
							o.waqf++;
							if (o.waqf > 3) o.waqf = 0;
							a3daalist.set(o);
						} else {
							webapp.itlaa3( xlate('XPO.maxmembershit') );
						}
					};
					a3daalist.afterset = function (o, clone, k) {
						soorah = setshakl(o, k.soorah);
						soorah.zoomlevel = 0.15;
						soorah.panned.y = 14;
						soorah.jaddad();
					};
					a3daalist.beforeset = function (o) {
						if (o.waqf === 0) o.waqfstr = 'XPO.ixtaf';
						if (o.waqf === 1) o.waqfstr = 'XPO.member';
						if (o.waqf === 2) o.waqfstr = 'XPO.mod';
						if (o.waqf === 3) o.waqfstr = 'XPO.admin';
						
						if (o.uid) {
							if (o.waqf) a3daa[ o.uid ] = [o.uid, o.waqf || 0];
							else delete a3daa[ o.uid ];
						}

						return o;
					};
					var adaaf = function (nataaij) {
						a3daalist.popall();
						nataaij.forEach(function (o) {
							a3daalist.set({
								uid: o.uid,
								shakl: o.shakl,
								mowdoo3: o.displayname || ('@'+o.username),
								waqf: (a3daa[ o.uid ]||[])[1]||0,
							});
						});
					};
					k.XPO.bahaca3daa.onkeyup = function () {
						var str = this.value;
						if (str.length)
							hisaabaat.bahac(str, function (nataaij) {
								adaaf(nataaij);
							});
						else
							hisaabaat.axav(shakl.intify(Object.keys(a3daa)), function (nataaij) {
								adaaf(nataaij);
							});
					};
					k.XPO.bahaca3daa.onkeyup();
				},
				b: function (k, c) {
					var o = r.muyassar.axav();
					if (o) {
						out.muddah = parseint(o.uid);
						out.muddaharfa3 = Math.max(item.muddaharfa3||0, item.muddah);
					}
					o = xulwahlist.axav();
					if (o) out.sinf = parseint(o.uid) === 2 ? 2 : 1;
					else out.sinf = 1;
					out.uid = item.uid || maxzan.ruid();
					out.a3daa = Object.values(a3daa);
					out.mowdoo3 = k.XPO.mowdoo3.value.trim();
					shabakah.axav('XPO.qasas', 'XPO.ishtaraa', out);
				},
				c: function (k) {
//					qasaslist.set(item);
				},
			});
		},
		da3wah: function (profile) {
			shabakah.axav('XPO.qasas', 'XPO.da3wah', profile);
		},
		bahac: function (profile, cb) {
			if (isfun(cb) && isnum(profile))
			maxzan.axavforun('XPO.qasas', 0, {
				filter: { sinf: 0 }
			}, function (arr) {
				var out = 0;
				arr.forEach(function (item) {
					if (isarr(item.a3daa)) {
						item.a3daa.forEach(function (o) {
							if (o[0] === profile) out = o;
						});
					}
				});
				cb(out);
			});
		},
		havaf: function (item) {
			if (item)
			Hooks.run('XPO.dialog', {
				m: 'delete "'+item.mowdoo3+'"?',
				c: function () {
					maxzan.havaf('XPO.qasas', { uid: item.uid });
				},
			});
		},
	};

	maxzan.ixtalaq('XPO.qasas', 0, {
		taxeer: -1, // never axav from xaadim, xaadim uses nashar for that
		mfateeh: ['XPO.sinf'],
	});

	Hooks.set('XPO.ready', function () {
		shabakah.tawassat('XPO.qasas', function (intahaa) {
			// receive qasas updates when signed in
			intahaa( sessions.signedin() ? 1 : undefined );
		});
		maxzan.jawaab.axav('XPO.qasas', function (jawaab) {
//			$.log( 'maxzan.jawaab.axav qasas', jawaab );
			qasas.fahras( jawaab );
		});
		shabakah.jawaab.axav('XPO.qasas', 'XPO.ishtaraa', function (jawaab) {
			if (['XPO.ishtaraafalaah', 'XPO.naqdlayakfaa'].includes(jawaab))
				hisaab.naqdtafawwaq();

			if (['XPO.ishtaraafalaah', 'XPO.majjaani'].includes(jawaab)) {
				if (sheet.zaahir('XPO.qissah')) sheet.cancel();
			} else {
				webapp.itlaa3( xlate(jawaab) );
				sheet.bardaa();
			}
		});
		maxzan.jawaab.adaaf('XPO.qasas', function (jawaab) {
//			$.log( 'maxzan.jawaab.adaaf qasas', jawaab );
			if (jawaab) {
				if (isstr(jawaab.mowdoo3)) {
					qasaslist.pop( jawaab.uid );
					jawaab.awwal = 1;
					qasaslist.set( jawaab );
				}
				if (view.axav() === 'XPO.qasas')
				qasaslist.select( parseint(qasaslist.id2num(jawaab.uid)) );
				ta3daad();
			}
		});
		maxzan.jawaab.havaf('XPO.qasas', function (jawaab) {
			if (isnum(jawaab)) qasaslist.pop( jawaab );
		});

		keys = view.mfateeh('XPO.qasas');

		qasaslist = list( keys.XPO.list ).idprefix('XPO.qasas')
						.listitem('XPO.qissahitem');
		
		qasaslist.afterset = function (item, clone, k) {
			if (k) {
				setdata(k.waqtqabl, 'XPO.time', item.created);
			}
			if (item.sinf && clone) {
				$.taxeer('XPO.a3daa'+item.uid, function () {
					innerhtml(k.ashkaal, '');
					var a3daa = [];
					item.a3daa && item.a3daa.forEach(function (o) {
						a3daa.push(o[0]);
					});
					hisaabaat.axav(a3daa, function (nataaij) {
						nataaij.forEach(function (o) {
							soorah = setshakl(o, k.ashkaal, 1);
							soorah.zoomlevel = .3;
							soorah.panned.y = 25;
//							soorah.mowdoo3( o.username.substr(0, 6) );
							soorah.jaddad();
						});
					});
				}, 50);
			}
		};
		qasaslist.beforeset = function (o) {
//			o.hayynishaan = o.hayy ? 'XPO.izhar' : 'XPO.ixtaf';
			o.xulwaheqonah = o.sinf === 1 ? 'XPO.izhar' : 'XPO.ixtaf';
			o.tahmeel = 'XPO.ixtaf';
			if (o.muddah && hisaab.maxba().xsoosyat) {
				var m = hisaab.maxba().xsoosyat[o.muddah];
				if (m) {
					m = m[1];
					if (m === '0') {
						o.muddahstr = xlate('XPO.notimelimit');
					} else {
						var secs = parseint(m) * 60;
						o.muddahstr = time.miqdaar(secs);
					}
				}
			}
			o.soorah = o.sinf ? 'XPO.ixtaf' : 'XPO.izhar';
			o._listitem = o.sinf ? 0 : 'XPO.risaalahitem';
			
			return o;
		};
		qasaslist.onpress = function (item, key, uid) {
				 if (key == '0')	qasas.havaf(item);
			else if (key == K.sl)	qasas.iftah(item);
			else					anbaa.iftah(item);
		};

//		$.taxeer('qasas', function () { pager.intaxab('qasas', 1); }, 500);
	});
	Hooks.set('XPO.viewready', function (args) {
		switch (args.XPO.name) {
			case 'XPO.qasas':
				var m = anbaa.mowjoodah();
				if (m) {
					view.ishtaghal('XPO.anbaa');
				} else {
					ta3daad();
					
					qasas.jaddad();
					
					softkeys.list.basic(qasaslist);
					softkeys.set(K.sl, function () {
						qasaslist.press(K.sl);
					}, 0, 'XPO.iconedit');
					softkeys.set('3', function () {
						qasas.iftah({});
						return 1;
					}, '3', 'XPO.iconadd');
					softkeys.set('0', function () {
						qasaslist.press('0');
						return 1;
					}, '0', 'XPO.icondeleteforever');
					break;
				}
		}
	});
})();