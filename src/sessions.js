//+ signedin setqadam getqadam jaddad yameen shimaal uid
var sessions,
	USERNAMEMIN = 3,
	USERNAMEMAX = 24,
	PASSWORDMIN = 8,
	PASSWORDMAX = 2048;
;(function(){
	'use strict';
	var cache = {}, lastsearch, mfateeh, usnmavlble = {};
	
	var jaddadkeys = function (parent) {
		var current = parseint(parent.dataset.currentqadam || 0);
		if (current === 0) {
			softkeys.set(K.sr, function () {
				Hooks.run('back');
			}, 0, 'iconarrowback');
		} else {
			softkeys.set(K.sr, function () {
				sessions.shimaal(parent);
				return 1;
			}, 0, 'iconarrowback');
		}
		softkeys.set(K.sl, function () {
			sessions.yameen(parent);
			return 1;
		}, 0, 'icondone');
	};
	var setcaptcha = function () {
		if (cache && mfateeh) {
			setvalue(mfateeh.hash, cache.hash);
			innerhtml(mfateeh.captcha, cache.captcha);
		}
	};
	var smartfocus = function (parent) {
		var current = parseint(parent.dataset.currentqadam || 0);
		if (mfateeh) {
			if (backstack.states.view === 'signup') {
				if (current === 0) {
					mfateeh.username.focus();
				}
				if (current === 1) {
					mfateeh.password.focus();
				}
				if (current === 2) {
					mfateeh.answer.focus();
				}
			}
			if (backstack.states.view === 'signin') {
				if (current === 0) {
					mfateeh.username.focus();
				}
				if (current === 1) {
					mfateeh.answer.focus();
				}
			}
		}
	};
	var usernamevalid = function (user) {
		if (user.length >= USERNAMEMIN && user.length <= USERNAMEMAX) {
			innertext(mfateeh.aliasstatus, '');
			return 1;
		} else {
			if (user.length === 0) innertext(mfateeh.aliasstatus, '');
			else innertext(mfateeh.aliasstatus, xlate(
				user.length < USERNAMEMIN ? 'usernameunder' : 'usernameover'
			));
			return 0;
		}
	};
	var usernamexataa = function (xataa, username, proceed) {
		if (backstack.states.view === 'signup') {
			var m = view.mfateeh('signup');
			if (username) {
				innertext(m.usernamerefined, username);
			}
			innertext(m.aliasstatus, xlate(xataa));
			if (proceed) {
				m.aqdaam.dataset.currentqadam =
								xataa === 'usernameavailable' ? 1 : 0;
				sessions.jaddad(m.aqdaam);
			}
			smartfocus(m.aqdaam);
		}
	};
	var passwordxataa = function (xataa) {
		if (backstack.states.view === 'signin') {
			var m = view.mfateeh('signin');
			m.aqdaam.dataset.currentqadam = 0;
			sessions.jaddad( m.aqdaam );
			m.password.focus();
			innertext(m.passstatus, xlate(xataa))
		}
	};
	var answerxataa = function (xataa) {
		if (['signin', 'signup'].includes(backstack.states.view)) {
			var m = view.mfateeh(backstack.states.view);
			sessions.jaddad( m.aqdaam );
			sessions.getcaptcha();
			m.answer.focus();
			innertext(m.answerstatus, xlate(xataa));
			if (backstack.states.view == 'signin') {
				m.aqdaam.dataset.currentqadam = 1;
			} else {
				m.aqdaam.dataset.currentqadam = 2;
			}
		}
	};
	function password_visibility(yes) {
		softkeys.add({ n: yes ? 'Hide Password' : 'Show Password',
			shift: 1,
			alt: 1,
			k: 's',
			i: yes ? 'iconvisibilityoff' : 'iconvisibility',
			c: function () {
				attribute(mfateeh.password, 'type', yes ? 'password' : 'text');
				password_visibility(!yes);
			}
		});
	}
	
	sessions = {
		jaddad: function (parent) {
			jaddadkeys(parent);
			var current = parseint(parent.dataset.currentqadam || 0);
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
			var current = parseint(parent.dataset.currentqadam || 0), yes;
			if (mfateeh) {
				var user = generate_alias(mfateeh.username.value);
				var pass = mfateeh.password.value.trim();
				var answer = mfateeh.answer.value;
				var hash = mfateeh.hash.value;
				if (backstack.states.view === 'signup') {
					yes = 1;
					if (current == 0) {
						if (usernamevalid(user)) sessions.usernameexists(user);
						yes = 0;
					}
					if (current == 1) {
						if (pass.length >= PASSWORDMIN && pass.length <= PASSWORDMAX)
							innertext(mfateeh.passstatus, '');
						else
							innertext(mfateeh.passstatus, xlate(
								pass.length < PASSWORDMIN ? 'passwordunder' : 'passwordover'
							)),
							yes = 0;
					}
					if (current == 2) {
						if (answer.length)
							innertext(mfateeh.answerstatus, '');
						else
							innertext(mfateeh.answerstatus, xlate('answerblank')),
							yes = 0;

						if (yes) {
							sessions.login(user, pass, hash, answer, 1);
						}
					}
				}
				if (backstack.states.view === 'signin') {
					yes = 1;
					if (current == 0) {
						if (user.length >= USERNAMEMIN && user.length <= USERNAMEMAX)
							innertext(mfateeh.aliasstatus, '');
						else
							innertext(mfateeh.aliasstatus, xlate(
								user.length < USERNAMEMIN ? 'usernameunder' : 'usernameover'
							)),
							yes = 0;

						if (pass.length >= PASSWORDMIN && pass.length <= PASSWORDMAX)
							innertext(mfateeh.passstatus, '');
						else
							innertext(mfateeh.passstatus, xlate(
								pass.length < PASSWORDMIN ? 'passwordunder' : 'passwordover'
							)),
							yes = 0;
					}
					if (current == 1) {
						if (answer.length)
							innertext(mfateeh.answerstatus, '');
						else
							innertext(mfateeh.answerstatus, xlate('answerblank')),
							yes = 0;

						if (yes) {
							sessions.login(user, pass, hash, answer);
						}
					}
				}
			}
			if (yes && current < parent.childElementCount-1) {
				parent.dataset.currentqadam = ++current;
				sessions.jaddad(parent);
				smartfocus(parent);
			}
		},
		shimaal: function (parent) {
			var current = parseint(parent.dataset.currentqadam || 0);
			if (current > 0) {
				parent.dataset.currentqadam = --current;
				sessions.jaddad(parent);
				smartfocus(parent);
			}
		},
		getqadam: function (v) {
			return templates.keys( mfateeh.aqdaam.childNodes[v] );
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
				sessionformaway.hidden = false;
				sessionform.hidden = true;
				document.body.className = permissions;
			} else {
				sessionformaway.hidden = true;
				sessionform.hidden = false;
				document.body.className = '';
				networki.stoplistening();
			}
			
			if (statuschanged) {
				dom.applysession( appui.signedin );
				menu.setupdynamicparts();
				appui.resetloginform();
				Hooks.run('appuisessionchange', appui.signedin);
			}
		},
		getcaptcha: function () {
			var key = preferences.get(1);
			if (!key) {
				// get new captcha if there isn't already one loaded
				if (!cache.hash) {
					webapp.dimmer(LAYERTOPMOST, xlate('fetchingcaptcha'));
					Network.get('sessions', 'captcha', 1);
				} else {
					setcaptcha();
				}
			}
		},
		resetloginform: function () {
			var keys = dom.getformkeys( sessionform );

			keys.alias.value = '';
			delete keys.alias.dataset.error;

			keys.pass.value = '';
			delete keys.pass.dataset.error;

			keys.answer.value = '';
			delete keys.answer.dataset.error;

			keys.hash.value = '';

			delete document.body.dataset.listitem;
		},
		setloginform: function (data) {
			data = data || {};
			var keys = dom.getformkeys( sessionform );
			var captcha = keys.captcha;
			var hash = keys.hash;
			
			if (data.key) {
				preferences.set( 1				, data.key						); // miftaah
				preferences.set( 81				, data.latitude					); // xattil3ard
				preferences.set( 82				, data.longitude				); // xattiltool
				preferences.set( 2				, data.uid						);
				preferences.set( 20				, data.username					); // ism
				preferences.set( 21				, data.displayname				); // ismmubeen
				preferences.set( 22				, data.type						);
				
			} else {
				if (data.username === 'taken') {
					keys.aliasstatus.innerText = translate('aliasunique');
					keys.alias.dataset.error = 1;
				} else {
					keys.aliasstatus.innerText = '';
					delete keys.alias.dataset.error;
				}

				if (data.password === 'wrong') {
					keys.passstatus.innerText = translate('passwrong');
					keys.pass.dataset.error = 1;
				} else {
					keys.passstatus.innerText = '';
					delete keys.pass.dataset.error;
				}
				
				if (data.answer === 'wrong') {
					keys.answerstatus.innerText = translate('answerwrong');
					keys.answer.dataset.error = 1;
				} else {
					keys.answerstatus.innerText = '';
					delete keys.answer.dataset.error;
				}
				
				if (data.captcha) {
					captcha.hidden		= false;
					captcha.innerHTML	= data.captcha;
					hash.value			= data.hash;
				} else {
					captcha.hidden = true;
				}
			}
		},
		signout: function () {
			webapp.itlaa3( xlate('loggingout') );
			Offline.recreate(function () {
				preferences.pop( '@'); // waqt
				preferences.pop( 1	);
				preferences.pop( 2	);
				preferences.pop( 4	);
				preferences.pop( 6	);
				preferences.pop( 11	);
				preferences.pop( 20	);
				preferences.pop( 21	);

				cache = {};
				
				webapp.itlaa3( xlate('loggedout') );
				
				Hooks.run('sessionchange', 0);
				pager.intaxab('main', 1);
			});
		},
		usernameexists: function (user, temp) {
			var cached = usnmavlble['_'+user];
			if (user.length >= USERNAMEMIN && user.length <= USERNAMEMAX) {
				if (cached && temp) {
					usernamexataa(cached, user);
				} else {
					var payload = {
						username	:	user	,
						join		:	1		,
						exists		:	1		,
						proceed		:	!temp	,
					};

					if (!temp)
						webapp.dimmer(LAYERTOPMOST, xlate('checkingusername'));

					Network.get('sessions', 'username_exists', payload);
				}
			}
		},
		login: function (user, pass, hash, answer, join) {
			if (user.length > 2 && user.length < 25 && pass.length > 7 && answer.length) {
				var payload2 = {
					username	:	user	,
					password	:	pass	,
					hash		:	hash	,
					answer		:	answer	,
				};

				if (join) payload2.join = 1;
				
				webapp.dimmer( true, translate('loggingin') );
				Network.get('sessions', 'sign_in', payload2);
			}
		},
	};
	Hooks.set('ready', function (args) {
		Network.intercept('sessions', 'key', function (finish) {
			finish(sessions.signedin() || undefined);
		});
		Network.response.intercept('sessions', 'key', function (response) {
			if (response === false) {
				sessions.signout();
			}
		});
		Network.response.get('sessions', 'username_exists', function (response) {
			if (response.join) {
				usnmavlble['_'+response.username] = response.exists;
				usernamexataa(response.exists, response.username, response.proceed);
				webapp.dimmer();
			}
		});
		Network.response.get('sessions', 'captcha', function (response) {
//			$.log( 'captcha', response );
			webapp.dimmer();
			if (mfateeh) {
				cache.hash = response.hash;
				cache.captcha = response.captcha;
				setcaptcha();
			}
		});
		Network.response.get('sessions', 'key', function (response) {
//			$.log( 'key', response );
		});
		Network.response.get('sessions', 'sign_in', function (response) {
			webapp.dimmer();
			if (response.password) {
				passwordxataa(response.password);
			}
			if (response.answer) {
				answerxataa(response.answer);
			}
			if (response.key) {
				var signedin = sessions.signedin();
				preferences.set(  1 , response.key		);
				preferences.set( 81 , response.latitude	);
				preferences.set( 82 , response.longitude	);
				preferences.set(  2 , response.uid			);
				preferences.set( 20 , response.username	);
				preferences.set( 21 , response.displayname	);
				preferences.set( 22 , response.type		);
				if (!signedin) { // only do this if wasn't prev logged in
					Hooks.run('sessionchange', response.key);
					webapp.itlaa3( xlate('loggedin') );
					pager.intaxab('main', 1);
				}
			}
		});

		var active_sessions_list;
		Settings.adaaf('Sessions', 0, function () {
			open_list_sheet('Sessions', function (l) {
				active_sessions_list = l;
				Network.get('sessions', 'active', 1);
			});
		}, 'iconsettings');
		
		Network.response.get('sessions', 'active', function (response) {
			if (active_sessions_list && response && response.names) {
				active_sessions_list.title(response.names.length+' active sessions');
				response.names.forEach(function (o) {
					active_sessions_list.set({
						title: o
					});
				});
			}
		});
		
		// TODO handle session changes (you're not logged in...)
		settings.adaaf('signout', 0, function () {
			Hooks.run('dialog', {
				m: 'signoutconfirm',
				c: function () {
					sessions.signout();
				},
			});
		});
		var m = view.mfateeh('signup');
		var usnmfld = m.username;
		usnmfld.onkeyup = function () {
			var user = generate_alias(usnmfld.value);
			if (usernamevalid(user)) {
				var cached = usnmavlble['_'+user];
				if (cached === undefined)
				$.taxeer('usernametempcheck', function () {
					if (m.aqdaam.dataset.currentqadam == '0') {
						sessions.usernameexists( user, 1 );
					}
				}, 1000);
				else usernamexataa(cached, user);
			}
		};
	});
	Hooks.set('viewready', function (args) {
		if (args.name == 'sessions') {
		}
		if (args.name == 'signin') {
			webapp.header(xlate('signin'));
			mfateeh = view.mfateeh('signin');
			if (mfateeh.aqdaam.dataset.currentqadam === undefined)
				mfateeh.aqdaam.dataset.currentqadam = 0;
			sessions.jaddad( mfateeh.aqdaam );
			sessions.getcaptcha();
			smartfocus( mfateeh.aqdaam );
			password_visibility( getattribute(mfateeh.password, 'type') == 'text' );
		}
		if (args.name == 'signup') {
			webapp.header(xlate('signup'));
			mfateeh = view.mfateeh('signup');
			if (mfateeh.aqdaam.dataset.currentqadam === undefined)
				mfateeh.aqdaam.dataset.currentqadam = 0;
			sessions.jaddad( mfateeh.aqdaam );
			sessions.getcaptcha();
			smartfocus( mfateeh.aqdaam );
			password_visibility( getattribute(mfateeh.password, 'type') == 'text' );
		}
	});
})();
