//+ nazzaf tsfeef
var hisaab,
	TAGMAX = 15,
	SHAKLTAGMAX = 50,
	ISMMUBEENMAX = 48,
	HIKAAYAHMAX = 480;
	
;(function(){
	hisaab = {
		qadr: function (u, v) {
			return { uid: u, qadr: v };
		},
		nazzaf: function (str, max) {
			if (!isstr(str)) str = parsestring(str);
			return str.trim().slice(0, max);
		},
	};
})();

shabakah.tawassat('XPO.hisaab', function (jawaab) {
	if (jawaab.hisaab) {
		var arr = [];
		
		if (jawaab.waqt < jawaab.hisaab.updated) {
			var milk = bazaar.tsfeef(jawaab.hisaab.milk),
				shakl = bazaar.tsfeef(jawaab.hisaab.shakl),
				wazaaif = bazaar.tsfeef(jawaab.hisaab.wazaaif),
				xsoosyat = bazaar.tsfeef(jawaab.hisaab.xsoosyat);
			
			arr.push( hisaab.qadr('XPO.ism',		jawaab.hisaab.ism		) );
			arr.push( hisaab.qadr('XPO.ismmubeen',	jawaab.hisaab.ismmubeen	) );
			arr.push( hisaab.qadr('XPO.shakl',		shakl					) );
			arr.push( hisaab.qadr('XPO.milk',		milk					) );
			arr.push( hisaab.qadr('XPO.wazaaif',	wazaaif					) );
			arr.push( hisaab.qadr('XPO.xsoosyat',	xsoosyat				) );
		}

		if (arr.length) jawaab.axav(arr).munfaq();
		else jawaab.intahaa();
	} else jawaab.intahaa();
});
shabakah.waaqat('XPO.hisaab', function (jawaab) {
	var qadr = jawaab.qadr;
	
	if (!jawaab.hisaab) { jawaab.intahaa(); return; } // not signed in
	if (!qadr) { jawaab.intahaa(); return; } // received nothing
	var tabdeel = 0, ashyaa = { uid0: jawaab.hisaab.uid }, arr = [];

	/* shakl milk wazaaif
	 * multiple things are inserted to represent their numbers
	 * */

//	XPO.uid			unique id
//	XPO.ism			user name
//	XPO.ismmubeen	display name
	if (isstr(qadr.ismmubeen)) {
		arr.push(
			hisaab.qadr('XPO.ismmubeen',
				ashyaa.ismmubeen0 = hisaab.nazzaf(qadr.ismmubeen, ISMMUBEENMAX)
			)
		);
	}
//	XPO.hikaayah	life story
	if (isstr(qadr.hikaayah)) {
		jawaab.waaqat('XPO.hikaayah',
			ashyaa.hikaayah0 = hisaab.nazzaf(qadr.hikaayah, HIKAAYAHMAX)
		);
		tabdeel = 1;
	}
//	XPO.mowlood		birthday
	if (isnum(qadr.mowlood)) {
		jawaab.waaqat('XPO.mowlood', ashyaa.mowlood0 = qadr.mowlood );
		tabdeel = 1;
	}
//	XPO.sinf		type, rank
//	XPO.shakl		appearance
	if (isarr(qadr.shakl)) {
		var out = bazaar.tasdeeq(qadr.shakl, jawaab.hisaab.shakl_m, bazaar.shakl, SHAKLTAGMAX)
		arr.push( hisaab.qadr('XPO.shakl', out ) );
		ashyaa.shakl0 = bazaar.ilaastr( out );
		tabdeel = 1;
	}
//	XPO.milk		possessions
	if (isarr(qadr.milk)) {
		var out = bazaar.tasdeeq(qadr.milk, jawaab.hisaab.milk_m, bazaar.milk, TAGMAX)
		arr.push( hisaab.qadr('XPO.milk', out ) );
		ashyaa.milk0 = bazaar.ilaastr( out );
		tabdeel = 1;
	}
//	XPO.wazaaif		jobs
	if (isarr(qadr.wazaaif)) {
		var out = bazaar.tasdeeq(qadr.wazaaif, jawaab.hisaab.wazaaif_m, bazaar.wazaaif, TAGMAX);
		arr.push( hisaab.qadr('XPO.wazaaif', out ) );
		ashyaa.wazaaif0 = bazaar.ilaastr( out );
		tabdeel = 1;
	}
//	XPO.xsoosyat	features
	if (isarr(qadr.xsoosyat)) {
		var out = bazaar.tasdeeq(qadr.xsoosyat, jawaab.hisaab.xsoosyat_m, bazaar.xsoosyat, TAGMAX);
		arr.push( hisaab.qadr('XPO.xsoosyat', out ) );
		ashyaa.xsoosyat0 = bazaar.ilaastr( out );
		tabdeel = 1;
	}
//	XPO.jins		gender
	if (isnum(qadr.jins)) {
		if (qadr.jins < 0 || qadr.jins > 3) qadr.jins = 0;
		jawaab.waaqat('XPO.jins', ashyaa.jins0 = qadr.jins);
		tabdeel = 1;
	}
//	XPO.haram		family
//	XPO.aqrabaa		relatives
//	XPO.masaa3ib	blocks
//	XPO.asdiqaa		friends
//	XPO.mushtarayaat purchased items
//	XPO.naqd		money
//	XPO.talab		wants
//	XPO.haatif		phone
//	XPO.haalah		status
//	XPO.ittisaal	connected when
//	XPO.indimaam	joined when (after invitation)
//	XPO.xattil3ard	latitude
//	XPO.xattiltool	longitude
//	XPO.created		created when
//	XPO.updated		updated when
	if (arr.length) {
		ashyaa.updated0 = new Date().getTime();
		helpers.set(WUQU3AATNAME, tbl_hsbt, [ashyaa], function (j) {
			Polling.intahaakul([jawaab.hisaab.uid]);
			jawaab.waaqat(arr).intahaa();
		}, {
			checkism: false
		});
	}
	else jawaab.intahaa();
});
