var Accounts, accounts_list, accounts_recycler;
;(function(){
	'use strict';
	
	var module_name = 'accounts', cache = {}, fetching = {};
	
	Accounts = {
		fetch: async function (uid) {
			if (cache[uid]) return cache[uid];
			
			if (fetching[uid]) {
				return new Promise(function (resolve) {
					fetching[uid].push( resolve );
				});
			}
			// MAYBE add a condition to look for cached items in recycler
			
			var promise = Offline.fetch( module_name, 0, { filter: { uid } } );
			fetching[uid] = fetching[uid] || [];
			var accounts = await promise;
			if (accounts && isarr(accounts) && accounts.length === 1) {
				var o = accounts[0];
				cache[o.uid] = o;
				if (o.remove === -1) {
					o.name = '(deleted-user)';
					o.displayname = '(Deleted-User)';
				}
				if (fetching[o.uid]) {
					fetching[o.uid].forEach(function (p) {
						p(o);
					});
					delete fetching[o.uid];
				}
				return o;
			}

			return 0;
		},
		search: function (str, callback) {
			str = tolower(str);
			var arr = [];
			accounts_list.adapter.each(function (o) {
				if ( tolower(o.displayname).includes(str)
				||	 tolower(o.name).includes(str) ) {
					arr.push(o);
				}
			});
			isfun(callback) && callback(arr);
		},
		get_name: function (account) {
			var account_name = '';
			if (account) {
				if (account.displayname)
					account_name = account.displayname;
				else if (account.name)
					account_name = '@'+account.name;
			}
			return account_name;
		},
		edit_account: function (uid) {
			Hooks.run('sheet', {
				n: create_account_sheet,
				u: uid,
			});
		},
		get: function (uids, callback) {
			var arr = [];
			if (isarr(uids) && uids.length)
			accounts_list.adapter.each(function (o) {
				if (uids.includes(o.uid))
					arr.push(o);
			});
			isfun(callback) && callback(arr);
		},
	};
	
	Offline.create(module_name, 0, {
		delay: -1, // never get from server, server uses broadcast for that
	});

	function update_sidebar( count ) {
		if (get_global_object().Sidebar) { Sidebar.set({
			uid: module_name,
			title: 'Accounts',
			icon: 'iconpeople',
			count: count,
		}); }
	}
	function set_sidebar_and_header(subtitle) {
		if (View.is_active_fully(module_name)) {
			if (get_global_object().Sidebar) Sidebar.choose(module_name);
			Webapp.header([[module_name], subtitle || '', 'iconpeople']);
		}
	}

	Hooks.set('ready', function () {
		update_sidebar();

		Offline.response.add(module_name, async function (response) {
//			$.log( 'Offline.response.add accounts', response );
			if (response) {
				accounts_recycler.set( [response] );
				if (cache[response.uid]) cache[response.uid] = response;
			}
		});
		Offline.response.remove(module_name, function (response) {
			if (isnum(response) || isstr(response)) {
				accounts_recycler.remove_by_uid( response );
				delete cache[response];
			}
		});
		
		var dom_keys = view.dom_keys('accounts');
		accounts_list = List( dom_keys.list ).idprefix(module_name).listitem('account_item');
		
		accounts_recycler = Recycler( accounts_list, module_name );
		accounts_recycler.set_reversed(1);
		accounts_recycler.add_view(module_name);
		
		var edit_key = { n: 'Edit Account',
				k: 'e',
				ctrl: 1,
				i: 'iconedit',
			},
			delete_key = { n: 'Delete Account',
				k: 'delete',
				alt: 1,
				i: 'icondeleteforever',
			};
		accounts_list.on_selection = async function (o) { if ( View.is_active_fully( module_name ) ) {
			if (['next', 'prev'].includes(o.uid)) {
				Softkeys.remove(edit_key.uid);
				Softkeys.remove(delete_key.uid);
				return;
			}

			edit_key.c = function () {
				Accounts.edit_account( o.uid );
				return 1;
			};
			if ( await has_access( module_name, 'edit' ) ) {
				if ( View.is_active_fully( module_name ) ) {
					Softkeys.add(edit_key);
				}
			}

			delete_key.c = function () {
				Hooks.run('dialog', {
					n: delete_account_dialog,
					u: o.uid
				});
				return 1;
			};
			if ( await has_access( module_name, 'remove' ) ) {
				if ( View.is_active_fully( module_name ) ) {
					Softkeys.add(delete_key);
				}
			}
		} };
		accounts_list.onpress = function (item, key, uid) {
			if (['next', 'prev'].includes(item.uid)) return;

		};
		accounts_list.before_set = function (o) {
			if (['next', 'prev'].includes(o.uid)) return o;

			if (!isundef(o.created)) o.created$time = o.created;
			if (!isundef(o.updated)) o.updated$time = o.updated;

			if (o.name) o.name_str = '@'+o.name;

			if (o.owner) o.owner_icon$icon = 'iconowner';
			else o.owner_icon = 'ixtaf', o.owner_icon$icon = '';
			
			return o;
		};
		accounts_list.after_set = function (o, c, k) {
			if (['next', 'prev'].includes(o.uid)) return;
			
			var msg = '';
			if (o.pending) msg = 'pending sync';
			if (o.remove) msg += (msg ? ' · ' : '')+'will remove';

			if (o.no_password) msg += (msg ? ' · ' : '')+'no password';

			innertext(k.message, msg);

			if (o.displayname) izhar(k.displayname);
			else ixtaf(k.displayname);
		};

		Network.intercept(module_name, function (finish) { // receive accounts updates when signed in
			finish( sessions.signedin() ? 1 : undefined );
		});
	});
	Hooks.set('view-init', async function (args) { if ( View.is_active_fully( module_name ) ) {
		set_sidebar_and_header();

		Softkeys.list.basic(accounts_list);

		var loaded_objects = accounts_recycler.get_objects();
		if (loaded_objects.length == 0) {
			await accounts_recycler.count();
			await accounts_recycler.render();
		}

		if ( await has_access( module_name, 'create' ) ) {
			if ( View.is_active_fully( module_name ) ) {
				Softkeys.add({ n: 'Create Account',
					k: K.sl,
					i: 'iconadd',
					c: function () {
						Accounts.edit_account();
						return 1;
					}
				});
			}
		}

	} });
	Hooks.set('restore', function (args) {
		if (View.is_active_fully(module_name)) {
			set_sidebar_and_header();
			innertext(tafawwaq, '');
		}
	});

	Hooks.set('sessionchange', async function (signedin) {
		if (!signedin) {
			if (accounts_recycler) await accounts_recycler.remove_all();
		}
	});

	var delete_account_dialog = 'delete-account',
		create_account_sheet = 'setup-account';
	var sheet_out = { }, sheet_list, setup_account_dom_keys;
	Hooks.set(dialog_ready, async function (args, k) { if (args.name == delete_account_dialog) {
		var account = await Accounts.fetch(args.uid);
		if (Dialog.get_name() == delete_account_dialog && Dialog.get_uid() == account.uid) {
			var name = account.name || account.displayname;
			var name_str = (name ? '"'+name+'"' : 'this account');
			Webapp.header(['Remove Account', name_str]);
			Dialog.set_message( 'Do you want to delete '+name_str+'?' );
		}
	} });
	Hooks.set(dialog_done, async function ({ name, uid }, k, answer) { if (name == delete_account_dialog) {
		var o = await Accounts.fetch(uid);
		o.remove = 1;
		accounts_recycler.set([o]);
		Offline.remove(module_name, { uid });
	} });
	Hooks.set(sheet_ready, async function (args, k) { if (args.name == create_account_sheet) {
		Sheet.set_title('Setup Account');
		setup_account_dom_keys = k;
		var out = sheet_out, l = sheet_list;
		var suid = Sessions.uid(); // TODO CHECK
		k.name.focus();

		if (args.uid) {
			var account = await Accounts.fetch(args.uid);
			Sheet.set_data(account);
			if (Sheet.get_active() == create_account_sheet && setup_account_dom_keys && account) {
				if (account.remove && account.uid === Sheet.get_active_uid()) {
					Sheet.cancel();
				} else {
					Templates.set(Sheet.get(), {
						uid:			account.uid || '',
						name:			account.name || '',
						displayname:	account.displayname || '',
						owner:			account.owner || 0,
					});
				}
			}
		}
	} });
	Hooks.set(sheet_done, function (args, k) { if (args.name == create_account_sheet) {
		setup_account_dom_keys = 0;
		var account = Sheet.get_data();
		var o = {
			uid:			k.uid.value || Offline.ruid(),
			name:			generate_alias(k.name.value),
			displayname:	k.displayname.value,
			password:		k.password.value,
			owner:			parseint(k.owner.value || 0),
			pending:		1,
		};
		if (account) o.created = account.created;
		Offline.add(module_name, shallowcopy(o));
		accounts_recycler.set([o]);
	} });
	Hooks.set('recycler-insert-done', async function ({ name, need }) { if (name == module_name) {
		var elements = await accounts_recycler.get_elements();
		elements.reverse();
		elements.forEach(function (element) {
			var k = templates.keys(element);
			var item = accounts_list.adapter.get( getdata(element, 'uid') );

			var unique_color = Themes.generate_predictable_color(item.uid);
			setcss(k.photo, 'background-color', Themes.darken_hex_color(unique_color, 130, .5) );
			setcss(k.photo, 'color', Themes.brighten_hex_color(unique_color, 130, .7) );

			var short_name = '';
			if (item.displayname) {
				short_name = item.displayname;
			} else if (item.name) {
				short_name = item.name;
			}
			innertext( k.short_name, short_name.slice(0, 3)+'\n'+short_name.slice(3, 6) );
		});
	} });

})();
