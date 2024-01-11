var Sidebar, sidebar_sheet_list;
;(function(){
	var sidebar_list, debug_sidebar = 1;
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

	Sidebar = {
		set_softkey: function () {
			Softkeys.add( sidebar_softkey );
		},
		remove_softkey: function () {
			if (sidebar_softkey.uid)
				Softkeys.remove( sidebar_softkey.uid );
		},
		// { uid, title, icon, count, keep_open, callback }
		set: function (options) { if (sidebar_list) {
			if (debug_sidebar) $.log.w( 'Sidebar.set', options.uid );
			var old_options = sidebar_list.adapter.get(options.uid);
			
			if (old_options) {
				old_options = shallowcopy( old_options );
				delete old_options.id_dom;
				options = Object.assign(old_options, options);
			}
			
			sidebar_list.set(options);
			if (sidebar_sheet_list) {
				delete options.id_dom;
				sidebar_sheet_list.set(options);
			}
		} },
		get: function (uid) {
			return shallowcopy( sidebar_list.adapter.get(uid) );
		},
		remove: function (uid) {
			sidebar_list.pop(uid);
			if (sidebar_sheet_list) {
				sidebar_sheet_list.pop(uid);
			}
		},
		open: function () {
			if (innerwidth() > 1024) {
//				sidebar_list.set_focus(1, 1);
				// TODO escape to restore focus maybe?
			} else {
				open_list_sheet('Menu', function (l) {
					sidebar_sheet_list = l;
					l.uponclick = function (o) {
						if (!o.keep_open) // if you want to keep the side bar open
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
	
	listener('resize', function () {
		$.taxeer('sidebar-softkey', function () {
			if (innerwidth() > 1024) {
				Sidebar.remove_softkey();
			} else {
				Sidebar.set_softkey();
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
			if (isfun(o.cb) || isfun(o.callback)) {
				if (isfun(o.cb)) o.cb();
				if (isfun(o.callback)) o.callback();
			} else {
				sidebar_list.select_by_uid( o.uid, 1, 1, 1 );

				var name = o.uid;
				Hooks.run('view', name);
				
				if (get_global_object().Pager) Pager.choose(name);
			}
//			sidebar_list.set_focus();
		};
	});
	Hooks.set('viewready', function (args) {
		if (Backstack.darajah <= 1 && innerwidth() <= 1024) {
			Sidebar.set_softkey();
		}
	});
	Hooks.set('restore', function (level) {
		if (level <= 1) {
			if (innerwidth() <= 1024) {
//				Sidebar.set_softkey();
			} else {
				Sidebar.remove_softkey();
			}
		}
	});

})();

