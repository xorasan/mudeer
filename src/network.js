/*
 * it has 3 qanawaat for comm with xaadim
 * axav		get something from the xaadim immediately
 * 			
 * waaqat	sync changes, zaboon -> xaadim
 * 			uses .waqt to maintain sync between zaboon & xaadim
 * 			the response is empty
 * 			responds through broadcast
 * nashar	listens for changes
 * 			returns on triggers like waaqat from you or others
 * 			always returns .waqt on success
 * */
//+ nashar axav waaqat jawaab mundarij wasaatat rafa3
var shabakah, sessions = sessions || 0;
;(function(){
	'use strict';
	var xitaab = 'http://localhost:XAADIMPORT/', buildexpired = false, offlinewaqt,
		shabakahkeys;
	
	var xataalog = function (v) {
//		$.log( v );
	};
	var hasdisconnected = function (res) {
		// only mark online when really getting an ok result from server
		if (!res.err)
			setnetwork(1);
		// offline on errors
		else if (res.err === -300 || res.err > 300)
			setnetwork();
	};
	var setnetwork = function (on) {
		if (on) {
			// only update if it isn't already online
			if (offlinewaqt !== false) {
				offlinewaqt = false;
				preferences.pop('@0');
				Hooks.run('XPO.ittasaal', true); // connection
				// cancel reconnection attempts
				$.taxeercancel('XPO.shabakahittasaal');
			}
			setnotifybar();
		} else {
			// update waqt if it hasn't been marked offline yet
			if (offlinewaqt === false) {
				offlinewaqt = new Date().getTime();
				preferences.set('@0', offlinewaqt);
				Hooks.run('XPO.ittasaal', offlinewaqt); // connection
				// handles reconnection attempts
				$.taxeer('XPO.shabakahittasaal', function () {
					if (sessions)
					shabakah.axav({
						i: 'XPO.shabakah',
						h: 'XPO.ittasaal',
					});
				}, 15*1000);
			}
			
			// notify anyway
			setnotifybar( 'XPO.offlinesince' , offlinewaqt || '');
		}

	};
	var setnotifybar = function (v, t) {
		if (v) {
			$.taxeer('XPO.setnotifybar', function () {
				setdata(shabakahkeys.mowdoo3, 'XPO.i18n', v);
				setdata(shabakahkeys.waqt, 'XPO.time', t);
				time(XPO.shabakahui);
				xlate.update(XPO.shabakahui);
			}, t);
			XPO.shabakahui.hidden = 0;
		} else {
			XPO.shabakahui.hidden = 1;
		}
	};
	var sizeunits = function (num) {
		if (typeof num === 'number') {
			if (num >= (1024 * 1024 * 1024 * 1024))
				return (num / (1024 * 1024 * 1024 * 1024)).toFixed(1) + 'TB'; 

			if (num >= (1024 * 1024 * 1024))
				return (num / (1024 * 1024 * 1024)).toFixed(1) + 'GB'; 

			if (num >= (1024 * 1024))
				return (num / (1024 * 1024)).toFixed(1) + 'MB'; 

			if (num >= 1024)
				return (num / 1024).toFixed() + 'KB'; 
		}

		return '0';
	}
	var progressfn = function (loaded, total) {
		// show progress if bigger than 4KB
		if (total > 4 * 1024) {
			var percentage	=	sizeunits(loaded) +' / '+ sizeunits(total) +', '
							+	(((loaded / total) * 100).toFixed() || 0) + '%';

			webapp.itlaa3( percentage );
		}
	};
	var hasinshaexpired = function (jawaab) {
		// build expired
		if (jawaab.e$) {
//			$.log.s( 'e$' );
			buildexpired = 1;
			window.caches.delete('def').then(function(del) {
				webapp.dimmer(LAYERTOPMOST, xlate('XPO.appneedsreload'));
			});
			nasharanhaa();
			$.fetchcancel( 'XPO.axav' );
			$.fetchcancel( 'XPO.waaqat' );
		}
	};
	var handlejawaab = function (jawaab) {
		if (jawaab.rafa3)
		for (var ism in jawaab.rafa3) {
			if (shabakah.mundarij.rafa3[ism]) {
				var haajaat = jawaab.rafa3[ism];
				for (var haajah in haajaat) {
					if (typeof shabakah.mundarij.rafa3[ism][haajah] == 'function') {
						shabakah.mundarij.rafa3[ism][haajah](
							haajaat[haajah]
						);
					}
				}
			}
		}

		if (jawaab.wasaatat)
		for (var ism in jawaab.wasaatat) {
			if (shabakah.mundarij.wasaatat[ism]) {
				var haajaat = jawaab.wasaatat[ism];
				for (var haajah in haajaat) {
					if (typeof shabakah.mundarij.wasaatat[ism][haajah] == 'function') {
						shabakah.mundarij.wasaatat[ism][haajah](
							haajaat[haajah]
						);
					}
				}
			}
		}

		if (jawaab.axav) {
			for (var ism in jawaab.axav) {
				if (shabakah.mundarij.axav[ism]) {
					var haajaat = jawaab.axav[ism];
					for (var haajah in haajaat) {
						if (typeof shabakah.mundarij.axav[ism][haajah] == 'function') {
							shabakah.mundarij.axav[ism][haajah](
								haajaat[haajah]
							);
						}
					}
				}
			}
			Hooks.run('XPO.jawaabaxav', jawaab.waaqat);
		}

		if (jawaab.waaqat) {
			for (var ism in jawaab.waaqat) {
				if (shabakah.mundarij.waaqat[ism]) {
					var haajaat = jawaab.waaqat[ism];
					for (var haajah in haajaat) {
						if (typeof shabakah.mundarij.waaqat[ism][haajah] == 'function') {
							shabakah.mundarij.waaqat[ism][haajah](
								haajaat[haajah]
							);
						}
					}
				}
			}
			Hooks.run('XPO.jawaabwaaqat', jawaab.waaqat);
		}
	};

	var cachedkey, nasharhaalah = 0, nashartaxeer = 500;
	var nasharishtaghal = function (payload, wasaatat) {
		if (!cachedkey || !nasharhaalah) return;
		
		if ($.fetchchannels.XPO.nashar
		&&	$.fetchchannels.XPO.nashar.active) return;

		payload = payload || {};

		payload = Object.assign(payload, {
			XPO.nashar	:	1				, // mutawaaqit min qabl (synced before)
			e$			:	BUILDNUMBER		, // insha 3adad
		});

		if (wasaatat) payload = Object.assign(payload, wasaatat);

		xataalog(payload);
		$.fetch( xitaab, 'XPO.json='+enc( JSON.stringify(payload) ), 'XPO.nashar', progressfn, 3*60*1000 )
		.then(function (res) {
			if (res.err) {
				// don't mark offline, this qanaat is designed to timeout! :)
				nashartaxeer = 4 * 15 * 1000; // 60s
			} else {
				hasdisconnected(res);
				var jawaab = {};
				try {
					jawaab = JSON.parse( (res||{}).body );
				} catch (e) {
					jawaab.nashar = 1;
					jawaab.xataa = 1;
				}
				
				if (!jawaab.xataa) nashartaxeer = 500;
				
				if (hasinshaexpired(jawaab)) return;
				
				handlejawaab(jawaab);
			}
			
			$.taxeer('XPO.shabakahnashar', function () {
				wasaatatishtaghal(function (ashyaa) {
					nasharishtaghal({}, ashyaa);
				}, 'XPO.nashar');
			}, nashartaxeer);
		});
	};
	var nasharbadaa = function () {
		$.taxeer('XPO.nasharbadaa', function () {
			nasharhaalah = 1;
			wasaatatishtaghal(function (ashyaa) {
				nasharishtaghal({}, ashyaa);
			}, 'XPO.nashar');
		}, 1000);
	};
	var nasharanhaa = function () {
		nasharhaalah = 0;
		$.fetchcancel('XPO.nashar');
	};

	var mu3allaq = {}; // pending requests
	var ajraa = function (payload, wasaatat) { // flush pending axav requests
		if (Object.keys(mu3allaq).length === 0) return;
	
		payload = payload || {};

		payload = Object.assign(payload, {
			e$		:	BUILDNUMBER		, // insha 3adad
		});

		if (wasaatat) payload = Object.assign(payload, wasaatat);

		payload.XPO.axav = payload.XPO.axav || {};

		for (var i in mu3allaq) {
			var m		= mu3allaq[i]	,
				ism		= m[0]			,
				haajah	= m[1]			,
				qadr	= m[2]			;

			payload.XPO.axav[ism] = payload.XPO.axav[ism] || {};
			payload.XPO.axav[ism][haajah] = qadr;
		}
		
		xataalog(payload);
		$.fetch( xitaab, 'XPO.json='+enc( JSON.stringify(payload) ), 'XPO.axav', progressfn, 30*1000 )
		.then(function (res) {
			hasdisconnected(res);
			
			var jawaab = {};
			try {
				jawaab = JSON.parse( (res||{}).body );
			} catch (e) {
				jawaab.axav = 1;
				jawaab.xataa = 1;
			}
			
			if (hasinshaexpired(jawaab)) return;

			handlejawaab(jawaab);
		});

		mu3allaq = {};
	};

	var wasaatat = {}; // intercession
	var wasaatatishtaghal = function (callback, qanaat) {
		var j = 0, arr = Object.keys(wasaatat);
		if (arr.length === 0) {
			callback();
			return;
		}
		
		var q = $.queue(), ashyaa = { XPO.wasaatat: {} };
		for (var i in wasaatat) {
			q.set(function (done) {
				var o = wasaatat[ arr[j] ];
				o[2](function (shayy) {
					if (shayy !== undefined) {
						ashyaa.XPO.wasaatat[ o[0] ] = ashyaa.XPO.wasaatat[ o[0] ] || {};
						ashyaa.XPO.wasaatat[ o[0] ][ o[1] ] = shayy;
					}
					j++;
					done(q);
				}, qanaat);
			});
		}
		q.run(function () {
			callback && callback(ashyaa);
		});
	};

	var mutawaaqit = {};
	var waaqatishtaghal = function (payload, wasaatat) {
		if (Object.keys(mutawaaqit).length === 0) return;
	
		payload = payload || {};

		payload = Object.assign(payload, {
			e$			:	BUILDNUMBER				, // insha 3adad
		});

		if (wasaatat) payload = Object.assign(payload, wasaatat);

		payload.XPO.waaqat = payload.XPO.waaqat || {};

		for (var i in mutawaaqit) {
			var m		= mutawaaqit[i]	,
				ism		= m[0]			,
				haajah	= m[1]			,
				qadr	= m[2]			;

			payload.XPO.waaqat[ism] = payload.XPO.waaqat[ism] || {};
			payload.XPO.waaqat[ism][haajah] = qadr;
		}

		xataalog(payload);
		$.fetch( xitaab, 'XPO.json='+enc( JSON.stringify(payload) ), 'XPO.waaqat', progressfn, 30*1000 )
		.then(function (res) {
			hasdisconnected(res);
			
			var jawaab = {};
			try {
				jawaab = JSON.parse( (res||{}).body );
			} catch (e) {
				jawaab.waaqat = 1;
				jawaab.xataa = 1;
			}
			
			if (hasinshaexpired(jawaab)) return;

			handlejawaab(jawaab);
		});

		mutawaaqit = {};
	};

	var rafa3 = function (ism, haajah, qadr, marfoo3, wasaatat) {
		var payload = {};
		payload = Object.assign(payload, {
			e$		:	BUILDNUMBER		, // insha 3adad
		});

		if (wasaatat) payload = Object.assign(payload, wasaatat);

		payload.rafa3 = {};
		payload.rafa3[ism] = {};
		payload.rafa3[ism][haajah] = qadr;
		
		var fd = new FormData();
		fd.append('XPO.json', JSON.stringify(payload) );
		fd.append('XPO.rafa3', marfoo3);
		fetch(xitaab, { method: 'post', body: fd }).then(function (res) {
			hasdisconnected(res);
			
			res.json().then(function (jawaab) {
				if (hasinshaexpired(jawaab)) return;

				handlejawaab(jawaab);
			});
		});
	};

	shabakah = {
		xitaab: xitaab,
		mundarij: {
			axav: {},
			waaqat: {},
			wasaatat: {},
			rafa3: {},
		},
		rafa3: function (ism, haajah, qadr, marfoo3) {
			if (!ism) return;
			if (!marfoo3) return;
			
			haajah	= haajah	||	'XPO.xarq'	; // default
			qadr	= qadr		||	0			;
			
			wasaatatishtaghal(function (ashyaa) {
				rafa3(ism, haajah, qadr, marfoo3, ashyaa);
			}, 'XPO.rafa3');
		},
		nashar: function () {
			if (cachedkey) {
				nasharbadaa();
			} else {
				nasharanhaa();
			}
		},
		waaqat: function (ism, haajah, qadr) {
			if (!ism) return;
			
			haajah	= haajah	||	'XPO.xarq'	; // default
			qadr	= qadr		||	0			;
			
			mutawaaqit[ ism+'.'+haajah ] = [ism, haajah, qadr];
			
			$.taxeer('XPO.shabakahwaaqat', function () {
				wasaatatishtaghal(function (ashyaa) {
					waaqatishtaghal({}, ashyaa);
				}, 'XPO.waaqat');
			}, 100);
		},
		axav: function (ism, haajah, qadr) { // { ism, haajah, qadr }
			if (!ism) return;
			if (arguments.length === 2) qadr = haajah, haajah = 0;
			
			haajah	= haajah	||	'XPO.xarq'	; // default
			qadr	= qadr		||	0			;
			
			mu3allaq[ ism+'.'+haajah ] = [ism, haajah, qadr];
			
			$.taxeer('XPO.shabakahajraa', function () {
				wasaatatishtaghal(function (ashyaa) {
					ajraa({}, ashyaa);
				}, 'XPO.axav');
			}, 100);
		},
		jawaab: {
			axav: function (ism, haajah, cb) {
				if (typeof haajah == 'function') cb = haajah, haajah = 0;
				haajah = haajah || 'XPO.xarq';
				shabakah.mundarij.axav[ ism ] = shabakah.mundarij.axav[ ism ] || {};
				shabakah.mundarij.axav[ ism ][ haajah ] = cb;
			},
			waaqat: function (ism, haajah, cb) {
				if (typeof haajah == 'function') cb = haajah, haajah = 0;
				haajah = haajah || 'XPO.xarq';
				shabakah.mundarij.waaqat[ ism ] = shabakah.mundarij.waaqat[ ism ] || {};
				shabakah.mundarij.waaqat[ ism ][ haajah ] = cb;
			},
			tawassat: function (ism, haajah, cb) {
				if (typeof haajah == 'function') cb = haajah, haajah = 0;
				haajah = haajah || 'XPO.xarq';
				shabakah.mundarij.wasaatat[ ism ] = shabakah.mundarij.wasaatat[ ism ] || {};
				shabakah.mundarij.wasaatat[ ism ][ haajah ] = cb;
			},
			rafa3: function (ism, haajah, cb) {
				if (typeof haajah == 'function') cb = haajah, haajah = 0;
				haajah = haajah || 'XPO.xarq';
				shabakah.mundarij.rafa3[ ism ] = shabakah.mundarij.rafa3[ ism ] || {};
				shabakah.mundarij.rafa3[ ism ][ haajah ] = cb;
			},
		},
		tawassat: function (ism, haajah, cb) { // intercept
			if (typeof haajah == 'function') cb = haajah, haajah = 0;
			haajah	= haajah	||	'XPO.xarq'	; // default
			wasaatat[ ism+'.'+haajah ] = [ism, haajah, cb];
		},
	};
	
	/* TODO hook visibility to nashar
	 * 
	 * hook sessionchange, start/stop nashar
	 * 
	 * hook ready, if signedin, start nashar
	 * 
	 * on hook [axav|nashar], run hook jawaab { [axav|nashar]: bool, xataa: bool }
	 * 
	 * have shabakah.xaadim
	 * */
	Hooks.set('XPO.sessionchange', function (key) {
		cachedkey = key || 0;
		if (cachedkey) {
			shabakah.nashar();
			shabakah.waaqat();
		}
	});
	Hooks.set('XPO.ready', function () {
		shabakahkeys = templates.keys(XPO.shabakahui);
		
		shabakah.tawassat('XPO.shabakah', 'XPO.waqt', function (intahaa, qanaat) {
			intahaa( preferences.get('@') );
		});
		shabakah.jawaab.tawassat('XPO.shabakah', 'XPO.waqt', function (jawaab) {
			if (jawaab && cachedkey) preferences.set('@', jawaab);
		});
		
		offlinewaqt = preferences.get('@0', 1) || false;
		listener('online', function (e) {
			setnetwork(1);
		});
		listener('offline', function (e) {
			setnetwork();
		});

		if (sessions) {
			cachedkey = sessions.signedin() || 0;
			if (cachedkey) {
				shabakah.nashar();
				shabakah.waaqat();
			}
		}
	});
})();
