//+ nazzaf tsfeef tarteeb
var qareeb, QAREEBMAX = 60;
	
;(function(){
	qareeb = {
		nazzaf: function (str, max) {
			if (!isstr(str)) str = parsestring(str);
			return str.trim().slice(0, max);
		},
	};
})();

// miftaah attached, verify & add hisaab info
shabakah.tawassat('XPO.qareeb', 'XPO.xutoot', function (jawaab) {
	var qadr = jawaab.qadr;
	
	if (jawaab.hisaab && isarr(qadr) && isnum(qadr[0]) && isnum(qadr[1])) {
		// update .updated to keep session alive
		helpers.set(Config.database.name, tbl_hsbt, [{
			uid0: 			jawaab.hisaab.uid,
			xattil3ard0:	parsefloat(qadr[0] || 0),
			xattiltool0:	parsefloat(qadr[1] || 0),
			ittisaal0:		new Date().getTime(),
			updated0:		new Date().getTime(),
		}], function (outcome) {
			var row = outcome.rows[0];
			if (row) {
				jawaab.hisaab.xattiltool = row.xattiltool0;
				jawaab.hisaab.xattil3ard = row.xattil3ard0;
			}
			jawaab.tawassat(true).intahaa();
		}, {
			checkism: false
		});
	} else {
		jawaab.tawassat(false).intahaa();
	}
});
shabakah.axav('XPO.qareeb', function (jawaab) {
	if (jawaab.hisaab) {
		var arr = [],
			longitude = jawaab.hisaab.xattiltool,
			latitude = jawaab.hisaab.xattil3ard,
			maxrange = 20000,
			limit = 100;

		wuqu3aat.query('select *, ( 6371 * acos ( cos ( radians(?) ) * '+
					'cos( radians( xattil3ard0 ) ) * cos( radians( xattiltool0 ) - radians(?) ) '+
					'+ sin ( radians(?) ) * sin( radians( xattil3ard0 ) ) ) ) as distance from `'
					+Config.database.name+'`.`'+tbl_hsbt+'` having distance < ? or distance is null '+
					'order by distance asc limit 0,'+limit,
		[
			latitude, longitude, latitude, maxrange
		]).then(function (outcome) {
			outcome.rows.forEach(function (o, i) {
				var x = {};
				x.tarteeb = i;
				x.uid		= o.uid0;
				x.ism		= o.ism0;
				x.ismmubeen	= o.ismmubeen0;
				x.faasilah	= o.distance || 0;
				x.milk		= bazaar.tsfeef(o.milk0),
				x.shakl		= bazaar.tsfeef(o.shakl0),
				x.wazaaif	= bazaar.tsfeef(o.wazaaif0);
				arr.push( x );
			});
			jawaab.haajah('XPO.raddaas').axav(
				bazaar.naadiruid(
					jawaab.hisaab.xsoosyat,
					bazaar.axavnaadir(500, bazaar.xsoosyat)
				)
			);
			jawaab.axav(arr).munfaq();
		});
	} else jawaab.intahaa();
});
