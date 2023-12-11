var Sidebar;
;(function(){
	var sidebar_list, debug_sidebar = 0;

	Sidebar = {
		set: function (options) { if (sidebar_list) {
			if (debug_sidebar) $.log.w( 'Sidebar.set', options.uid );
			sidebar_list.set(options);
		} },
		get: function (theme, key) {
		},
		pop: function (uid) {
		},
		open: function () {
			if (innerwidth() > 1024) {
				sidebar_list.set_focus(1, 1);
				// TODO escape to restore focus maybe?
			} else {
				open_list_sheet('Menu', function (l) {
					l.uponclick = function (o) {
						backstack.back();
						$.taxeer('after_sidebar_sheet', function () {
							sidebar_list.uponclick(o);
						}, 20);
					};
					sidebar_list.adapter.each(function (o) {
						o = shallowcopy(o);
						delete o.id_dom;
						l.set(o);
					});
				});
			}
		},
		choose: function (uid) { // merely highlights an item
			sidebar_list.select_by_uid( uid, 1, 1, 1 );
		},
	};
	
	function set_sidebar_softkey() {
		softkeys.add({ n: 'Sidebar',
			k: 'contextmenu',
			first: 1, // TODO
			ctrl: 1,
			i: 'iconmenu',
			c: function (k, e) {
				Sidebar.open();
				e && e.preventDefault();
			}
		});
	}
	
	Hooks.set('ready', function () {
		sidebar_list = List( templates.keys(sidebarui).list ).idprefix('sdbr').listitem('sidebar_item');
		sidebar_list.after_set = function (o, c, k) {
			if (o.count) izhar(k.count_tag); else ixtaf(k.count_tag);
		};
		sidebar_list.onpress = function (o) {
			sidebar_list.uponclick( o );
		};
		sidebar_list.uponclick = function (o) {
			sidebar_list.select_by_uid( o.uid, 1, 1, 1 );

			var name = o.uid;
			if (name == 'main') {
				if (backstack.darajah > 0) backstack.back(); else backstack.main();
			} else {
				Hooks.run('view', name);
			}
			
			if (get_global_object().Pager) Pager.choose(name);
			sidebar_list.set_focus();
		};
	});
	Hooks.set('viewready', function (args) {
//		if (view.is_active('main')) {
			set_sidebar_softkey();
//		}
	});
	Hooks.set('restore', function (args) {
		if (backstack.darajah === 0) {
			set_sidebar_softkey();
		}
	});

})();

