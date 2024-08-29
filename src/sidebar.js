var Sidebar, sidebar_list, sidebar_sheet_list;
;(function(){
	let debug_sidebar = 0,
		max_width = 860
		;
	let sidebar_softkey = { n: 'Sidebar',
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
		softkey_enabled: 0,
		set_softkey: function () {
			if (this.softkey_enabled)
				Softkeys.add( sidebar_softkey );
		},
		remove_softkey: function () {
			if (this.softkey_enabled && sidebar_softkey.uid)
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
			
			if (   isundef(options.before) // not overridden
				&& options.uid !== 'main'	// no need for the Home/Main entry
				&& !sidebar_list.adapter.get(options.uid)	// also if doesn't already exist
				) {
				options.before = elementbyid( ( Sidebar.get('main') || {} ).id_dom );
			}
			
			sidebar_list.set(options);
			if (sidebar_sheet_list) {
				delete options.id_dom;
				sidebar_sheet_list.set(options);
			}
		} },
		get: function (uid) {
			let object = sidebar_list.adapter.get(uid);
			if (object)
				return shallowcopy( sidebar_list.adapter.get(uid) );
		},
		remove: function (uid) {
			sidebar_list.pop(uid);
			if (sidebar_sheet_list) {
				sidebar_sheet_list.pop(uid);
			}
		},
		hide_item: function (uid) {
			var o = sidebar_list.adapter.get(uid);
			if (o) o.hidden = 1;
			var c = sidebar_list.get_item_element_by_uid( uid );
			if (c) ixtaf(c);
		},
		show_item: function (uid) {
			var o = sidebar_list.adapter.get(uid);
			if (o) o.hidden = 0;
			var c = sidebar_list.get_item_element_by_uid( uid );
			if (c) izhar(c);
		},
		open: function () {
			if (innerwidth() > max_width) {
//				sidebar_list.set_focus(1, 1);
				// TODO escape to restore focus maybe?
			} else {
				open_list_sheet('Menu', function (l) {
					sidebar_sheet_list = l;
					l.uponclick = function (o) {
						if (!o.keep_open) // if you want to keep the side bar open
							backstack.back();
						$.delay('after_sidebar_sheet', function () {
							sidebar_list.uponclick(o);
						}, 20);
					};
					sidebar_list.adapter.each(function (o) { if (!o.hidden) {
						o = shallowcopy(o);
						delete o.id_dom;
						l.set(o);
					} });
				});
			}
		},
		choose: function (uid) { // merely highlights an item
			if (isundef(uid)) {
				sidebar_list.deselect();
			} else {
				sidebar_list.select_by_uid( uid, 1, 1, 1 );
			}
		},
	};
	
	listener('resize', function () {
		$.taxeer('sidebar-softkey', function () {
			if (innerwidth() > max_width) {
				Sidebar.remove_softkey();
			} else {
				Sidebar.set_softkey();
			}
		});
	});
	Hooks.set('webapp-before-init', async function () {
		sidebar_list = List( Templates.keys(sidebarui).list ).idprefix('sdbr')
						.listitem('sidebar_item').title('Sidebar');
		Sidebar.list = sidebar_list;
		sidebar_list.after_set = function (o, c, k) {
			if (Templates.has_property(o, 'count'))
				izhar(k.count_tag);
			else
				ixtaf(k.count_tag);
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

				Hooks.run('view', { name: o.uid, uid: o.luid });
				
				if (get_global_object().Pager) Pager.choose(o.uid);
			}
//			sidebar_list.set_focus();
		};
	});
	Hooks.set('viewready', function () {
		if (/*Backstack.darajah <= 1 && */innerwidth() <= max_width) {
			Sidebar.set_softkey();
		}
	});
	Hooks.set('restore', function (level) {
		if (level <= 1) {
			if (innerwidth() <= max_width) {
//				Sidebar.set_softkey();
			} else {
				Sidebar.remove_softkey();
			}
		}
	});

})();

