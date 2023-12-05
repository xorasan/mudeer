var anbaa,
	tbl_anb = 'anbaa0';
;(function(){
	'use strict';
	
	anbaa = {
		matn2caaniyaat: function (matn) { // secs
			var c = matn.length;
			return Math.ceil( c / 5 ) || 1;
		},
	};
})();
shabakah.tawassat('XPO.anbaa', function (jawaab) {
	if (jawaab.hisaab && jawaab.waqt > 0) {
		var arr = [],
			limit = 100;

		// TODO sync pops here
		wuqu3aat.query('select * from `'+Config.database.name+'`.`'+tbl_qasas+'` '+
					'where a3daa0 like ? '+
//					'and updated0 > ? '+
					'order by updated0 asc limit 0,'+limit,
		[ '% '+jawaab.hisaab.uid+':%'/*, jawaab.waqt*/ ]).then(function (qasas) {
			if (qasas.rows.length) {
				var mstr = [];
				qasas.rows.forEach(function (m) {
					mstr.push('qissah0 = '+m.uid0);
				});
				mstr = mstr.join(' or ');
				wuqu3aat.query('select * from `'+Config.database.name+'`.`'+tbl_anb+'` '+
							'where ('+mstr+') '+
							'and updated0 > ? '+
							'order by updated0 asc limit 0,'+limit,
				[ jawaab.waqt ]).then(function (outcome) {
					outcome.rows.forEach(function (o, i) {
						var x = {};
						x.uid			= o.uid0;
						x.qissah		= o.qissah0;
						x.maalik		= o.maalik0;
						x.matn			= o.matn0;
						x.havaf			= o.havaf0;
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
shabakah.rafa3('XPO.anbaa', 'XPO.soorah', function (jawaab) {
	var qadr = jawaab.qadr, marfoo3 = jawaab.marfoo3, duration = 3;

	if (!jawaab.hisaab) { jawaab.intahaa(); return; } // not signed in
	if (!isnum(qadr) || qadr < 1 || !marfoo3) { jawaab.intahaa(); return; } // received nothing
	
	var filesize = Math.ceil(marfoo3.size/1024); // x.x kB
	if (filesize > 150) { jawaab.rafa3(0).intahaa(); return; } // size too big
	
	duration = filesize;
	
	helpers.getallbyuid(Config.database.name, tbl_qasas, [{uid0:qadr}], function (rows) {
		if (rows.length) {
			var mklmh = rows.get(qadr);
			var ct = new Date().getTime(), yr = new Date().getFullYear();
			var zaad = [], txrt = {};
			if (mklmh) {
				if (qasas.is3udw(mklmh, jawaab.hisaab.uid)) {
					var o = {
						qissah0:		parseint(qadr),
						sinf0:			2,
						maalik0:		jawaab.hisaab.uid,
						_created0:		ct,
						updated0:		ct,
					};
					// qss is linked between nashar<-->xaadim
//					Files.set.folder('qss');
					Files.set.folder('qss/'+yr);
					Files.set.folder('qss/'+yr+'/'+qadr);
					o.matn0 = 'qss/'+yr+'/'+qadr+'/'+ct+'.jpg';
					marfoo3.mv(o.matn0, function (a) {
						$.log('soorah move result', a);
					});
					zaad.push(o);
				}
			}
			if (zaad.length)
			helpers.set(Config.database.name, tbl_anb, zaad, function (outcome) {
				var nataaij = [];
				outcome.rows.forEach(function (item) {
					var m = item.qissah0;
					if (!item.havaf0)
					var txr = mukaalamaat.taxeer(m, duration);
					txrt[ m ] = {
						uid:			m,
						taxeer:			txr,
					};
					var o = {
						uid:		item.uid0,
						ruid:		item.ruid,
						qissah:		m,
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
shabakah.rafa3('XPO.anbaa', 'XPO.sawt', function (jawaab) {
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
		helpers.getallbyuid(Config.database.name, tbl_qasas, [{uid0:qadr}], function (rows) {
			if (rows.length) {
				var mklmh = rows.get(qadr);
				var ct = new Date().getTime(), yr = new Date().getFullYear();
				var zaad = [], txrt = {};
				if (mklmh) {
					if (qasas.is3udw(mklmh, jawaab.hisaab.uid)) {
						var o = {
							qissah0:		parseint(qadr),
							sinf0:			1,
							maalik0:		jawaab.hisaab.uid,
							_created0:		ct,
							updated0:		ct,
						};
						Files.set.folder('qss');
						Files.set.folder('qss/'+yr);
						Files.set.folder('qss/'+yr+'/'+qadr);
						o.matn0 = 'qss/'+yr+'/'+qadr+'/'+ct+'.webm';
						marfoo3.mv(o.matn0, function (a) {
//							$.log('move reseult', a);
						});
						zaad.push(o);
					}
				}
				if (zaad.length)
				helpers.set(Config.database.name, tbl_anb, zaad, function (outcome) {
					var nataaij = [];
					outcome.rows.forEach(function (item) {
						var m = item.qissah0;
						if (!item.havaf0)
						var txr = mukaalamaat.taxeer(m, duration);
						txrt[ m ] = {
							uid:			m,
							taxeer:			txr,
						};
						var o = {
							uid:		item.uid0,
							ruid:		item.ruid,
							qissah:		m,
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
shabakah.axav('XPO.anbaa', function (jawaab) {
	if (jawaab.hisaab) {
		var arr = [],
			limit = 100;

//		$.log( jawaab.qadr );

		wuqu3aat.query('select * from `'+Config.database.name+'`.`'+tbl_anb+'` '+
					'where qissah0 = ? '+
					'order by updated0 asc limit 0,'+limit,
		[ parseint(jawaab.qadr.filter.qissah) ]).then(function (outcome) {
			outcome.rows.forEach(function (o, i) {
				var x = {};
				x.uid			= o.uid0;
				x.qissah	= o.qissah0;
				x.maalik		= o.maalik0;
				x.matn			= o.matn0;
				x.havaf			= o.havaf0;
				x.created		= o.created0;
				x.updated		= o.updated0;
				arr.push( x );
			});
			jawaab.axav(arr).munfaq();
		});
	} else jawaab.intahaa();
});
shabakah.waaqat('XPO.anbaa', function (jawaab) {
//	$.log( 'XPO.anbaa', '', jawaab.qadr );
	var qadr = jawaab.qadr;
	
	if (!jawaab.hisaab) { jawaab.intahaa(); return; } // not signed in
	if (!qadr) { jawaab.intahaa(); return; } // received nothing

	// TODO only admins can del all, mems can edit/del self, mods can edit/del all
	var qasas = [];
	qadr.forEach(function (item) {
		if (isnum(item.uid) && isnum(item.qissah))
			qasas.push({
				uid0: parseint(item.qissah),
			});
	});
	helpers.getallbyuid(Config.database.name, tbl_qasas, qasas, function (rows) {
		if (rows.length) {
			var zaad = [], pops = [], txrt = {};
			var ct = new Date().getTime();
			qadr.forEach(function (item) {
				var m = parseint(item.qissah), mklmh = rows.get(m);
				if (isnum(item.uid) && mklmh) {
					if (mukaalamaat.is3udw(mklmh, jawaab.hisaab.uid)) {
						var o = {
							uid0:			parseint(item.uid),
							qissah0:	parseint(item.qissah),
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
						havaf:			1,
					});
				}
			});
			if (zaad.length)
			helpers.set(Config.database.name, tbl_anb, zaad, function (outcome) {
				var nataaij = [];
				outcome.rows.forEach(function (item) {
					var m = item.qissah0;
					if (!item.havaf0)
					var txr = mukaalamaat.taxeer(m, anbaa.matn2caaniyaat(item.matn0));
					txrt[ m ] = {
						uid0:			m,
						taxeer:			txr,
					};
					var o = {
						uid:		item.uid0,
						ruid:		item.ruid,
						qissah:	m,
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
					havaf:			1,
				});
			});
			jawaab.waaqat(zaad).intahaa();
		}
	});
});
