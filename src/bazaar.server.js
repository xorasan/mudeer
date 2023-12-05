var bazaar,
	ISMMUBEENMAX = 48,
	HIKAAYAHMAX = 480;
	
;(function(){
	var watchers = {};
	var startwatch = function (path) {
		try {
			watchers[path] = Files.fs.watch(path, watchfn);
		} catch (e) {
			$.log.e(e);
			process.exit();
		}
	};
	var watchfn = function (event, path, forcewatch) {
		if (event != 'change') return;
		$.taxeer('watch'+path, function () {
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

			if (path.includes('possessions')) bazaar.possessions = obj;
			if (path.includes('shape')) bazaar.shape = obj;
			if (path.includes('jobs')) bazaar.jobs = obj;
			if (path.includes('features')) bazaar.features = obj;
			
			Polling.finish();
		}, 1000);
		
		if (watchers[path] || forcewatch) {
			watchers[path] && watchers[path].close();
			startwatch(path);
		}
	};
//	['bazaar.features', 'bazaar.possessions', 'bazaar.shape', 'bazaar.jobs']
//	.forEach(function (path) {
//		watchfn('change', path, 1);
//	});

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
				var unique = bazaar.getnaadir(zumrah, bazaar[sinf]);
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
		getnaadir: function (zumrah, kul) {
			var out = {};
			for (var i in kul) {
				if (!['waqt', 'zumar'].includes(i)) {
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
		value: function (u, v) {
			return { uid: u, value: v };
		},
		nazzaf: function (str, max) {
			if (!isstr(str)) str = parsestring(str);
			return str.trim().slice(0, max);
		},
		features: 	{},
		possessions: 		{},
		shape:		{},
		jobs:	{},
	};
})();
Network.intercept('bazaar', function (response) { // TODO EXPLAIN
	if (response.account) {
		var arr = [];
		
		if (response.waqt < response.account.updated) {
			arr.push( bazaar.value('money', response.account.money) );
			arr.push( bazaar.value('features_m', bazaar.tsfeef( response.account.features_m) ) );
			arr.push( bazaar.value('shape_m', bazaar.tsfeef( response.account.shape_m) ) );
			arr.push( bazaar.value('jobs_m', bazaar.tsfeef( response.account.jobs_m) ) );
			arr.push( bazaar.value('possessions_m', bazaar.tsfeef( response.account.possessions_m) ) );
		}
		
		if (response.waqt < bazaar.features.waqt)
			arr.push( bazaar.value('features', bazaar.features) );
		
		if (response.waqt < bazaar.shape.waqt)
			arr.push( bazaar.value('shape', bazaar.shape) );
		
		if (response.waqt < bazaar.possessions.waqt)
			arr.push( bazaar.value('possessions', bazaar.possessions) );
		
		if (response.waqt < bazaar.jobs.waqt)
			arr.push( bazaar.value('jobs', bazaar.jobs) );

		if (arr.length) response.get(arr).consumed();
		else response.finish();
	} else response.finish();
});
Network.get('bazaar', 'money', function (response) {
	var value = response.value;
	
	if (!response.account) { response.finish(); return; } // not signed in
	if (!value || value < 0 || value > 250) { response.finish(); return; } // received nothing
	var ashyaa = { uid: response.account.uid }, arr = [];
	
	if (isnum(value)) {
		response.get(ashyaa.money0 = /*response.account.money+*/value);
		arr.push( bazaar.value('money', value) );
	}
	if (arr.length) {
		ashyaa.updated0 = new Date().getTime();
		helpers.set(Config.database.name, tbl_hsbt, [ashyaa], function (j) {
			Polling.finish();
			response.get(1).finish();
		}, {
			checkism: false
		});
	}
	else response.finish();
});
Network.get('bazaar', 'ishtaraa', function (response) {
	var value = response.value;
	
	if (!response.account) { response.finish(); return; } // not signed in
	if (!value) { response.finish(); return; } // received nothing
	var ashyaa = { uid: response.account.uid }, xataastr = 1;
	
	if ( isarr(value) && isstr(value[0]) && isnum(value[1]) ) { // [ sinf, uid ]
		var shayy, sinf, sinf_m, uid = value[1];
		if ( value[0] == 'features' )
			shayy = bazaar.features[ uid ], sinf = 'features_m', sinf_m = 'features_m0';
		if ( value[0] == 'possessions' )
			shayy = bazaar.possessions[ uid ], sinf = 'possessions_m', sinf_m = 'possessions_m0';
		if ( value[0] == 'jobs' )
			shayy = bazaar.jobs[ uid ], sinf = 'jobs_m', sinf_m = 'jobs_m0';
		if ( value[0] == 'shape' )
			shayy = bazaar.shape[ uid ], sinf = 'shape_m', sinf_m = 'shape_m0';

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
		var arr = Hooks.rununtilconsumed('bazaarishtaraa', shayy[2]);
		if (isarr(arr) && arr.length === 3)
			tablename = arr[0],
			columnname = arr[1],
			ashyaa.uid = arr[2];
		
		// shayy exists
		if ( sinf && sinf_m && isarr(shayy) && arr !== -1 ) {
			// shayy has a price
			if (shayy[0] > 0) {
				// enough money for shayy
				if (shayy[0] <= response.account.money) {
					// account hasn't already got it
					if ( !bazaar.mowjood(response.account[sinf], uid) ) {
						var qeemah = shayy[0], str;

						if (sinf === 'features_m')
							str = bazaar.adaafnaadir(value[0], response.account[ sinf ], shayy[2], uid);
						else
							str = bazaar.adaaf(response.account[ sinf ], uid);

						$.log( str );

						ashyaa[ columnname ] = str;
						ashyaa.money0 = response.account.money - qeemah;
						ashyaa.nafaqah0 = response.account.nafaqah + qeemah;
						xataastr = 'ishtaraafalaah';
					} else xataastr = 'mushtaranzalta';
				} else xataastr = 'moneylayakfaa';
			} else xataastr = 'majjaani';
		} else xataastr = 'laayoojid';
	} else xataastr = 'xataafizzaad';

	if (xataastr === 'ishtaraafalaah') {
		ashyaa.updated0 = new Date().getTime();
		helpers.set(Config.database.name, tablename, [ashyaa], function (j) {
			Polling.finish_all([response.account.uid]);
			response.get([value[0], value[1], xataastr]).finish();
		}, {
			checkism: false
		});
	}
	else response.get([value[0], value[1], xataastr]).finish();
});

// This adds bazaar functionality to profile

Network.intercept('bazaar', 'profile', function (response) {
	if (response.account) { // signed in?
		var arr = [];
		
		if (response.time < response.account.updated) {
			var possessions = bazaar.tsfeef(response.account.possessions),
				shape = bazaar.tsfeef(response.account.shape),
				jobs = bazaar.tsfeef(response.account.jobs),
				features = bazaar.tsfeef(response.account.features);
			
			arr.push( profile.value('shape',		shape							) );
			arr.push( profile.value('possessions',	possessions						) );
			arr.push( profile.value('jobs',			jobs							) );
			arr.push( profile.value('features',		features						) );
		}

		if (arr.length) response.get(arr).consumed();
		else response.finish();
	} else response.finish();
});
Network.sync('bazaar', 'profile', function (response) {
	var value = response.value;
	
	if (!response.account) { response.finish(); return; } // not signed in
	if (!value) { response.finish(); return; } // received nothing
	var tabdeel = 0, things = { uid: response.account.uid }, arr = [];

	/* shape possessions jobs
	 * multiple things are inserted to represent their numbers
	 * */

//	uid			unique id
//	shape		appearance
	if (isarr(value.shape)) {
		var out = bazaar.tasdeeq(value.shape, response.account.shape_m, bazaar.shape, SHAKLTAGMAX)
		arr.push( profile.value('shape', out ) );
		things.shape = bazaar.ilaastr( out );
		tabdeel = 1;
	}
//	possessions		possessions
	if (isarr(value.possessions)) {
		var out = bazaar.tasdeeq(value.possessions, response.account.possessions_m, bazaar.possessions, TAGMAX)
		arr.push( profile.value('possessions', out ) );
		things.possessions = bazaar.ilaastr( out );
		tabdeel = 1;
	}
//	jobs		jobs
	if (isarr(value.jobs)) {
		var out = bazaar.tasdeeq(value.jobs, response.account.jobs_m, bazaar.jobs, TAGMAX);
		arr.push( profile.value('jobs', out ) );
		things.jobs = bazaar.ilaastr( out );
		tabdeel = 1;
	}
//	xsoosyat	features
	if (isarr(value.xsoosyat)) {
		var out = bazaar.tasdeeq(value.xsoosyat, response.account.xsoosyat_m, bazaar.xsoosyat, TAGMAX);
		arr.push( profile.value('xsoosyat', out ) );
		things.xsoosyat = bazaar.ilaastr( out );
		tabdeel = 1;
	}
//	haram		family
//	aqrabaa		relatives
//	masaa3ib	blocks
//	asdiqaa		friends
//	mushtarayaat purchased items
//	naqd		money
//	talab		wants
//	haatif		phone
//	haalah		status
//	ittisaal	connected when
//	indimaam	joined when (after invitation)
//	xattil3ard	latitude
//	xattiltool	longitude
//	created		created when
//	updated		updated when
	if (arr.length) {
		things.updated = get_time_now();
		helpers.set(Config.database.name, tbl_hsbt, [things], function (j) {
			Polling.finish_all([response.account.uid]);
			response.sync(arr).finish();
		}, {
			checkname: false
		});
	}
	else response.finish();
});


