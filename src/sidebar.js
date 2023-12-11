var Sidebar;
;(function(){
	var sidebar_list, debug_sidebar = 1;

	Sidebar = {
		set: function (options) { if (sidebar_list) {
			if (debug_sidebar) $.log( 'Sidebar.set', options.uid );
			sidebar_list.set(options);
		} },
		get: function (theme, key) {
		},
		pop: function (uid) {
			
		},
		open: function () {
			open_list_sheet('Menu', function (l) {
				sidebar_list.adapter.each(function (o) {
					o = shallowcopy(o);
					delete o.id_dom;
					l.set(o);
				});
			});
		},
	};
	
	Hooks.set('ready', function () {
		sidebar_list = List( templates.keys(sidebarui).list ).idprefix('sdbr').listitem('sidebar_item');
		sidebar_list.on_selection = function (o) {
			var name = o.uid;
			if (name == 'main') {
				if (backstack.darajah > 0) backstack.back(); else backstack.main();
			} else {
				Hooks.run('view', name);
			}
		};
	});
	Hooks.set('viewready', function (args) {
		switch (args.name) {
			case 'main':
				softkeys.add({ n: 'Sidebar',
					k: 'contextmenu',
					ctrl: 1,
					i: 'iconmenu',
					c: function (k, e) {
						Sidebar.open();
						e && e.preventDefault();
					}
				});
				break;
		}
	});
})();