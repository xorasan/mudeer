//+ nazzaf havaf adaaf mowjood tsfeef tasdeeq zumar adaafnaadir naddar
//+ naadiruid
var bazaar,
	ISMMUBEENMAX = 48,
	HIKAAYAHMAX = 480;
	
;(function(){
	var watchers = {};
	var startwatch = function (path) {
		try {
			watchers[path] = Files.fs.watch(path, watchfn);
		} catch (e) {
			$.log(e);
			process.exit();
		}
	};
	var watchfn = function (event, path, forcewatch) {
		if (event != 'change') return;
		$.taxeer('XPO.watch'+path, function () {
			var file;
			try {
				file = Files.get.file(path).toString();
			} catch (e) {
				$.log(' '+path+' not found ');
			}
			var obj = {
				waqt: new Date().getTime(),
				zumar: {}, // categories
			};
			
			var zumrah = 0; // category

			if (file && file.length)
			file.replace(/  /g, ' ')
				.replace(/\t\t/g, '\t')
				.replace(/\n\n/g, '\n')
			.split('\n').forEach(function (line) {
				line = line.trim().split('\t');
				if (line[0].startsWith('#')) {
					zumrah = parseint(line[0].slice(1));
					obj.zumar[ zumrah ] = line[1];
				} else {
					var eadad = parseint(line[0]),
						qeemah = parsefloat(line[1]),
						asmaa = line.slice(2);
					
					if (!isnan(eadad) && eadad) {
						asmaa.forEach(function (shayy, i) {
							asmaa[i] = shayy.trim() || undefined;
						});
						asmaa = collapsearray(asmaa);
						obj[ eadad ] = [qeemah];
						if (asmaa[0]) obj[ eadad ].push(asmaa[0]); // ism
						if (zumrah) obj[ eadad ].push(zumrah); // zumrah
						if (asmaa[1]) {
							if (!zumrah) obj[ eadad ].push(zumrah);
							obj[ eadad ].push(asmaa[1]); // tafseel
						}
					}
				}
			});

			if (path.includes('milk')) bazaar.milk = obj;
			if (path.includes('shakl')) bazaar.shakl = obj;
			if (path.includes('wazaaif')) bazaar.wazaaif = obj;
			if (path.includes('xsoosyat')) bazaar.xsoosyat = obj;
			
			Polling.intahaa();
		}, 1000);
		
		if (watchers[path] || forcewatch) {
			watchers[path] && watchers[path].close();
			startwatch(path);
		}
	};
	['bazaar.xsoosyat', 'bazaar.milk', 'bazaar.shakl', 'bazaar.wazaaif']
	.forEach(function (path) {
		watchfn('change', path, 1);
	});

	bazaar = {
		adaafnaadir: function (sinf, roughstr, zumrah, uid) {
			/* EXPLAIN
			 * it removes all unique uids from rough first
			 * then adds uid to rough
			 * returns rough
			 * */
			var newstr = '';
			if (isstr(roughstr) && isnum(zumrah) && isnum(uid)) {
				var rough = bazaar.tsfeef(roughstr);
				var unique = bazaar.axavnaadir(zumrah, bazaar[sinf]);
				for (var i in unique) {
					var index = rough.indexOf(parseint(i));
					if (index > -1) {
						rough.splice(index, 1);
					}
				}
				rough.push(uid);
			}
			rough.forEach(function (item) {
				newstr += ' '+item+':';
			});
			return newstr;
		},
		naadiruid: function (roughstr, naadir) {
			/*
			 * finds the first naadir[uid, ...] in rough[] & returns it
			 * */
			var uid = 0;
			if (isstr(roughstr) && naadir) {
				var rough = bazaar.tsfeef(roughstr);
				for (var i in naadir) {
					uid = parseint(i);
					if ( rough.indexOf( uid ) > -1 )
						return uid;
				}
			}
			return uid;
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
		tasdeeq: function (arr, mshtryaatstr, kul, max) {
			/* EXPLAIN
			 * kul is bazaar maxzan
			 * uniquely checks uids in arr & adds them to out[]
			 * it checks if uid is either free or purchased
			 * and then adds it to out
			 * and makes sure out has less than max members
			 * */
			max = max || 15;
			var out = [];
			if (isarr(arr) && isstr(mshtryaatstr) && kul) {
				var mshtryaat = bazaar.tsfeef(mshtryaatstr);
				for (var i in arr) {
					if (out.length == max) break;
					var uid = arr[i];
					if (!out.includes(uid)) {
						if (mshtryaat.includes(uid)) out.push( uid );
						else if (kul[uid] && !kul[uid][0]) out.push( uid );
					}
				}
			}
			return out;
		},
		tsfeef: function (str) { // to array
			var arr = [];
			(str||'').replace(/\ ([\d]+)\:/g, function (a, b, c) {
				arr.push(parseint(b));
				return '';
			});
			return arr;
		},
		ilaastr: function (arr, str) {
			str = str || '';
			if (isarr(arr))
				arr.forEach(function (uid) {
					str = bazaar.adaaf( str, parseint(uid) );
				});
			return str;
		},
		mowjood: function (str, uid) { // ' 100: 200: 300:'.includes('200:')
			return str.includes(' '+uid+':');
		},
		adaaf: function (str, uid) {
			return str+' '+uid+':';
		},
		havaf: function (str, uid) {
			return str.replace(' '+uid+':', '');
		},
		qadr: function (u, v) {
			return { uid: u, qadr: v };
		},
		nazzaf: function (str, max) {
			if (!isstr(str)) str = parsestring(str);
			return str.trim().slice(0, max);
		},
		xsoosyat: 	{},
		milk: 		{},
		shakl:		{},
		wazaaif:	{},
	};
})();
shabakah.tawassat('XPO.bazaar', function (jawaab) {
	if (jawaab.hisaab) {
		var arr = [];
		
		if (jawaab.waqt < jawaab.hisaab.updated) {
			arr.push( bazaar.qadr('XPO.naqd', jawaab.hisaab.naqd) );
			arr.push( bazaar.qadr('XPO.xsoosyat_m', bazaar.tsfeef( jawaab.hisaab.xsoosyat_m) ) );
			arr.push( bazaar.qadr('XPO.shakl_m', bazaar.tsfeef( jawaab.hisaab.shakl_m) ) );
			arr.push( bazaar.qadr('XPO.wazaaif_m', bazaar.tsfeef( jawaab.hisaab.wazaaif_m) ) );
			arr.push( bazaar.qadr('XPO.milk_m', bazaar.tsfeef( jawaab.hisaab.milk_m) ) );
		}
		
		if (jawaab.waqt < bazaar.xsoosyat.waqt)
			arr.push( bazaar.qadr('XPO.xsoosyat', bazaar.xsoosyat) );
		
		if (jawaab.waqt < bazaar.shakl.waqt)
			arr.push( bazaar.qadr('XPO.shakl', bazaar.shakl) );
		
		if (jawaab.waqt < bazaar.milk.waqt)
			arr.push( bazaar.qadr('XPO.milk', bazaar.milk) );
		
		if (jawaab.waqt < bazaar.wazaaif.waqt)
			arr.push( bazaar.qadr('XPO.wazaaif', bazaar.wazaaif) );

		if (arr.length) jawaab.axav(arr).munfaq();
		else jawaab.intahaa();
	} else jawaab.intahaa();
});
shabakah.axav('XPO.bazaar', 'XPO.naqd', function (jawaab) {
	var qadr = jawaab.qadr;
	
	if (!jawaab.hisaab) { jawaab.intahaa(); return; } // not signed in
	if (!qadr || qadr < 0 || qadr > 250) { jawaab.intahaa(); return; } // received nothing
	var ashyaa = { uid0: jawaab.hisaab.uid }, arr = [];
	
	if (isnum(qadr)) {
		jawaab.axav(ashyaa.naqd0 = /*jawaab.hisaab.naqd+*/qadr);
		arr.push( bazaar.qadr('XPO.naqd', qadr) );
	}
	if (arr.length) {
		ashyaa.updated0 = new Date().getTime();
		helpers.set(WUQU3AATNAME, tbl_hsbt, [ashyaa], function (j) {
			Polling.intahaa();
			jawaab.axav(1).intahaa();
		}, {
			checkism: false
		});
	}
	else jawaab.intahaa();
});
shabakah.axav('XPO.bazaar', 'XPO.ishtaraa', function (jawaab) {
	var qadr = jawaab.qadr;
	
	if (!jawaab.hisaab) { jawaab.intahaa(); return; } // not signed in
	if (!qadr) { jawaab.intahaa(); return; } // received nothing
	var ashyaa = { uid0: jawaab.hisaab.uid }, xataastr = 1;
	
	if ( isarr(qadr) && isstr(qadr[0]) && isnum(qadr[1]) ) { // [ sinf, uid ]
		var shayy, sinf, sinf_m, uid = qadr[1];
		if ( qadr[0] == 'XPO.xsoosyat' )
			shayy = bazaar.xsoosyat[ uid ], sinf = 'xsoosyat_m', sinf_m = 'xsoosyat_m0';
		if ( qadr[0] == 'XPO.milk' )
			shayy = bazaar.milk[ uid ], sinf = 'milk_m', sinf_m = 'milk_m0';
		if ( qadr[0] == 'XPO.wazaaif' )
			shayy = bazaar.wazaaif[ uid ], sinf = 'wazaaif_m', sinf_m = 'wazaaif_m0';
		if ( qadr[0] == 'XPO.shakl' )
			shayy = bazaar.shakl[ uid ], sinf = 'shakl_m', sinf_m = 'shakl_m0';

		var tablename = tbl_hsbt,
			columnname = sinf_m;
		
		/* you can intercept this to specify the table and column name
		 * to save this elsewhere
		 * you will get (zumrah int)
		 * you should return [table, column, uid]
		 * you can return -1 if you don't want this saved here
		 * like in case your zaboon juzw didn't send any data so you can't
		 * pinpoint your uid
		 * */
		var arr = Hooks.rununtilconsumed('XPO.bazaarishtaraa', shayy[2]);
		if (isarr(arr) && arr.length === 3)
			tablename = arr[0],
			columnname = arr[1],
			ashyaa.uid0 = arr[2];
		
		// shayy exists
		if ( sinf && sinf_m && isarr(shayy) && arr !== -1 ) {
			// shayy has a price
			if (shayy[0] > 0) {
				// enough money for shayy
				if (shayy[0] <= jawaab.hisaab.naqd) {
					// hisaab hasn't already got it
					if ( !bazaar.mowjood(jawaab.hisaab[sinf], uid) ) {
						var qeemah = shayy[0], str;

						if (sinf === 'xsoosyat_m')
							str = bazaar.adaafnaadir(qadr[0], jawaab.hisaab[ sinf ], shayy[2], uid);
						else
							str = bazaar.adaaf(jawaab.hisaab[ sinf ], uid);

						$.log( str );

						ashyaa[ columnname ] = str;
						ashyaa.naqd0 = jawaab.hisaab.naqd - qeemah;
						ashyaa.nafaqah0 = jawaab.hisaab.nafaqah + qeemah;
						xataastr = 'XPO.ishtaraafalaah';
					} else xataastr = 'XPO.mushtaranzalta';
				} else xataastr = 'XPO.naqdlayakfaa';
			} else xataastr = 'XPO.majjaani';
		} else xataastr = 'XPO.laayoojid';
	} else xataastr = 'XPO.xataafizzaad';

	if (xataastr === 'XPO.ishtaraafalaah') {
		ashyaa.updated0 = new Date().getTime();
		helpers.set(WUQU3AATNAME, tablename, [ashyaa], function (j) {
			Polling.intahaakul([jawaab.hisaab.uid]);
			jawaab.axav([qadr[0], qadr[1], xataastr]).intahaa();
		}, {
			checkism: false
		});
	}
	else jawaab.axav([qadr[0], qadr[1], xataastr]).intahaa();
});
