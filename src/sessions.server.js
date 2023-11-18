/*
 * manage sessions
 * 
 */
//+ hisaab miftaah hasheesh
var sessions,
	tbl_adwr = 'sessions0'
	tbl_hsbt = 'accounts0',
	tbl_wqti = 'temporary0';

sessions = {
	sendcaptcha: function (response) {
		captcha.get(response.extra.boxdatabase, function (svg) {
			response.haajah('XPO.captcha')
				  .axav('XPO.captcha', svg.raw)
				  .axav('XPO.hash', svg.hash)
				  .intahaa();
		});
	},
	format: function (sessionrow, accountrow, response) {
		response.axav({
			XPO.miftaah		: sessionrow.hasheesh0	,
			XPO.uid			: accountrow.uid0		,
			XPO.ism			: accountrow.ism0		,
			XPO.ismmubeen	: accountrow.ismmubeen0	,
			XPO.xattil3ard	: accountrow.xattil3ard0,
			XPO.xattiltool	: accountrow.xattiltool0,
			XPO.sinf		: accountrow.sinf0		,
		});
		sessions.hisaab2extra(sessionrow, accountrow, response);
	},
	hisaab2extra: function (sessionrow, accountrow, response) {
		response.extra.hisaab = {
			XPO.sid			: sessionrow.uid0			, // session uid
			XPO.miftaah		: sessionrow.hasheesh0		, // session key
			XPO.uid			: accountrow.uid0			, // unique id
			XPO.ism			: accountrow.ism0			, // user name
			XPO.ismmubeen	: accountrow.ismmubeen0		, // display name
			XPO.shakl		: accountrow.shakl0			, // appearance
			XPO.shakl_m		: accountrow.shakl_m0		, // purchased appearance
			XPO.xsoosyat	: accountrow.xsoosyat0		, // features
			XPO.xsoosyat_m	: accountrow.xsoosyat_m0	, // purchased features
			XPO.raddaas		: accountrow.raddaas0		, // search radius
			XPO.hikaayah	: accountrow.hikaayah0		, // life story
			XPO.sinf		: accountrow.sinf0			, // type, rank
			XPO.milk		: accountrow.milk0			, // possessions
			XPO.milk_m		: accountrow.milk_m0		, // purchased possessions
			XPO.mowlood		: accountrow.mowlood0		, // birthday
			XPO.jins		: accountrow.jins0			, // gender
			XPO.haram		: accountrow.haram0			, // family
			XPO.aqrabaa		: accountrow.aqrabaa0		, // relatives
			XPO.masaa3ib	: accountrow.masaa3ib0		, // blocks
			XPO.asdiqaa		: accountrow.asdiqaa0		, // friends
			XPO.wazaaif		: accountrow.wazaaif0		, // jobs
			XPO.wazaaif_m	: accountrow.wazaaif_m0		, // purchased jobs
			XPO.naqd		: accountrow.naqd0			, // money
			XPO.nafaqah		: accountrow.nafaqah0		, // money spent
			XPO.talab		: accountrow.talab0			, // wants (TODO its own table)
			XPO.haatif		: accountrow.haatif0		, // phone
			XPO.haalah		: accountrow.haalah0		, // status
			XPO.ittisaal	: accountrow.ittisaal0		, // connected when
			XPO.indimaam	: accountrow.indimaam0		, // joined when (after invitation)
			XPO.xattil3ard	: accountrow.xattil3ard0	, // latitude
			XPO.xattiltool	: accountrow.xattiltool0	, // longitude
			XPO.created		: accountrow.created0		, // created when
			XPO.updated		: accountrow.updated0		, // updated when
		};
	},
	set: function (database, accountrow, response, callback) {
		var key = helpers.weakhash()+helpers.weakhash();
		helpers.set(database, tbl_adwr, [{
			hasheesh0:		key,
			account0:		accountrow.uid0,
			_created0:		new Date().getTime(),
			updated0:		new Date().getTime(),
		}], function (outcome) {
			sessions.format(outcome.rows[0], accountrow, response);
			
			typeof callback === 'function' && callback(response);
		}, {
			checkism: false
		});
	},
	getall: function (options, cb) {
		if (typeof cb !== 'function') return;
		
		var sql = 'SELECT * FROM '+tbl_adwr+' ORDER BY `updated` DESC;';
		$('data').query(sql, function (rows) {
			cb(rows);
		});
	},
	pop: function (options, cb) {
		if (typeof cb !== 'function') return;
		if (options.uid < 1) return;
		
		var sql = [
			'DELETE FROM '+tbl_adwr+' WHERE `uid0` = ?',
			[options.uid]
		];
		$('data').query(sql, function (result) {
			cb(result);
		});
	},
	popbytime: function (options, cb) {
		if (typeof cb !== 'function') return;
		if (options.updated < 1) return;
		
		var comparisonstring = '<=';
		if (options.after === true || options.before === false) comparisonstring = '>=';
		
		var sql = [
			'DELETE FROM '+tbl_adwr+' WHERE `updated0` '+comparisonstring+' ?',
			[options.updated]
		];
		$('data').query(sql, function (result) {
			cb(result);
		});
	},
	/*
	 * time in seconds, default 1 month
	 * every this many seconds, default 6 minutes
	 */
	schedpop: function (time, every) {
		var ftime = time || (60 * 60 * 24 * 30);
		ftime = ftime * 1000;

		var fevery = every || 360;
		fevery = fevery * 1000;
		
		clearTimeout(sessions._schedpopto);
		sessions._schedpopto = setTimeout(function () {
			var fromtime = (new Date().getTime()) - ftime;
			
			$.log('popping session entries');
			sessions.popbytime({updated: fromtime}, function () {
			});
			sessions.schedpop(time, every);
		}, fevery);
	},
	stopschedpop: function () {
		clearTimeout(sessions._schedpopto);
	}
};

