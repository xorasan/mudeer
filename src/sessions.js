var Sessions, sessions,
	USERNAMEMIN = 3,
	USERNAMEMAX = 24,
	PASSWORDMIN = 8,
	PASSWORDMAX = 2048;
;(function(){
	'use strict';
	var Sidebar = get_global_object().Sidebar;
	var cache = {}, lastsearch, mfateeh, usnmavlble = {}, debug_sessions = 0;
	var go_forward, login_state = {}, join_state = {};
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
	function update_softkeys() {
		Softkeys.add({ k: K.sr,
			c: function () {
				Hooks.run('back');
			},
			i: 'iconarrowback'
		});
		Softkeys.add({ n: 'Done',
			k: K.sl,
			c: function () {
				Sessions.go_forward(parent);
				return 1;
			},
			i: 'icondone'
		});
	};
	var setcaptcha = function () {
		if (cache && mfateeh) {
			setvalue(mfateeh.hash, cache.hash);
			innerhtml(mfateeh.captcha, cache.captcha);
		}
	};
	var smartfocus = function (parent) { if (mfateeh) {
		var current_view = View.get();
		if (current_view === 'signup') {
			if (!join_state.username) {
				mfateeh.username.focus();
			} else if (!join_state.password) {
				mfateeh.password.focus();
			} else if (!join_state.answer) {
				mfateeh.answer.focus();
			}
		}
		if (current_view === 'signin') {
			if (!login_state.username) {
				mfateeh.username.focus();
			} else if (!login_state.password) {
				mfateeh.password.focus();
			} else if (!login_state.answer) {
				mfateeh.answer.focus();
			}
		}
	} };
	var usernamevalid = function (user) {
		if (user.length >= USERNAMEMIN && user.length <= USERNAMEMAX) {
			innertext(mfateeh.aliasstatus, '');
			izhar(mfateeh.usernamewillbe);
			return 1;
		} else {
			if (user.length === 0) innertext(mfateeh.aliasstatus, '');
			else innertext(mfateeh.aliasstatus, xlate(
				user.length < USERNAMEMIN ? 'usernameunder' : 'usernameover'
			));
			ixtaf(mfateeh.usernamewillbe);
			return 0;
		}
	};
	var usernamexataa = function (xataa, username, proceed) { if ( View.is_active('signup') ) {
		var m = View.dom_keys('signup');
		izhar(mfateeh.usernamewillbe);
		innertext(m.usernamerefined, username ? username : '...');
		innertext(m.aliasstatus, xlate(xataa));
		$.log( xataa, proceed );
		join_state.username = xataa == 'usernameavailable' ? 1 : 0;
		if (proceed) {
			update_softkeys();
		}
	} };
	var passwordxataa = function (xataa) { if ( View.is_active('signin') ) {
		var m = View.dom_keys('signin');
		m.aqdaam.dataset.currentqadam = 0;
		update_softkeys();
		m.password.focus();
		innertext(m.passstatus, xlate(xataa))
	} };
	var answerxataa = function (xataa) { if ( View.is_active(['signin', 'signup']) ) {
		var m = View.dom_keys( View.get() );
		update_softkeys();
		Sessions.getcaptcha();
		m.answer.focus();
		innertext(m.answerstatus, xlate(xataa));
		if ( View.is_active('signin') ) {
			login_state.answer = xataa == 'answerwrong' ? 0 : 1;
		} else {
			join_state.answer = xataa == 'answerwrong' ? 0 : 1;
		}
	} };
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
	function update_sidebar() { if (Sidebar) {
		if (Sessions.signedin()) {
			Sidebar.hide_item('signin' );
			Sidebar.hide_item('signup' );
			Sidebar.show_item('signout');
		} else {
			Sidebar.show_item('signin' );
			Sidebar.show_item('signup' );
			Sidebar.hide_item('signout');
		}
	} }
	
	Sessions = sessions = {
		jaddad: function (parent) {
			update_softkeys();
			return element;
		},
		go_forward: function (parent) {
			if (debug_sessions) $.log.w( 'Sessions go_forward' );
			if (mfateeh) {
				var user = generate_alias(mfateeh.username.value);
				var pass = mfateeh.password.value.trim();
				var answer = mfateeh.answer.value;
				var hash = mfateeh.hash.value, yes;
				var current_view = View.get()
				if (current_view === 'signup') {
					yes = 1;
					if (!join_state.username) {
						if (usernamevalid(user)) Sessions.usernameexists(user);
						yes = 0;
					}
					if (!join_state.password) {
						if (pass.length >= PASSWORDMIN && pass.length <= PASSWORDMAX) {
							innertext(mfateeh.passstatus, '');
							join_state.password = 1;
						} else {
							innertext(mfateeh.passstatus, xlate(
								pass.length < PASSWORDMIN ? 'passwordunder' : 'passwordover'
							));
							join_state.password = 0;
							yes = 0;
						}
					}
					if (!join_state.answer) {
						if (answer.length)
							innertext(mfateeh.answerstatus, '');
						else
							innertext(mfateeh.answerstatus, xlate('answerblank')),
							yes = 0;

						if (yes) {
							Sessions.login(user, pass, hash, answer, 1);
						}
					}
				}
				if (current_view === 'signin') {
					yes = 1;
					if (user.length >= USERNAMEMIN && user.length <= USERNAMEMAX) {
						innertext(mfateeh.aliasstatus, '');
						login_state.username = 1;
					} else {
						innertext(mfateeh.aliasstatus, xlate(
							user.length < USERNAMEMIN ? 'usernameunder' : 'usernameover'
						));
						login_state.username = 0;
						yes = 0;
					}
					if (pass.length >= PASSWORDMIN && pass.length <= PASSWORDMAX) {
						innertext(mfateeh.passstatus, '');
						login_state.password = 1;
					} else {
						innertext(mfateeh.passstatus, xlate(
							pass.length < PASSWORDMIN ? 'passwordunder' : 'passwordover'
						));
						login_state.password = 0;
						yes = 0;
					}
					if (answer.length) {
						innertext(mfateeh.answerstatus, '');
					} else {
						innertext(mfateeh.answerstatus, xlate('answerblank')),
						yes = 0;
					}
					if (yes) {
						Sessions.login(user, pass, hash, answer);
					}
				}
			}
			if (yes) {
				update_softkeys();
			}
			smartfocus(parent);
		},
		shimaal: function (parent) {
			var current = parseint(parent.dataset.currentqadam || 0);
			if (current > 0) {
				parent.dataset.currentqadam = --current;
				update_softkeys();
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
		signedin: function () { // deprecated use get_session_key instead
			return Preferences.get(1);
		},
		uid: function () { // signedin account uid
			return Preferences.get(2);
		},
		get_account_uid: function () {
			return this.uid();
		},
		get_session_key: function () { // return session key
			return Preferences.get(1);
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
				Hooks.run('sessions-change', { signed_in: 0 });

//				if (Backstack.darajah)
//					Backstack.back();
//				else
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
						Webapp.dimmer(LAYERTOPMOST, xlate('checkingusername'));

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
		if (debug_sessions) $.log.w('Sessions', signedin ? 'signed in' : 'signed out');
		update_sidebar();
	});
	Hooks.set('ready', function (args) {
		if (Sidebar) {
			Sidebar.set({
				uid: 'signout',
				title: xlate('signout'),
				icon: 'iconexittoapp',
				keep_open: 1,
				hidden: 1,
				callback: function () {
					Hooks.run('dialog', {
						m: xlate('signoutconfirm'),
						c: function () {
							Sessions.signout();
						},
					});
				}
			});
			Sidebar.set({
				uid: 'signin',
				title: xlate('signin'),
				icon: 'iconperson',
				hidden: 1,
			});
			Sidebar.set({
				uid: 'signup',
				title: xlate('signup'),
				icon: 'iconpersonadd',
				hidden: 1,
			});
		}
		
		Network.intercept('sessions', 'key', function (finish) {
			finish(Sessions.signedin() || undefined);
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
					Hooks.run('sessions-change', { signed_in: 1 });
					update_sidebar();
					Webapp.status( xlate('loggedin') );
					reset_all_forms();
					
//					if (Backstack.darajah)
//						Backstack.back();
//					else
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
		Hooks.run('sessions-change', { signed_in: !!Sessions.signedin() });

		var m = View.dom_keys('signup');
		var usnmfld = m.username;
		usnmfld.onkeyup = function () {
			var user = generate_alias(usnmfld.value);
			if (usernamevalid(user)) {
				var cached = usnmavlble['_'+user];
				if (cached === undefined)
				$.taxeer('usernametempcheck', function () {
					Sessions.usernameexists( user, 1 );
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
			update_softkeys();
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
			update_softkeys();
			sessions.getcaptcha();
			smartfocus( mfateeh.aqdaam );
			password_visibility( getattribute(mfateeh.password, 'type') == 'text' );
		}
	});
})();
