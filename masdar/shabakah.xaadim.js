/*
 * Web.adaaf
 * shabakah.axav( ism, haajah, cb )
 * shabakah.waaqat( ... )
 * 
 * json.axav.ism.haajah = qadr
 * json.waaqat.ism.haajah = qadr
 * 
 * nashar is very lightweight
 * 
 * mirror this on zaboon side
 * you are able to listen for specific jawaabaat for your own juzw
 * you can add batch (duf3ah) commands to be executed every 24h
 * */
//+ axav waaqat nashar intahaa mundarij hisaab qadr haajah ism wasaatat tawassat
//+ rafa3
var shabakahfadaail = {}, AWWAL = 100, WAST = 500, AAXIR = 1000,
	shabakahduf3aat = {};
[AWWAL, WAST, AAXIR].forEach(function (fadl) {
	shabakahfadaail[fadl] = {
		wasaatat		: {},
		axav			: {},
		waaqat			: {},
		rafa3			: {},
	};
});
var shabakah = {
	tawassat: function (ism, haajah, cb) {
		if (typeof haajah == 'function') cb = haajah, haajah = 0;
		haajah = haajah || 'XPO.xarq';
		var fadl = shabakahfadaail[this._fadl || WAST];
		fadl.wasaatat[ ism ] = fadl.wasaatat[ ism ] || {};
		fadl.wasaatat[ ism ][ haajah ] = cb;
	},
	axav: function (ism, haajah, cb) {
		if (typeof haajah == 'function') cb = haajah, haajah = 0;
		haajah = haajah || 'XPO.xarq';
		var fadl = shabakahfadaail[this._fadl || WAST];
		fadl.axav[ ism ] = fadl.axav[ ism ] || {};
		fadl.axav[ ism ][ haajah ] = cb;
	},
	waaqat: function (ism, haajah, cb) {
		if (typeof haajah == 'function') cb = haajah, haajah = 0;
		haajah = haajah || 'XPO.xarq';
		var fadl = shabakahfadaail[this._fadl || WAST];
		fadl.waaqat[ ism ] = fadl.waaqat[ ism ] || {};
		fadl.waaqat[ ism ][ haajah ] = cb;
	},
	rafa3: function (ism, haajah, cb) {
		if (typeof haajah == 'function') cb = haajah, haajah = 0;
		haajah = haajah || 'XPO.xarq';
		var fadl = shabakahfadaail[this._fadl || WAST];
		fadl.rafa3[ ism ] = fadl.rafa3[ ism ] || {};
		fadl.rafa3[ ism ][ haajah ] = cb;
	},
	fadl: function (fadl) {
		var s = Object.assign({}, shabakah);
		s._fadl = fadl;
		return s;
	},
	duf3ah: function (ism, haajah, cb) {
		if (typeof haajah == 'function') cb = haajah, haajah = 0;
		haajah = haajah || 'XPO.xarq';
		shabakahduf3aat[ ism ] = shabakahduf3aat[ ism ] || {};
		shabakahduf3aat[ ism ][ haajah ] = cb;
	},
	duf3ahajraa: function () {
		setTimeout(function () {
//			$.log( 'shabakah.duf3ahajraa' );
			var d = shabakahduf3aat;
			for (var i in d) {
				if (d[i]) for (var h in d[i]) {
					isfun(d[i][h]) && d[i][h]();
				}
			}
			shabakah.duf3ahajraa();
		}, 1 * 15 * 60 * 1000); // 15m for now, 24h later
	},
};
// waqt attached, verify & add new waqt
shabakah.fadl(AWWAL).tawassat('XPO.shabakah', 'XPO.waqt', function (jawaab) {
	/*
	 * waqt is set only for perm and nashar channels
	 * on-demand doesn't send waqt at all
	 * 
	 * setting waqt here helps because while the response for this request
	 * is being processed, if new items are added by someone else, this
	 * waqt will be before the creation dates of those new items and
	 * they'll get synced on the next request
	 * */
	if (jawaab.qadr) jawaab.extra.waqt = jawaab.qadr || 0;
	else jawaab.extra.waqt = 0;

	/*
	 * only return waqt if client says that it doesn't have waqt
	 * so that only nashar qanaat can send out waqt in all other cases
	 * */
	if (!jawaab.qadr || jawaab.nashar)
		jawaab.tawassat( new Date().getTime() );

	jawaab.intahaa();
});
Web.adaaf(function (done, queue, extra) {
	var payload		= extra.payload	;
	var obj			= extra.obj		;
	var queuesub	= $.queue()		;

	var jawaab = function (donesub, ism, haajah, qadrminzaboon) {
		var jwb = {
			intahaa: function () {
				donesub(queuesub, extra);
			},
			munfaq: function () {
				extra.munfaq = 1; // handled consumed
				donesub(queuesub, extra);
			},
			axav: function (qadrx, qadr2, haajah2) {
				var h = haajah2 || haajah || 'XPO.xarq';
				obj.axav					= obj.axav			|| {};
				obj.axav[ ism ]				= obj.axav[ ism ]	|| {};
				if (qadr2 !== undefined) {
					obj.axav[ ism ][ h ] = obj.axav[ ism ][ h ] || {};
					obj.axav[ ism ][ h ][ qadrx ] = obj.axav[ ism ][ h ][ qadrx ] || {};
					obj.axav[ ism ][ h ][ qadrx ] = qadr2;
				} else {
					obj.axav[ ism ][ h ] = qadrx;
				}
				return jwb;
			},
			waaqat: function (qadrx, qadr2, haajah2) {
				var h = haajah2 || haajah || 'XPO.xarq';
				obj.waaqat					= obj.waaqat		|| {};
				obj.waaqat[ ism ]			= obj.waaqat[ ism ]	|| {};
				if (qadr2 !== undefined) {
					obj.waaqat[ ism ][ h ] = obj.waaqat[ ism ][ h ] || {};
					obj.waaqat[ ism ][ h ][ qadrx ] = obj.waaqat[ ism ][ h ][ qadrx ] || {};
					obj.waaqat[ ism ][ h ][ qadrx ] = qadr2;
				} else {
					obj.waaqat[ ism ][ h ] = qadrx;
				}
				return jwb;
			},
			tawassat: function (qadrx, qadr2, haajah2) {
				var h = haajah2 || haajah || 'XPO.xarq';
				obj.wasaatat			= obj.wasaatat		|| {};
				obj.wasaatat[ ism ]		= obj.wasaatat[ ism ]	|| {};
				if (qadr2 !== undefined) {
					obj.wasaatat[ ism ][ h ] = obj.wasaatat[ ism ][ h ] || {};
					obj.wasaatat[ ism ][ h ][ qadrx ] = obj.wasaatat[ ism ][ h ][ qadrx ] || {};
					obj.wasaatat[ ism ][ h ][ qadrx ] = qadr2;
				} else {
					obj.wasaatat[ ism ][ h ] = qadrx;
				}
				return jwb;
			},
			rafa3: function (qadrx, qadr2, haajah2) {
				var h = haajah2 || haajah || 'XPO.xarq';
				obj.rafa3				= obj.rafa3		|| {};
				obj.rafa3[ ism ]		= obj.rafa3[ ism ]	|| {};
				if (qadr2 !== undefined) {
					obj.rafa3[ ism ][ h ] = obj.rafa3[ ism ][ h ] || {};
					obj.rafa3[ ism ][ h ][ qadrx ] = obj.rafa3[ ism ][ h ][ qadrx ] || {};
					obj.rafa3[ ism ][ h ][ qadrx ] = qadr2;
				} else {
					obj.rafa3[ ism ][ h ] = qadrx;
				}
				return jwb;
			},
			haajah: function (ism) {
				var jwb2 = Object.assign({}, jwb);
				jwb2.axav = function (qadrx, qadr2) {
					jwb.axav(qadrx, qadr2, ism);
					return jwb2;
				};
				jwb2.waaqat = function (qadrx, qadr2) {
					jwb.waaqat(qadrx, qadr2, ism);
					return jwb2;
				};
				jwb2.tawassat = function (qadrx, qadr2) {
					jwb.tawassat(qadrx, qadr2, ism);
					return jwb2;
				};
				jwb2.rafa3 = function (qadrx, qadr2) {
					jwb.rafa3(qadrx, qadr2, ism);
					return jwb2;
				};
				return jwb2;
			},
			hisaab: extra.hisaab,
			waqt: extra.waqt,
			qadr: qadrminzaboon,
			extra: extra,
			nashar: !!payload.nashar,
		};
		if (extra.files && extra.files.rafa3) {
			jwb.marfoo3 = extra.files.rafa3;
		}
		return jwb;
	};
	
	var arr = [], count = 0;
	
	var schedule = function (item, fadl) { // priority
		for (var ism in payload[item]) {
			if (fadl[item][ism]) {
				var haajaat = payload[item][ism];
				for (var haajah in haajaat) {
					arr.push({
						ism: ism,
						haajah: haajah,
						qadr: haajaat[haajah],
					});
					queuesub.set(function (donesub) {
						var o = arr[count];
						count++;
						if (typeof fadl[item][o.ism][o.haajah] == 'function') {
							fadl[item][o.ism][o.haajah](
								jawaab(donesub, o.ism, o.haajah, o.qadr)
							);
						} else donesub(queuesub);
					});
				}
			}
		}
	};

	['XPO.wasaatat', 'XPO.axav', 'XPO.waaqat', 'XPO.rafa3'].forEach(function (item) {
		if (payload[item]) {
			[AWWAL, WAST, AAXIR].forEach(function (fadl) {
				schedule( item, shabakahfadaail[fadl] );
			});
		}
	});
	
	queuesub.run(function () {
		done(queue, extra);
	});
});

shabakah.duf3ahajraa();