// miftaah attached, verify & add hisaab info
Network.favor(PRIMARY).intercession('XPO.sessions', 'XPO.miftaah', function (response) {
	var database = response.extra.database;

	if (!isstr(response.qadr)) {
		response.intercession(false).intahaa();
		return;
	}

	// does the session exist
	helpers.get(database, tbl_adwr, {
		hasheesh0:	parsestring(response.qadr),
	}, function (sessionrow) {
		// yes
		if (sessionrow) {
			// update .updated to keep session alive
			helpers.set(database, tbl_adwr, [{
				uid0: sessionrow.uid0,
				updated0: new Date().getTime(),
			}], function () {
				// does the linked account exist and is allowed login
				helpers.get(database, tbl_hsbt, {
					uid0:		sessionrow.account0,
					haalah0:	0,
				}, function (accountrow) {
					// yes, just return true
					if (accountrow) {
						response.intercession(true);
						sessions.hisaab2extra(sessionrow, accountrow, response);
					// no, return false to force logout
					} else
						response.intercession(false);

					response.intahaa();
				});
			}, {
				checkism: false
			});
		// no, return false to force logout
		} else {
			response.intercession(false);
			response.intahaa();
		}
	});
});
// requested captcha
Network.axav('XPO.sessions', 'XPO.captcha', function (response) {
	$.log( 'sessions', 'captcha' );
	sessions.sendcaptcha(response);
});
// requested sign in
Network.axav('XPO.sessions', 'XPO.duxool', function (response) {
	var creds = response.qadr;
	var boxdatabase = response.extra.boxdatabase;
	var database = response.extra.database;
	if (typeof creds.XPO.answer === 'string') {
		helpers.get(boxdatabase, tbl_wqti, {
			hasheesh0: parsestring(creds.XPO.hash),
			qadr0: creds.XPO.answer.trim(),
		}, function (result) {
			if (result) {
				// delete temp captcha hash:answer
				helpers.pop(boxdatabase, tbl_wqti, result.uid0);
				var username	= helpers.usernameisvalid( creds.XPO.username );
				var password	= helpers.passwordisvalid( creds.XPO.password );
				// errors
				if (username.code && password.code) {
					response.axav('XPO.username', username.code)
						  .axav('XPO.password', password.code)
						  .intahaa();
				// no errors
				} else {
					helpers.get(database, tbl_hsbt, {
						ism0:	username.username,
					}, function (accountrow) {
						// join
						if ( creds.XPO.join ) {
							if (accountrow) {
								response.axav('XPO.username', 'XPO.usernametaken');
								sessions.sendcaptcha(response);
							} else {
								helpers.hashpassword( creds.XPO.password, function (cryptpassword) {
									helpers.set(database, tbl_hsbt, [{
										ism0:			username.username,
										hasheesh0:		cryptpassword.hash,
										mamlooh0:		cryptpassword.salt,
										_created0:		new Date().getTime(),
										updated0:		new Date().getTime(),
									}], function (outcome) {
										// tie newly created account to a new session
										accountrow = outcome.rows[0];
										
										sessions.set(database, accountrow, response, function () {
											response.intahaa();
										});
									});
								});
							}
						}
						// login
						else {
							if (accountrow && creds.XPO.password && accountrow.haalah0 === 0) {
								// is stored password empty
								if (accountrow.mamlooh0 === '' && accountrow.hasheesh0 === '' && accountrow.uid0) {
//									$.log.s( 'empty pass, setting anew' );
									helpers.hashpassword( creds.XPO.password, function (cryptpassword) {
										helpers.set(database, tbl_hsbt, [{
											uid0:			accountrow.uid0,
											hasheesh0:		cryptpassword.hash,
											mamlooh0:		cryptpassword.salt,
											updated0:		new Date().getTime(),
										}], function (outcome) {
											$.log( outcome );
											
											// tie newly created account to a new session
											accountrow = outcome.rows[0];
											
											sessions.set(database, accountrow, response, function () {
												response.intahaa();
											});
										}, {
											checkism: false
										});
									});
								} else {
									helpers.verifypassword(accountrow.mamlooh0,
														   accountrow.hasheesh0,
														   creds.XPO.password, function (matched) {
										if (matched) {
											sessions.set(database, accountrow, response, function () {
												response.intahaa();
											});
										} else {
											response.axav('XPO.password', 'XPO.passwordwrong');
											sessions.sendcaptcha(response);
										}
									});
								}
							} else {
								response.axav('XPO.password', 'XPO.passwordwrong');
								sessions.sendcaptcha(response);
							}
						}
					});
				}
			}
			else {
				response.axav('XPO.answer', 'XPO.answerwrong');
				sessions.sendcaptcha(response);
			}
		});
	} else response.axav(false).intahaa();
});
// requested sign out
Network.axav('XPO.sessions', 'XPO.xurooj', function (response) {
	response.axav(true).intahaa();
});
// username exists ?
Network.axav('XPO.sessions', 'XPO.mowjood', function (response) {
	var creds = response.qadr,
		database = response.extra.database;

	if (creds.XPO.exists && creds.XPO.join) {
		var username = helpers.usernameisvalid( creds.XPO.username );
		response.axav('XPO.proceed', creds.XPO.proceed)
			  .axav('XPO.join', 1)
			  .axav('XPO.username', username.username);

		// errors
		if (username.code) {
			response.axav('XPO.exists', username.code)
				  .intahaa();
		// no errors
		} else {
			helpers.get(database, tbl_hsbt, {
				ism0:	username.username,
			}, function (accountrow) {
				response.axav('XPO.exists', accountrow ? 'XPO.usernametaken' : 'XPO.usernameavailable')
					  .intahaa();
			});
		}
	} else response.intahaa();
});
Web.adaaf(function (done, queue, extra) {
	done(queue, extra);
	return;
	var payload 	= extra.payload,
		obj			= extra.obj,
		boxdatabase	= extra.boxdatabase,
		database	= extra.database,
		account		= {};
	
	// already logged in
	if (payload.XPO.key) {
	}
	else if ( payload.XPO.axav && payload.XPO.axav.XPO.sessions ) {
		var creds = payload.XPO.axav.XPO.sessions;
		obj.XPO.sessions = account;
		
		// no payload??
//		else done(queue, extra);
	}
	else
		done(queue, extra);
});

