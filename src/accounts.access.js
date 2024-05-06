var has_access, create_access, set_access;
;(function(){
	'use strict';
	
	var access = {}, access_list, module_name = 'accounts_access', module_icon = 'iconlock';
	
	has_access = async function ( name, feature ) {
		var account_uid = Sessions.get_account_uid();
		if (account_uid) {
			var o = await Accounts.fetch( account_uid );
			if (o && o.owner == 1) {
				return 1;
			}
		}
		return 0;
	};
	create_access = function ( name, feature, description ) {
		access[ name+'_'+feature ] = { name, feature, description };
	};
	set_access = function () {
		
	};

	function update_sidebar( count ) {
		if (get_global_object().Sidebar) { Sidebar.set({
			uid: module_name,
			title: 'Access',
			icon: module_icon,
			count: count,
		}); }
	}
	function set_sidebar_and_header(subtitle) {
		if (View.is_active(module_name)) {
			if (get_global_object().Sidebar) Sidebar.choose(module_name);
			Webapp.header([[module_name], subtitle || '', module_icon]);
		}
	}
	async function update_access_list() {
		var is_owner = await has_access();
		for (var uid in access) {
			var o = access[ uid ];
			access_list.set({
				uid,
				icon: is_owner ? 'icondone' : 'iconclose',
				name: o.name,
				feature: o.feature,
				description: o.description,
			});
		}
	}

	Hooks.set('ready', async function () {
		update_sidebar();
		
		create_access( module_name, 'owner', 'Owner' );

		var dom_keys = View.dom_keys(module_name);
		access_list = List( dom_keys.list ).idprefix(module_name).listitem('access_item');

		$.taxeer(module_name, function () {
			update_access_list();
		});
	});
	Hooks.set('viewready', function (args) { if (args.name == module_name) {
		set_sidebar_and_header();
		Softkeys.list.basic(access_list);
		access_list.select();
		update_access_list();
	} });
	Hooks.set('restore', function (args) {
		if (View.is_active(module_name) && Backstack.darajah === 1) {
			set_sidebar_and_header();
			innertext(tafawwaq, '');
		}
	});

})();
