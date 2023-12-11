//+ adaaf jaddad axad
var Settings, settings, currentad;
;(function(){
	// TODO move this to settingslist.adapter
	var settingsitems = [], module_name = 'settings';
	function add(a) { settingsitems.push(a); }
	// uid, getvalue, onpress
	/*['quality', 0, function () {
		Hooks.run('sheet', {
			name: 'quality',
			title: translate('quality'),
		});
	}],*/
	add(['Mudeer '+$.b, function () {
		return 'Web Framework';
	}, function () {
		open('https://github.com/xorasan/mudeer', '_blank');
	}, 'iconmudeer']);
	// TODO if show if app has a source url
	if (Config.repo) {
		add([Config.appname+' '+BUILDNUMBER, function () {
			return Config.sub;
		}, function () {
			open(Config.repo, '_blank');
		}, '/e.png']);
	}
	add(['timeformat', function () {
		var is24 = preferences.get(24, 1);
		return [is24 ? 'hours24' : 'hours12'];
	}, function () {
		var is24 = preferences.get(24, 1);
		if (is24) preferences.set(24, 0);
		else preferences.set(24, 1);
	}, 'icontimer']);
	add(['calendar', function () {
		var isgregorian = preferences.get(26, 1);
		return [isgregorian ? 'gregorian' : 'hijri'];
	}, function () {
		var isgregorian = preferences.get(26, 1);
		if (isgregorian) preferences.set(26, 0);
		else preferences.set(26, 1);
	}, 'icondaterange']);
	// TODO if show if app supports transparency
//	['transparency', function () {
//		var isit = preferences.get(23, 1);
//		webapp.transparency();
//		return [isit ? 'on' : 'off'];
//	}, function () {
//		var isit = preferences.get(23, 1);
//		if (isit) { preferences.set(23, 0); }
//		else { preferences.set(23, 1); }
//	}, 'iconbluron'],
	add(['largetext', function () {
		var largetext = preferences.get(9, 1);
		webapp.textsize();
		return [largetext ? 'on' : 'off'];
	}, function () {
		preferences.set(9, preferences.get(9, 1) ? 0 : 1);
	}, 'iconformatsize']);

	var settingslist, keys;
	
	Settings = settings = {
		get_dom_keys: function () {
			return keys;
		},
		adaaf: function (name, getvalue, onpress, icon) { // add
			settingsitems.push([name, getvalue, onpress, icon]);
			settings.jaddad(settingsitems.length-1);
			return settingsitems.length-1;
		},
		axad: function (uid) { // get
			return settingsitems[uid];
		},
		jaddad: function (uid) { // update
			var item = settings.axad(uid);
			if (item) {
				var body = typeof item[1] === 'function' ? item[1]() : undefined;
				var obj = {
					uid: uid,
				};
				obj.index = uid;
				obj.title$t = item[0];
				obj.icon = item[3];
				
				if (body instanceof Array) obj.body$t = body[0];
				else obj.body = body;
					
				if (settingslist) {
					settingslist.set(obj);
					
					if (backstack.states.view === module_name)
						settingslist.select();
				}
			}
		},
	};

	Hooks.set('ready', function () {
		if (get_global_object().Sidebar) { Sidebar.set({
			uid: module_name,
			title: translate( module_name ),
			icon: 'iconsettings',
		}); }

		keys = view.mfateeh(module_name);

		settingslist = list( keys.list ).idprefix(module_name)
						.listitem('settingsitem')
						.grid(3);
		
		settingslist.beforeset = function (item, id) {
			return item;
		};
		settingsitems.forEach(function (item, i) {
			settings.jaddad(i);
		});
		settingslist.onpress = function (item, key, uid) {
			if (item) {
				settings.axad(item.index)[2]();
				settings.jaddad(item.index);
			}
		};

	});
	Hooks.set('viewready', function (args) {
		if (Webapp.is_at_home()) {
			softkeys.add({ n: 'Settings',
				ctrl: 1,
				alt: 1,
				k: 'p',
				i: 'iconsettings', // TODO icons module should generate variables like icon_settings
				c: function () {
					Hooks.run('view', module_name);
				}
			});
		}
		if (args.name == module_name) {
			if (get_global_object().Sidebar) Sidebar.choose(module_name);

//			if (pager) {
//				pager.intaxab(module_name, 1);
//				webapp.header();
//			} else { // since pager already shows context
				webapp.header([[module_name], 0, 'iconsettings']);
//			}
			
			softkeys.list.basic(settingslist);
			softkeys.set(K.en, function () {
				settingslist.press(K.en);
			});
			softkeys.set(K.bs, function () {
				backstack.back();
			});

			/* TEST
			 * this can be automated by giving a function to view.?set?
			 * 
			 * view should autocall this function on restore
			 * it can find functions by looping
			 * */
			// restore scroll position
			settingslist.select(undefined, 0);
			settingslist.set_focus(1, 1);
		}
	});

})();


