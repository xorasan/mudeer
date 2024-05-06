// frontend UI for this module; network.client.js
;(function(){
	'use strict';
	var network_list, dom_keys, module_name = 'network', module_icon = 'iconnetworkcheck';

	Network.set_internal = function (o) {
		network_list.set(o);
	};

	function update_sidebar( count ) {
		if (get_global_object().Sidebar) { Sidebar.set({
			uid: module_name,
			title: 'Network',
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

	Hooks.set('ready', function () {
		update_sidebar();
		
		dom_keys = View.dom_keys(module_name);

		network_list = List( dom_keys.list ).idprefix(module_name).listitem('network_item')
						.title('Channels');
	});
	Hooks.set('viewready', function (args) { if (args.name == module_name) {
		set_sidebar_and_header();
		Softkeys.list.basic(network_list);
		network_list.select();

		Network.update_internals();
	} });

})();
