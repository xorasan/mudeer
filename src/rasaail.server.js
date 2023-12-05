var rasaail,
	tbl_rsl = 'rasaail0',
	musicmetadata = require('./xudoo3/music-metadata');
//	codecparser = require('./xudoo3/codec-parser').default;

;(function(){
	'use strict';
	
	rasaail = {
		matn2caaniyaat: function (matn) { // secs
			var c = matn.length;
			return Math.ceil( c / 6 ) || 1;
		},
	};
})();
shabakah.tawassat('XPO.rasaail', function (jawaab) {
	if (jawaab.hisaab && jawaab.waqt > 0) {
		var arr = [], limit = 100;

		wuqu3aat.query('select * from `'+Config.database.name+'`.`'+tbl_mklmt+'` '+
					'where a3daa0 like ? '+
//					'and updated0 > ? '+
					'order by updated0 asc limit 0,'+limit,
		[ '% '+jawaab.hisaab.uid+':%'/*, jawaab.waqt*/ ]).then(function (mklmt) {
			if (mklmt.rows.length) {
				var mstr = [];
				mklmt.rows.forEach(function (m) {
					mstr.push('mukaalamah0 = '+m.uid0);
				});
				mstr = mstr.join(' or ');
				wuqu3aat.query('select * from `'+Config.database.name+'`.`'+tbl_rsl+'` '+
							'where ('+mstr+') '+
							'and updated0 > ? '+
							'order by updated0 asc limit 0,'+limit,
				[ jawaab.waqt ]).then(function (outcome) {
					outcome.rows.forEach(function (o, i) {
						var x = {};
						x.uid			= o.uid0;
						x.mukaalamah	= o.mukaalamah0;
						x.maalik		= o.maalik0;
						x.sinf			= o.sinf0;
						if (x.sinf === 0) x.matn = o.matn0;
						if ([1, 2].includes(x.sinf)) x.xitaab = o.matn0;
						x.havaf			= o.havaf0;
						x.haalah		= o.haalah0;
						x.created		= o.created0;
						x.updated		= o.updated0;
						arr.push( x );
					});
					if (arr.length) jawaab.axav(arr).munfaq();
					else jawaab.intahaa();
				});
			} else jawaab.intahaa();
		});
	} else jawaab.intahaa();
});
shabakah.axav('XPO.rasaail', function (jawaab) {
	if (jawaab.hisaab) {
		var arr = [],
			limit = 100;

//		$.log( jawaab.qadr );

		wuqu3aat.query('select * from `'+Config.database.name+'`.`'+tbl_rsl+'` '+
					'where mukaalamah0 = ? '+
					'order by updated0 asc limit 0,'+limit,
		[ parseint(jawaab.qadr.filter.mukaalamah) ]).then(function (outcome) {
			outcome.rows.forEach(function (o, i) {
				var x = {};
				x.uid			= o.uid0;
				x.mukaalamah	= o.mukaalamah0;
				x.maalik		= o.maalik0;
				x.sinf			= o.sinf0;
				if (x.sinf === 0) x.matn = o.matn0;
				if ([1, 2].includes(x.sinf)) x.xitaab = o.matn0;
				x.havaf			= o.havaf0;
				x.haalah		= o.haalah0;
				x.created		= o.created0;
				x.updated		= o.updated0;
				arr.push( x );
			});
			jawaab.axav(arr).munfaq();
		});
	} else jawaab.intahaa();
});
shabakah.rafa3('XPO.rasaail', 'XPO.soorah', function (jawaab) {
	var qadr = jawaab.qadr, marfoo3 = jawaab.marfoo3, duration = 3;

	if (!jawaab.hisaab) { jawaab.intahaa(); return; } // not signed in
	if (!isnum(qadr) || qadr < 1 || !marfoo3) { jawaab.intahaa(); return; } // received nothing
	
	var filesize = Math.ceil(marfoo3.size/1024); // x.x kB
	if (filesize > 150) { jawaab.rafa3(0).intahaa(); return; } // size too big
	
	duration = filesize;
	helpers.getallbyuid(Config.database.name, tbl_mklmt, [{uid0:qadr}], function (rows) {
		if (rows.length) {
			var mklmh = rows.get(qadr);
			var ct = new Date().getTime(), yr = new Date().getFullYear();
			var zaad = [], txrt = {};
			if (mklmh) {
				if (mukaalamaat.ismaftooh(mklmh, jawaab.hisaab.uid)) {
					var o = {
						mukaalamah0:	parseint(qadr),
						sinf0:			2,
						maalik0:		jawaab.hisaab.uid,
						_created0:		ct,
						updated0:		ct,
					};
					// m3 is linked between nashar<-->xaadim
//					Files.set.folder('m3');
					Files.set.folder('m3/'+yr);
					Files.set.folder('m3/'+yr+'/'+qadr);
					o.matn0 = 'm3/'+yr+'/'+qadr+'/'+ct+'.jpg';
					marfoo3.mv(o.matn0, function (a) {
						$.log('soorah move result', a);
					});
					zaad.push(o);
				}
			}
			if (zaad.length)
			helpers.set(Config.database.name, tbl_rsl, zaad, function (outcome) {
				var nataaij = [];
				outcome.rows.forEach(function (item) {
					var m = item.mukaalamah0;
					if (!item.havaf0)
					var txr = mukaalamaat.taxeer(m, duration);
					txrt[ m ] = {
						uid:			m,
						taxeer:			txr,
					};
					var o = {
						uid:		item.uid0,
						ruid:		item.ruid,
						mukaalamah:	m,
						sinf:		2,
						xitaab:		item.matn0,
						havaf:		item.havaf0,
						maalik:		item.maalik0,
						created:	item.created0,
						updated:	item.updated0,
					};
					if (item.havaf0) {
						// maybe get rid of matn ?
					}
					nataaij.push(o);
				});
				jawaab.haajah('XPO.taxeer').axav(Object.values(txrt));
				jawaab.haajah('XPO.xarq').waaqat(nataaij);
				jawaab.rafa3(1).munfaq();
			}, { checkism: false });
			else
			jawaab.rafa3(0).munfaq();
			
		} else jawaab.rafa3(0).munfaq();
	});
});
shabakah.rafa3('XPO.rasaail', 'XPO.sawt', function (jawaab) {
	var qadr = jawaab.qadr, marfoo3 = jawaab.marfoo3;

	if (!jawaab.hisaab) { jawaab.intahaa(); return; } // not signed in
	if (!isnum(qadr) || qadr < 1 || !marfoo3) { jawaab.intahaa(); return; } // received nothing
	
	var filesize = Math.ceil(marfoo3.size/1024); // x.x kB
	if (filesize > 80) { jawaab.rafa3(0).intahaa(); return; } // size too big

//	$.log( qadr, marfoo3 );
	musicmetadata.parseBuffer(jawaab.marfoo3.data, 0, {
		duration: true,
	}).then(function (d) {
		var duration = d.format.duration; // x.x secs
		duration = Math.max(duration, filesize);
		if (!isnum(duration)) duration = filesize;
		helpers.getallbyuid(Config.database.name, tbl_mklmt, [{uid0:qadr}], function (rows) {
			if (rows.length) {
				var mklmh = rows.get(qadr);
				var ct = new Date().getTime(), yr = new Date().getFullYear();
				var zaad = [], txrt = {};
				if (mklmh) {
					if (mukaalamaat.ismaftooh(mklmh, jawaab.hisaab.uid)) {
						var o = {
							mukaalamah0:	parseint(qadr),
							sinf0:			1,
							maalik0:		jawaab.hisaab.uid,
							_created0:		ct,
							updated0:		ct,
						};
						Files.set.folder('m3');
						Files.set.folder('m3/'+yr);
						Files.set.folder('m3/'+yr+'/'+qadr);
						o.matn0 = 'm3/'+yr+'/'+qadr+'/'+ct+'.webm';
						marfoo3.mv(o.matn0, function (a) {
//							$.log('move reseult', a);
						});
						zaad.push(o);
					}
				}
				if (zaad.length)
				helpers.set(Config.database.name, tbl_rsl, zaad, function (outcome) {
					var nataaij = [];
					outcome.rows.forEach(function (item) {
						var m = item.mukaalamah0;
						if (!item.havaf0)
						var txr = mukaalamaat.taxeer(m, duration);
						txrt[ m ] = {
							uid:			m,
							taxeer:			txr,
						};
						var o = {
							uid:		item.uid0,
							ruid:		item.ruid,
							mukaalamah:	m,
							sinf:		1,
							xitaab:		item.matn0,
							havaf:		item.havaf0,
							maalik:		item.maalik0,
							created:	item.created0,
							updated:	item.updated0,
						};
						if (item.havaf0) {
							// maybe get rid of matn ?
						}
						nataaij.push(o);
					});
					jawaab.haajah('XPO.taxeer').axav(Object.values(txrt));
					jawaab.haajah('XPO.xarq').waaqat(nataaij);
					jawaab.rafa3(1).munfaq();
				}, { checkism: false });
				else
				jawaab.rafa3(0).munfaq();
				
			} else jawaab.rafa3(0).munfaq();
		});
	});
});
shabakah.waaqat('XPO.rasaail', function (jawaab) {
//	$.log( 'XPO.rasaail', '', jawaab.qadr );
	var qadr = jawaab.qadr;
	
	if (!jawaab.hisaab) { jawaab.intahaa(); return; } // not signed in
	if (!qadr) { jawaab.intahaa(); return; } // received nothing

	var mklmt = [];
	qadr.forEach(function (item) {
		if (isnum(item.uid) && isnum(item.mukaalamah))
			mklmt.push({
				uid0: parseint(item.mukaalamah),
			});
	});
	helpers.getallbyuid(Config.database.name, tbl_mklmt, mklmt, function (rows) {
		if (rows.length) {
			var zaad = [], pops = [], txrt = {};
			var ct = new Date().getTime();
			qadr.forEach(function (item) {
				var m = parseint(item.mukaalamah), mklmh = rows.get(m);
				if (isnum(item.uid) && mklmh) {
					if (mukaalamaat.ismaftooh(mklmh, jawaab.hisaab.uid)) {
						var o = {
							uid0:			parseint(item.uid),
							mukaalamah0:	parseint(item.mukaalamah),
							_created0:		ct,
							updated0:		ct,
						};
						if (item.havaf) {
							o.havaf0 = ct;
						} else {
							o.matn0 = parsestring(item.matn, 480);
							o.maalik0 = jawaab.hisaab.uid;
						}
						zaad.push(o);
					} else
					pops.push({
						uid:			parseint(item.uid),
						havaf:			-1,
					});
				}
			});
			if (zaad.length)
			helpers.set(Config.database.name, tbl_rsl, zaad, function (outcome) {
				var nataaij = [];
				outcome.rows.forEach(function (item) {
					var m = item.mukaalamah0;
					if (!item.havaf0)
					var txr = mukaalamaat.taxeer(m, rasaail.matn2caaniyaat(item.matn0));
					txrt[ m ] = {
						uid:			m,
						taxeer:			txr,
					};
					var o = {
						uid:		item.uid0,
						ruid:		item.ruid,
						mukaalamah:	m,
						matn:		item.matn0,
						havaf:		item.havaf0,
						maalik:		item.maalik0,
						created:	item.created0,
						updated:	item.updated0,
					};
					if (item.havaf0) {
						// maybe get rid of matn ?
					}
					nataaij.push(o);
				});
				jawaab.haajah('XPO.taxeer').axav(Object.values(txrt));
				jawaab.waaqat(nataaij.concat(pops)).intahaa();
			}, { checkism: false });
			else
			jawaab.waaqat(pops).intahaa();
		} else {
			var zaad = [];
			qadr.forEach(function (item) {
				if (isnum(item.uid))
				zaad.push({
					uid:			parseint(item.uid),
					havaf:			-1,
				});
			});
			jawaab.waaqat(zaad).intahaa();
		}
	});
});
