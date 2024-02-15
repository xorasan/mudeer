var Accounts;
;(function(){
	'use strict';
	
	var accounts_list, module_name = 'accounts', cache = {}, fetching = {};
	
	Accounts = {
		fetch: async function (uid) {
			if (cache[uid]) return cache[uid];
			
			if (fetching[uid]) {
				return new Promise(function (resolve) {
					fetching[uid].push( resolve );
				});
			}
			
			var promise = Offline.fetch( module_name, 0, { filter: { uid } } );
			fetching[uid] = fetching[uid] || [];
			var accounts = await promise;
			if (accounts && isarr(accounts) && accounts.length === 1) {
				var o = accounts[0];
				cache[o.uid] = o;
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
		keyvalue: 1
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
		if (view.is_active(module_name)) {
			if (get_global_object().Sidebar) Sidebar.choose(module_name);
			webapp.header([[module_name], subtitle || '', 'iconpeople']);
		}
	}

	Hooks.set('ready', function () {
		update_sidebar();
		
		var dom_keys = view.dom_keys('accounts');
		accounts_list = List( dom_keys.list ).idprefix(module_name).listitem('account_item');
		accounts_list.onpress = function (item, key, uid) {
		};
		Network.intercept(module_name, function (finish) { // receive accounts updates when signed in
			finish( sessions.signedin() ? 1 : undefined );
		});
		Offline.response.get(module_name, function (response) {
//			$.log( response );
		});
		Network.response.get(module_name, 'all', function (response) {
			if (accounts_list && isarr(response)) {
				accounts_list.title(response.length+' accounts');
				update_sidebar( response.length );
				response.forEach(function (o) {
					accounts_list.set({
						uid: o.uid,
						name: o.name,
						displayname: o.displayname,
						created$time: o.created,
						updated$time: o.updated,
					});
				});
			}
		});
	});
	Hooks.set('viewready', function (args) {
		if (args.name == module_name) {
			set_sidebar_and_header();
			softkeys.list.basic(accounts_list);
			accounts_list.select();
			Offline.get(module_name, 0, 0, Time.now());
			Network.get(module_name, 'all', 1);
		}
	});
	Hooks.set('restore', function (args) {
		if (view.is_active(module_name) && backstack.darajah === 1) {
			set_sidebar_and_header();
			innertext(tafawwaq, '');
		}
	});

})();
