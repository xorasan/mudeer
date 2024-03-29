var Sessions, sessions,
	USERNAMEMIN = 3,
	USERNAMEMAX = 24,
	PASSWORDMIN = 8,
	PASSWORDMAX = 2048;
;(function(){
	'use strict';
	// TODO fix keyboard shows up and softkeys bottom row gets hidden
	var cache = {}, lastsearch, mfateeh, usnmavlble = {}, debug_sessions = 1;
	var go_forward;
	function setup_fields(mfateeh) {
		mfateeh.username.uponenter = function () {
			focusnext(mfateeh.username);
		};
		mfateeh.password.uponenter =
		mfateeh.answer.uponenter = function () {
			if (isfun(go_forward)) go_forward();
		};
	}
	function reset_all_forms() {
		var su = View.dom_keys('signup');
		var si = View.dom_keys('signin');
		
		su.username.value = '';
		si.username.value = '';

		su.password.value = '';
		si.password.value = '';

		su.answer.value = '';
		si.answer.value = '';
	}
	var jaddadkeys = function (parent) {
		var current = parseint(parent.dataset.currentqadam || 0);
		if (current === 0) {
			Softkeys.set(K.sr, function () {
				Hooks.run('back');
			}, 0, 'iconarrowback');
		} else {
			Softkeys.set(K.sr, function () {
				Sessions.shimaal(parent);
				return 1;
			}, 0, 'iconarrowback');
		}
		go_forward = function () {
			Sessions.yameen(parent);
			return 1;
		}
		Softkeys.set(K.sl, go_forward, 0, 'icondone');
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
			var current_view = View.get();
			if (current_view === 'signup') {
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
			if (current_view === 'signin') {
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
		if ( View.is_active('signup') ) {
			var m = View.mfateeh('signup');
			if (username) {
				innertext(m.usernamerefined, username);
			}
			innertext(m.aliasstatus, xlate(xataa));
			if (proceed) {
				m.aqdaam.dataset.currentqadam =
								xataa === 'usernameavailable' ? 1 : 0;
				Sessions.jaddad(m.aqdaam);
			}
			smartfocus(m.aqdaam);
		}
	};
	var passwordxataa = function (xataa) {
		if ( View.is_active('signin') ) {
			var m = View.dom_keys('signin');
			m.aqdaam.dataset.currentqadam = 0;
			Sessions.jaddad( m.aqdaam );
			m.password.focus();
			innertext(m.passstatus, xlate(xataa))
		}
	};
	var answerxataa = function (xataa) {
		if ( View.is_active(['signin', 'signup']) ) {
			var m = View.dom_keys( View.get() );
			Sessions.jaddad( m.aqdaam );
			Sessions.getcaptcha();
			m.answer.focus();
			innertext(m.answerstatus, xlate(xataa));
			if ( View.is_active('signin') ) {
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
	function update_sidebar() { if (get_global_object().Sidebar) {
		if (Sessions.signedin()) {
			Sidebar.remove('signin');
			Sidebar.remove('signup');
			Sidebar.set({
				uid: 'signout',
				title: xlate('signout'),
				icon: 'iconexittoapp',
				keep_open: 1,
				callback: function () {
					Hooks.run('dialog', {
						m: xlate('signoutconfirm'),
						c: function () {
							Sessions.signout();
						},
					});
				}
			});
		} else {
			Sidebar.remove('signout');
			Sidebar.set({
				uid: 'signin',
				title: xlate('signin'),
				icon: 'iconperson',
			});
			Sidebar.set({
				uid: 'signup',
				title: xlate('signup'),
				icon: 'iconpersonadd',
			});
		}
	} }
	
	Sessions = sessions = {
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
			if (debug_sessions) $.log.w( 'Sessions yameen' );
			var current = parseint(parent.dataset.currentqadam || 0), yes;
			if (mfateeh) {
				var user = generate_alias(mfateeh.username.value);
				var pass = mfateeh.password.value.trim();
				var answer = mfateeh.answer.value;
				var hash = mfateeh.hash.value;
				var current_view = View.get()
				if (current_view === 'signup') {
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
				if (current_view === 'signin') {
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
				Sessions.jaddad(parent);
				smartfocus(parent);
			}
		},
		getqadam: function (v) {
			return templates.keys( mfateeh.aqdaam.childNodes[v] );
		},
		setqadam: function (v) {
			setdata( View.dom_keys('signup').aqdaam, 'currentqadam', 0 );
			setdata( View.dom_keys('signin').aqdaam, 'currentqadam', 0 );
		},
		signedin: function () { // return session key
			return preferences.get(1);
		},
		uid: function () { // signedin account uid
			return Preferences.get(2);
		},
		get_account_uid: function () {
			return this.uid();
		},
		get_session_uid: function () {
			return Preferences.get('session_uid');
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
			Webapp.status( xlate('loggingout') );
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
				Sessions.setqadam(0);
				
				Webapp.status( xlate('loggedout') );
				Hooks.run('sessionchange', 0);

				if (Backstack.darajah)
					Backstack.back();
				else
					Hooks.run('view', 'main');
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
	Hooks.set('sessionchange', function (signedin) {
		$.log.w('Sessions', signedin ? 'signed in' : 'signed out');
		update_sidebar();
	});
	Hooks.set('ready', function (args) {
		Network.intercept('sessions', 'key', function (finish) {
			finish(sessions.signedin() || undefined);
		});
		Network.response.intercept('sessions', 'key', function (response) {
			if (response === false) {
				Sessions.signout();
			} else {
				Preferences.set('session_uid', response);
			}
		});
		Network.response.get('sessions', 'username_exists', function (response) {
			if (response.join) {
				usnmavlble['_'+response.username] = response.exists;
				usernamexataa(response.exists, response.username, response.proceed);
				Webapp.dimmer();
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
					update_sidebar();
					Webapp.status( xlate('loggedin') );
					reset_all_forms();
					
					if (Backstack.darajah)
						Backstack.back();
					else
						Hooks.run('view', 'main');
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

		Hooks.run('sessionchange', !!Sessions.signedin());

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
			Webapp.header([['signin'], '', 'iconpersonadd']);
			mfateeh = View.mfateeh('signin');
			if (mfateeh.aqdaam.dataset.currentqadam === undefined)
				mfateeh.aqdaam.dataset.currentqadam = 0;

			setup_fields(mfateeh);
			sessions.jaddad( mfateeh.aqdaam );
			sessions.getcaptcha();
			smartfocus( mfateeh.aqdaam );
			password_visibility( getattribute(mfateeh.password, 'type') == 'text' );
		}
		if (args.name == 'signup') {
			Webapp.header([['signup'], '', 'iconpersonadd']);
			mfateeh = View.mfateeh('signup');
			if (mfateeh.aqdaam.dataset.currentqadam === undefined)
				mfateeh.aqdaam.dataset.currentqadam = 0;

			setup_fields(mfateeh);
			sessions.jaddad( mfateeh.aqdaam );
			sessions.getcaptcha();
			smartfocus( mfateeh.aqdaam );
			password_visibility( getattribute(mfateeh.password, 'type') == 'text' );
		}
	});
})();
