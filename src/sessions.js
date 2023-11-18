//+ signedin setqadam getqadam jaddad yameen shimaal uid
var sessions,
	USERNAMEMIN = 3,
	USERNAMEMAX = 24,
	PASSWORDMIN = 8,
	PASSWORDMAX = 64;
;(function(){
	'use strict';
	var cache = {}, lastsearch, mfateeh, usnmavlble = {};
	
	var nazzaf = function (string, length) {
		string = string || '';
		if (string.length === 0) return '';
		length = length || 255;
		var alias = string;
		alias = alias.substr(0, length)
					.replace(/\%/g,			' pct'	)
					.replace(/\@/g,			' at '	)
					.replace(/\&/g,			' and '	)
					.replace(/[$-\-/:-?\{\}-~!"^_`\[\]@#]/g,'-') // symbols
					.replace(/[^.\d\wa-zA-Z0-9ا-ےÄäÜüÖößЀ-ҁҊ-ӿÇçĞğŞşIıÜüﻙ]+/g, '-') // most alphanums
					.replace(/\s[\s]+/g,	'-'	)
					.replace(/[\s]+/g,		'-'	)
					.replace(/^[\-]+/g,		''	)
					.replace(/[\-]+$/g,		''	)
					.replace(/\-\-/g,		'-'	)
					.replace(/\.\-/g,		'.'	)
					.replace(/\-\./g,		'.'	)
					.replace(/^\./g,		''	)
					.replace(/\.$/g,		''	)
					.trim()
					.toLowerCase();
		return alias;
	};
	var jaddadkeys = function (parent) {
		var current = parseint(parent.dataset.XPO.currentqadam || 0);
		if (current === 0) {
			softkeys.set(K.sr, function () {
				Hooks.run('XPO.back');
			}, 0, 'XPO.iconarrowback');
		} else {
			softkeys.set(K.sr, function () {
				sessions.shimaal(parent);
				return 1;
			}, 0, 'XPO.iconarrowback');
		}
		softkeys.set(K.sl, function () {
			sessions.yameen(parent);
			return 1;
		}, 0, 'XPO.icondone');
	};
	var setcaptcha = function () {
		if (cache && mfateeh) {
			setvalue(mfateeh.XPO.hash, cache.XPO.hash);
			innerhtml(mfateeh.XPO.captcha, cache.XPO.captcha);
		}
	};
	var smartfocus = function (parent) {
		var current = parseint(parent.dataset.XPO.currentqadam || 0);
		if (mfateeh) {
			if (backstack.states.view === 'XPO.signup') {
				if (current === 0) {
					mfateeh.XPO.username.focus();
				}
				if (current === 1) {
					mfateeh.XPO.password.focus();
				}
				if (current === 2) {
					mfateeh.XPO.answer.focus();
				}
			}
			if (backstack.states.view === 'XPO.signin') {
				if (current === 0) {
					mfateeh.XPO.username.focus();
				}
				if (current === 1) {
					mfateeh.XPO.answer.focus();
				}
			}
		}
	};
	var usernamevalid = function (user) {
		if (user.length >= USERNAMEMIN && user.length <= USERNAMEMAX) {
			innertext(mfateeh.XPO.aliasstatus, '');
			return 1;
		} else {
			if (user.length === 0) innertext(mfateeh.XPO.aliasstatus, '');
			else innertext(mfateeh.XPO.aliasstatus, xlate(
				user.length < USERNAMEMIN ? 'XPO.usernameunder' : 'XPO.usernameover'
			));
			return 0;
		}
	};
	var usernamexataa = function (xataa, username, proceed) {
		if (backstack.states.view === 'XPO.signup') {
			var m = view.mfateeh('XPO.signup');
			if (username) {
				innertext(m.XPO.usernamerefined, username);
			}
			innertext(m.XPO.aliasstatus, xlate(xataa));
			if (proceed) {
				m.XPO.aqdaam.dataset.XPO.currentqadam =
								xataa === 'XPO.usernameavailable' ? 1 : 0;
				sessions.jaddad(m.XPO.aqdaam);
			}
			smartfocus(m.XPO.aqdaam);
		}
	};
	var passwordxataa = function (xataa) {
		if (backstack.states.view === 'XPO.signin') {
			var m = view.mfateeh('XPO.signin');
			m.XPO.aqdaam.dataset.XPO.currentqadam = 0;
			sessions.jaddad( m.XPO.aqdaam );
			m.XPO.password.focus();
			innertext(m.XPO.passstatus, xlate(xataa))
		}
	};
	var answerxataa = function (xataa) {
		if (['XPO.signin', 'XPO.signup'].includes(backstack.states.view)) {
			var m = view.mfateeh(backstack.states.view);
			sessions.jaddad( m.XPO.aqdaam );
			sessions.getcaptcha();
			m.XPO.answer.focus();
			innertext(m.XPO.answerstatus, xlate(xataa));
			if (backstack.states.view == 'XPO.signin') {
				m.XPO.aqdaam.dataset.XPO.currentqadam = 1;
			} else {
				m.XPO.aqdaam.dataset.XPO.currentqadam = 2;
			}
		}
	};
	
	sessions = {
		jaddad: function (parent) {
			jaddadkeys(parent);
			var current = parseint(parent.dataset.XPO.currentqadam || 0);
			var cn = parent.children, element = false;
			for (var i = 0; i < cn.length; ++i) {
				var e = cn[i];
				if (i === current) {
					element = e;
					e.hidden = 0
				} else {
					e.hidden = 1;
				}
			}
			return element;
		},
		yameen: function (parent) {
			var current = parseint(parent.dataset.XPO.currentqadam || 0), yes;
			if (mfateeh) {
				var user = nazzaf(mfateeh.XPO.username.value);
				var pass = mfateeh.XPO.password.value.trim();
				var answer = mfateeh.XPO.answer.value;
				var hash = mfateeh.XPO.hash.value;
				if (backstack.states.view === 'XPO.signup') {
					yes = 1;
					if (current == 0) {
						if (usernamevalid(user)) sessions.usernameexists(user);
						yes = 0;
					}
					if (current == 1) {
						if (pass.length >= PASSWORDMIN && pass.length <= PASSWORDMAX)
							innertext(mfateeh.XPO.passstatus, '');
						else
							innertext(mfateeh.XPO.passstatus, xlate(
								pass.length < PASSWORDMIN ? 'XPO.passwordunder' : 'XPO.passwordover'
							)),
							yes = 0;
					}
					if (current == 2) {
						if (answer.length)
							innertext(mfateeh.XPO.answerstatus, '');
						else
							innertext(mfateeh.XPO.answerstatus, xlate('XPO.answerblank')),
							yes = 0;

						if (yes) {
							sessions.login(user, pass, hash, answer, 1);
						}
					}
				}
				if (backstack.states.view === 'XPO.signin') {
					yes = 1;
					if (current == 0) {
						if (user.length >= USERNAMEMIN && user.length <= USERNAMEMAX)
							innertext(mfateeh.XPO.aliasstatus, '');
						else
							innertext(mfateeh.XPO.aliasstatus, xlate(
								user.length < USERNAMEMIN ? 'XPO.usernameunder' : 'XPO.usernameover'
							)),
							yes = 0;

						if (pass.length >= PASSWORDMIN && pass.length <= PASSWORDMAX)
							innertext(mfateeh.XPO.passstatus, '');
						else
							innertext(mfateeh.XPO.passstatus, xlate(
								pass.length < PASSWORDMIN ? 'XPO.passwordunder' : 'XPO.passwordover'
							)),
							yes = 0;
					}
					if (current == 1) {
						if (answer.length)
							innertext(mfateeh.XPO.answerstatus, '');
						else
							innertext(mfateeh.XPO.answerstatus, xlate('XPO.answerblank')),
							yes = 0;

						if (yes) {
							sessions.login(user, pass, hash, answer);
						}
					}
				}
			}
			if (yes && current < parent.childElementCount-1) {
				parent.dataset.XPO.currentqadam = ++current;
				sessions.jaddad(parent);
				smartfocus(parent);
			}
		},
		shimaal: function (parent) {
			var current = parseint(parent.dataset.XPO.currentqadam || 0);
			if (current > 0) {
				parent.dataset.XPO.currentqadam = --current;
				sessions.jaddad(parent);
				smartfocus(parent);
			}
		},
		getqadam: function (v) {
			return templates.keys( mfateeh.XPO.aqdaam.childNodes[v] );
		},
		setqadam: function (v) {
			currentqadam = v;
			return templates.keys( sessions.jaddad() );
		},
		signedin: function () { // return session key
			return preferences.get(1);
		},
		uid: function () { // signedin uid
			return preferences.get(2, 1);
		},
		get: function (uri, dry) {
			// indicates don't do anything on history pop events
			if (backstack.locked)
				return;

			uri = appui.cleanupuri( uri );
			
			// for shallow changes, only close the popups, dialogs, menus...
			if ( appui.lasturi === uri ) {
				appui.closeall();
				return;
			}

			var crumbs = appui.crumbify(uri);

			
			if (!dry) {
//				$.log.s( 'appui.get', uri);

//				if (appui.mainstandalone) {
//					backstack.reconstruct( crumbs, appui.setchanges );
//				} else {
					backstack.pushstate('/'+uri);
					appui.setchanges( crumbs );
//				}
			} else
				appui.setchanges( crumbs );
			
			appui.lasturi = uri;
		},
		/*
		 * this updates the UI, hides or shows elements etc
		 * */
		setsession: function () {
			var statuschanged = false;
			
			var key			= preferences.get(1);
			var uid			= '';
			var username	= '';
			var displayname	= '';
			var permissions	= '';
			
			if (key && appui.signedin !== true)
				statuschanged = true;
			else if (!key && appui.signedin === false)
				statuschanged = true;
			
			appui.signedin = false;
			if (key) {
				appui.signedin = true;

				uid			= preferences.get(	2				);
				username	= preferences.get(	20				);
				displayname	= preferences.get(	21				);
				permissions	= preferences.get(	11				);
			}

			if (appui.signedin) {
				XPO.sessionformaway.hidden = false;
				XPO.sessionform.hidden = true;
				document.body.className = permissions;
			} else {
				XPO.sessionformaway.hidden = true;
				XPO.sessionform.hidden = false;
				document.body.className = '';
				networki.stoplistening();
			}
			
			if (statuschanged) {
				dom.applysession( appui.signedin );
				menu.setupdynamicparts();
				appui.resetloginform();
				Hooks.run('XPO.appuisessionchange', appui.signedin);
			}
		},
		getcaptcha: function () {
			var key = preferences.get(1);
			if (!key) {
				// get new captcha if there isn't already one loaded
				if (!cache.XPO.hash) {
					webapp.dimmer(LAYERTOPMOST, xlate('XPO.fetchingcaptcha'));
					Network.get('XPO.sessions', 'XPO.captcha', 1);
				} else {
					setcaptcha();
				}
			}
		},
		resetloginform: function () {
			var keys = dom.getformkeys( XPO.sessionform );

			keys.XPO.alias.value = '';
			delete keys.XPO.alias.dataset.XPO.error;

			keys.XPO.pass.value = '';
			delete keys.XPO.pass.dataset.XPO.error;

			keys.XPO.answer.value = '';
			delete keys.XPO.answer.dataset.XPO.error;

			keys.XPO.hash.value = '';

			delete document.body.dataset.XPO.listitem;
		},
		setloginform: function (data) {
			data = data || {};
			var keys = dom.getformkeys( XPO.sessionform );
			var captcha = keys.XPO.captcha;
			var hash = keys.XPO.hash;
			
			if (data.XPO.key) {
				preferences.set( 1				, data.XPO.key						); // miftaah
				preferences.set( 81				, data.XPO.latitude					); // xattil3ard
				preferences.set( 82				, data.XPO.longitude				); // xattiltool
				preferences.set( 2				, data.XPO.uid						);
				preferences.set( 20				, data.XPO.username					); // ism
				preferences.set( 21				, data.XPO.displayname				); // ismmubeen
				preferences.set( 22				, data.XPO.type						);
				
			} else {
				if (data.XPO.username === 'XPO.taken') {
					keys.XPO.aliasstatus.innerText = translate('XPO.aliasunique');
					keys.XPO.alias.dataset.XPO.error = 1;
				} else {
					keys.XPO.aliasstatus.innerText = '';
					delete keys.XPO.alias.dataset.XPO.error;
				}

				if (data.XPO.password === 'XPO.wrong') {
					keys.XPO.passstatus.innerText = translate('XPO.passwrong');
					keys.XPO.pass.dataset.XPO.error = 1;
				} else {
					keys.XPO.passstatus.innerText = '';
					delete keys.XPO.pass.dataset.XPO.error;
				}
				
				if (data.XPO.answer === 'XPO.wrong') {
					keys.XPO.answerstatus.innerText = translate('XPO.answerwrong');
					keys.XPO.answer.dataset.XPO.error = 1;
				} else {
					keys.XPO.answerstatus.innerText = '';
					delete keys.XPO.answer.dataset.XPO.error;
				}
				
				if (data.XPO.captcha) {
					captcha.hidden		= false;
					captcha.innerHTML	= data.XPO.captcha;
					hash.value			= data.XPO.hash;
				} else {
					captcha.hidden = true;
				}
			}
		},
		signout: function () {
			webapp.itlaa3( xlate('XPO.loggingout') );
			maxzan.recreate(function () {
				preferences.pop( '@'); // waqt
				preferences.pop( 1	);
				preferences.pop( 2	);
				preferences.pop( 4	);
				preferences.pop( 6	);
				preferences.pop( 11	);
				preferences.pop( 20	);
				preferences.pop( 21	);

				cache = {};
				
				webapp.itlaa3( xlate('XPO.loggedout') );
				
				Hooks.run('XPO.sessionchange', 0);
				pager.intaxab('XPO.main', 1);
			});
		},
		usernameexists: function (user, temp) {
			var cached = usnmavlble['_'+user];
			if (user.length >= USERNAMEMIN && user.length <= USERNAMEMAX) {
				if (cached && temp) {
					usernamexataa(cached, user);
				} else {
					var payload = {
						XPO.username	:	user	,
						XPO.join		:	1		,
						XPO.exists		:	1		,
						XPO.proceed		:	!temp	,
					};

					if (!temp)
						webapp.dimmer(LAYERTOPMOST, xlate('XPO.checkingusername'));

					Network.get('XPO.sessions', 'XPO.mowjood', payload);
				}
			}
		},
		login: function (user, pass, hash, answer, join) {
			if (user.length > 2 && user.length < 25 && pass.length > 7 && answer.length) {
				var payload2 = {
					XPO.username	:	user	,
					XPO.password	:	pass	,
					XPO.hash		:	hash	,
					XPO.answer		:	answer	,
				};

				if (join) payload2.XPO.join = 1;
				
				webapp.dimmer( true, translate('XPO.loggingin') );
				Network.get('XPO.sessions', 'XPO.duxool', payload2);
			}
		},
	};
	Hooks.set('XPO.ready', function (args) {
		Network.tawassat('XPO.sessions', 'XPO.miftaah', function (intahaa) {
			intahaa(sessions.signedin() || undefined);
		});
		Network.response.tawassat('XPO.sessions', 'XPO.miftaah', function (response) {
			if (response === false) {
				sessions.signout();
			}
		});
		Network.response.get('XPO.sessions', 'XPO.mowjood', function (response) {
			if (response.XPO.join) {
				usnmavlble['_'+response.XPO.username] = response.XPO.exists;
				usernamexataa(response.XPO.exists, response.XPO.username, response.XPO.proceed);
				webapp.dimmer();
			}
		});
		Network.response.get('XPO.sessions', 'XPO.captcha', function (response) {
//			$.log( 'XPO.captcha', response );
			webapp.dimmer();
			if (mfateeh) {
				cache.XPO.hash = response.XPO.hash;
				cache.XPO.captcha = response.XPO.captcha;
				setcaptcha();
			}
		});
		Network.response.get('XPO.sessions', 'XPO.miftaah', function (response) {
//			$.log( 'XPO.miftaah', response );
		});
		Network.response.get('XPO.sessions', 'XPO.duxool', function (response) {
			webapp.dimmer();
			if (response.XPO.password) {
				passwordxataa(response.XPO.password);
			}
			if (response.XPO.answer) {
				answerxataa(response.XPO.answer);
			}
			if (response.XPO.miftaah) {
				var signedin = sessions.signedin();
				preferences.set(  1 , response.XPO.miftaah		);
				preferences.set( 81 , response.XPO.latitude	);
				preferences.set( 82 , response.XPO.longitude	);
				preferences.set(  2 , response.XPO.uid			);
				preferences.set( 20 , response.XPO.username	);
				preferences.set( 21 , response.XPO.displayname	);
				preferences.set( 22 , response.XPO.type		);
				if (!signedin) { // only do this if wasn't prev logged in
					Hooks.run('XPO.sessionchange', response.XPO.miftaah);
					webapp.itlaa3( xlate('XPO.loggedin') );
					pager.intaxab('XPO.main', 1);
				}
			}
		});
		
		// TODO handle session changes (you're not logged in...)
		settings.adaaf('XPO.signout', 0, function () {
			Hooks.run('XPO.dialog', {
				m: 'XPO.signoutconfirm',
				c: function () {
					sessions.signout();
				},
			});
		});
		var m = view.mfateeh('XPO.signup');
		var usnmfld = m.XPO.username;
		usnmfld.onkeyup = function () {
			var user = nazzaf(usnmfld.XPO.value);
			if (usernamevalid(user)) {
				var cached = usnmavlble['_'+user];
				if (cached === undefined)
				$.taxeer('XPO.usernametempcheck', function () {
					if (m.XPO.aqdaam.dataset.XPO.currentqadam == '0') {
						sessions.usernameexists( user, 1 );
					}
				}, 1000);
				else usernamexataa(cached, user);
			}
		};
	});
	Hooks.set('XPO.viewready', function (args) {
		if (args.XPO.name == 'XPO.sessions') {
		}
		if (args.XPO.name == 'XPO.signin') {
			webapp.header(xlate('XPO.signin'));
			mfateeh = view.mfateeh('XPO.signin');
			if (mfateeh.XPO.aqdaam.dataset.XPO.currentqadam === undefined)
				mfateeh.XPO.aqdaam.dataset.XPO.currentqadam = 0;
			sessions.jaddad( mfateeh.XPO.aqdaam );
			sessions.getcaptcha();
			smartfocus( mfateeh.XPO.aqdaam );
		}
		if (args.XPO.name == 'XPO.signup') {
			webapp.header(xlate('XPO.signup'));
			mfateeh = view.mfateeh('XPO.signup');
			if (mfateeh.XPO.aqdaam.dataset.XPO.currentqadam === undefined)
				mfateeh.XPO.aqdaam.dataset.XPO.currentqadam = 0;
			sessions.jaddad( mfateeh.XPO.aqdaam );
			sessions.getcaptcha();
			smartfocus( mfateeh.XPO.aqdaam );
		}
	});
})();
