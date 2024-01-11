/* manage sessions
 * 
 */
var Sessions, sessions,
	tbl_adwr = 'sessions'
	tbl_hsbt = 'accounts',
	tbl_wqti = 'temporary',
	hashalgo	= new require('./deps/easy-pbkdf2').EasyPbkdf2();

Sessions = sessions = {
	usernameisvalid: function (username) {
		var result = {
			code: false
		};

		result.username = username = generate_alias(username);
		
		if (result.username.length >= 3) {
			if (result.username.length <= 24) {
				result.code = false;
			} else {
				result.code = 'usernameover';
			}
		} else {
			result.code = 'usernameunder';
		}
		return result;
	},
	usernameexists: function (username, cb) {
		if (!isstr(username)) { $.log.e(' usernameexists expects username as string '); return; }
		if (!isfun(cb)) { $.log.e(' usernameexists needs a callback '); return; }
					
		MongoDB.query(response.extra.database, tbl_hsbt, { name: username }, function (rows) {
			cb((rows && rows.length === 1));
		});
	},
	passwordisvalid: function (password) {
		var result = {
			code: false
		};
		
		// 8 to ... chars
		if (password.length >= 8) {
			if (password.length <= 2048) {
				result.code = false;
			} else {
				result.code = 'passwordover';
			}
		} else {
			result.code = 'passwordunder';
		}
		return result;
	},
	hashpassword: function (password, callback) {
		if (typeof callback === 'function') {
			hashalgo.hash(password, function (err, hash, salt) {
				if (err) throw err;
				
				callback({
					err: err,
					salt: salt,
					hash: hash
				});
			});
		}
	},
	verifypassword: function (salt, hash, password, cb) {
		if (typeof cb !== 'function') return;
		
		hashalgo.verify(salt, hash, password, function (err, matched) {
			if (err) throw err;
			
			cb(matched);
		});
	},
	weakhash: function (value) {
		return hashalgo.weakHash(
			value
			||
			(
				$.random(0, 99999) +""+ get_time_now()
			)
		);
	},

	get_session_account: function (key, callback) {
		if (!isfun(callback)) {
			$.log.e(' get_session_account needs a callback ');
			return false;
		}
		
		if (!isstr(key)) {
			callback(false);
			return false;
		}

		// does the session exist
		MongoDB.get(Config.database.name, tbl_adwr, {
			hash:	parsestring(key),
		}, function (sessionrow) {
			// yes
			if (sessionrow) {
				// update .updated to keep session alive
				MongoDB.set(Config.database.name, tbl_adwr, [{
					uid: sessionrow.uid,
					updated: get_time_now(),
				}], function () {
					// does the linked account exist and is allowed login
					MongoDB.get(Config.database.name, tbl_hsbt, {
						uid:		sessionrow.account,
//						status:		0, // TODO
					}, function (accountrow) {
						// yes, just return true
						if (accountrow) {
							var out_result = {
								session: sessionrow,
								account: accountrow
							};
							callback(out_result);
							return out_result;
						// no, return false to force logout
						} else {
							callback(false);
							return false;
						}
					});
				});
			// no, return false to force logout
			} else {
				callback(false);
				return false;
			}
		});
	},

	sendcaptcha: function (response) {
		captcha.get(response.extra.boxdatabase, function (svg) {
			response.need('captcha')
				  .get('captcha', svg.raw)
				  .get('hash', svg.hash)
				  .finish();
		});
	},
	format: function (sessionrow, accountrow, response) {
		response.get({
			key			: sessionrow.hash		,
			uid			: accountrow.uid		,
			name		: accountrow.name		,
			displayname	: accountrow.displayname,
			latitude	: accountrow.latitude	,
			longitude	: accountrow.longitude	,
			kind		: accountrow.kind		,
		});
		sessions.account2extra(sessionrow, accountrow, response);
	},
	account2extra: function (sessionrow, accountrow, response) {
		response.extra.account = {
			sid			: sessionrow.uid			, // session uid
			key			: sessionrow.hash			, // session key
			uid			: accountrow.uid			, // unique id
			name		: accountrow.name			, // user name
			displayname	: accountrow.displayname	, // display name
			shape		: accountrow.shape			, // appearance
			shape_m		: accountrow.shape_m		, // purchased appearance
			features	: accountrow.features		, // features
			features_m	: accountrow.features_m		, // purchased features
			radius		: accountrow.radius			, // search radius
			lifestory	: accountrow.lifestory		, // life story
			kind		: accountrow.kind			, // type, rank
			possessions	: accountrow.possessions	, // possessions
			possessions_m: accountrow.possessions_m	, // purchased possessions
			birthday	: accountrow.birthday		, // birthday
			gender		: accountrow.gender			, // gender
			family		: accountrow.family			, // family
			relatives	: accountrow.relatives		, // relatives
			blocks		: accountrow.blocks			, // blocks
			friends		: accountrow.friends		, // friends
			jobs		: accountrow.jobs			, // jobs
			jobs_m		: accountrow.jobs_m			, // purchased jobs
			money		: accountrow.money			, // money
			nafaqah		: accountrow.nafaqah		, // money spent
			talab		: accountrow.talab			, // wants (TODO its own table)
			phone		: accountrow.phone			, // haatif
			status		: accountrow.status			, // haalah
			connected	: accountrow.connected		, // ittisaal
			joined		: accountrow.joined			, // post invitation (indimaam)
			latitude	: accountrow.latitude		, // xattil3ard
			longitude	: accountrow.longitude		, // xattiltool
			created		: accountrow.created		, // created when
			updated		: accountrow.updated		, // updated when
		};
	},
	set: function (database, accountrow, response, callback) {
		var key = Sessions.weakhash()+Sessions.weakhash();
		MongoDB.set(database, tbl_adwr, [{
			hash:		key,
			account:	accountrow.uid,
			updated:	get_time_now(),
		}], function (outcome) {
			sessions.format(outcome.rows[0], accountrow, response);
			
			typeof callback === 'function' && callback(response);
		}, {
			checkname: false
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
			'DELETE FROM '+tbl_adwr+' WHERE `uid` = ?',
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
			'DELETE FROM '+tbl_adwr+' WHERE `updated` '+comparisonstring+' ?',
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
			var fromtime = (get_time_now()) - ftime;
			
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

// key attached, verify & add account info
Network.favor(PRIMARY).intercept('sessions', 'key', function (response) {
	Sessions.get_session_account(response.value, function (result) {
		if (result) {
			response.intercept(result.session.uid);
			// this adds account+session info to .extra for other server modules to use
			Sessions.account2extra(result.session, result.account, response);
			response.finish();
		} else {
			response.intercept(false).finish();
		}
	});
});
// requested captcha
Network.get('sessions', 'captcha', function (response) {
	$.log( 'sessions', 'captcha' );
	sessions.sendcaptcha(response);
});
// requested sign in duxool entry sign up
Network.get('sessions', 'sign_in', function (response) {
	var creds = response.value;
	var boxdatabase = response.extra.boxdatabase;
	var database = response.extra.database;
	if (typeof creds.answer === 'string') {
		MongoDB.get(boxdatabase, tbl_wqti, {
			hash: parsestring(creds.hash),
			value: creds.answer.trim(),
		}, function (result) {
			if (result) {
				// delete temp captcha hash:answer
				MongoDB.pop(boxdatabase, tbl_wqti, result.uid);
				var username	= Sessions.usernameisvalid( creds.username );
				var password	= Sessions.passwordisvalid( creds.password );
				// errors
				if (username.code && password.code) {
					response.get('username', username.code)
						  .get('password', password.code)
						  .finish();
				// no errors
				} else {
					MongoDB.get(database, tbl_hsbt, {
						name:	username.username,
					}, function (accountrow) {
						// join
						if ( creds.join ) {
							if (accountrow) {
								response.get('username', 'usernametaken');
								sessions.sendcaptcha(response);
							} else {
								Sessions.hashpassword( creds.password, function (cryptpassword) {
									MongoDB.set(database, tbl_hsbt, [{
										name:		username.username,
										hash:		cryptpassword.hash,
										salt:		cryptpassword.salt, // mamlooh
										updated:	get_time_now(),
										status:		0,
									}], function (outcome) {
										// tie newly created account to a new session
										accountrow = outcome.rows[0];
										
										sessions.set(database, accountrow, response, function () {
											response.finish();
										});
									});
								});
							}
						}
						// login
						else { // TODO add more error codes
							if (accountrow && creds.password/* && accountrow.status === 0*/) {
								// is stored password empty
								if (accountrow.salt === '' && accountrow.hash === '' && accountrow.uid) {
//									$.log.s( 'empty pass, setting anew' );
									Sessions.hashpassword( creds.password, function (cryptpassword) {
										MongoDB.set(database, tbl_hsbt, [{
											uid:			accountrow.uid,
											hash:			cryptpassword.hash,
											salt:			cryptpassword.salt,
											updated:		get_time_now(),
										}], function (outcome) {
											$.log( outcome );
											
											// tie newly created account to a new session
											accountrow = outcome.rows[0];
											
											sessions.set(database, accountrow, response, function () {
												response.finish();
											});
										}, {
											checkname: false
										});
									});
								} else {
									Sessions.verifypassword(accountrow.salt,
														   accountrow.hash,
														   creds.password, function (matched) {
										if (matched) {
											sessions.set(database, accountrow, response, function () {
												response.finish();
											});
										} else {
											response.get('password', 'passwordwrong');
											sessions.sendcaptcha(response);
										}
									});
								}
							} else {
								response.get('password', 'passwordwrong');
								sessions.sendcaptcha(response);
							}
						}
					});
				}
			}
			else {
				response.get('answer', 'answerwrong');
				sessions.sendcaptcha(response);
			}
		});
	} else response.get(false).finish();
});
// requested sign out xurooj
Network.get('sessions', 'sign_out', function (response) {
	response.get(true).finish();
});
// username exists ? mowjood
Network.get('sessions', 'username_exists', function (response) {
	var creds = response.value,
		database = response.extra.database;

	if (creds.exists && creds.join) {
		var username = Sessions.usernameisvalid( creds.username );
		response.get('proceed', creds.proceed)
			  .get('join', 1)
			  .get('username', username.username);

		// errors
		if (username.code) {
			response.get('exists', username.code)
				  .finish();
		// no errors
		} else {
			MongoDB.get(database, tbl_hsbt, {
				name:	username.username,
			}, function (accountrow) {
				response.get('exists', accountrow ? 'usernametaken' : 'usernameavailable')
					  .finish();
			});
		}
	} else response.finish();
});
Network.get('sessions', 'active', function (response) {
	var database = response.extra.database;
	MongoDB.query(database, tbl_adwr, {}, function (result) {
		var names = [];
		result.rows.forEach(function (o) {
			names.push(o.uid+' '+o.account);
		});
		response.get('names', names)
				.finish();
	});
});
Web.add(function (done, queue, extra) {
	done(queue, extra);
	return;
	var payload 	= extra.payload,
		obj			= extra.obj,
		boxdatabase	= extra.boxdatabase,
		database	= extra.database,
		account		= {};
	
	// already logged in
	if (payload.key) {
	}
	else if ( payload.get && payload.get.sessions ) {
		var creds = payload.get.sessions;
		obj.sessions = account;
		
		// no payload??
//		else done(queue, extra);
	}
	else
		done(queue, extra);
});

