var Sidebar;
;(function(){
	var sidebar_list, debug_sidebar = 1;

	Sidebar = {
		set: function (options) { if (sidebar_list) {
			if (debug_sidebar) $.log.w( 'Sidebar.set', options.uid );
			sidebar_list.set(options);
		} },
		get: function (theme, key) {
		},
		remove: function (uid) {
			sidebar_list.pop(uid);
		},
		open: function () {
			if (innerwidth() > 1024) {
//				sidebar_list.set_focus(1, 1);
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
						o.value = o.count;
						l.set(o);
					});
				});
			}
		},
		choose: function (uid) { // merely highlights an item
			sidebar_list.select_by_uid( uid, 1, 1, 1 );
		},
	};
	
	var sidebar_softkey = { n: 'Sidebar',
		k: 'contextmenu',
		last: 1,
		ctrl: 1,
		i: 'iconmenu',
		c: function (k, e) {
			Sidebar.open();
			e && e.preventDefault();
		}
	};
	function set_sidebar_softkey() {
		softkeys.add( sidebar_softkey );
	}

	listener('resize', function () {
		$.taxeer('sidebar-softkey', function () {
			if (innerwidth() > 1024) {
				if (sidebar_softkey.uid)
					softkeys.remove( sidebar_softkey.uid );
			} else {
				softkeys.add( sidebar_softkey );
			}
		});
	});
	Hooks.set('ready', function () {
		sidebar_list = List( templates.keys(sidebarui).list ).idprefix('sdbr')
						.listitem('sidebar_item');

		sidebar_list.after_set = function (o, c, k) {
			if (o.count) izhar(k.count_tag); else ixtaf(k.count_tag);
		};
		sidebar_list.onpress = function (o) {
			sidebar_list.uponclick( o );
		};
		sidebar_list.uponclick = function (o) {
			sidebar_list.select_by_uid( o.uid, 1, 1, 1 );

			var name = o.uid;
			Hooks.run('view', name);
			
			if (get_global_object().Pager) Pager.choose(name);
//			sidebar_list.set_focus();
		};
	});
	Hooks.set('viewready', function (args) {
		if (Backstack.darajah <= 1 && innerwidth() <= 1024) {
			set_sidebar_softkey();
		}
	});
	Hooks.set('restore', function (args) {
		if (Backstack.darajah <= 1 && innerwidth() <= 1024) {
			set_sidebar_softkey();
		}
	});

})();

