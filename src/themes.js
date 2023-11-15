//+ toggle saveto saveto_contrast
var themes;
;(function(){
	var K, P, settingsuid, current = 0, contrast = 0;
	
	var store = {
		0: {
			XPO.status:		'rgba(0,0,0,0.6)',
			XPO.statusm:	'rgba(0,0,0,0.2)',
			
			XPO.textl:		'#fff',
			XPO.text:		'#ddd',
			XPO.textd:		'#aaa',
			XPO.textdt:		'#aaaaaa55',
			XPO.textxd:		'#777',
			XPO.textxdt:	'#77777755',

			XPO.primaryl:	'#050505',
			XPO.primary:	'black',
			XPO.primaryd:	'black',
			XPO.primaryt:	'rgba(0,0,0,0.8)', // perfect transparent level
			XPO.primaryxt:	'rgba(0,0,0,0.4)',

			XPO.secondaryl:	'#353535',
			XPO.secondary:	'#333',
			XPO.secondaryd:	'#252525',
			XPO.secondaryt:	'rgba(40,40,40,0.8)',

			XPO.tertiaryl:	'#454545',
			XPO.tertiary:	'#444',
			XPO.tertiaryd:	'#353535',
			XPO.tertiaryt:	'rgba(53,53,53,0.8)',

			XPO.accentl:	'#4ccbfc',
			XPO.accent:		'#04baf5',
			XPO.accentt:	'rgba(4, 186, 245, 0.7)',
			XPO.accentxt:	'rgba(4, 186, 245, 0.4)',
			XPO.accentd:	'#0284c0',
			XPO.accentdt:	'rgba(4, 126, 205, 0.7)',

			XPO.green:		'#0c0',
			XPO.yellow:		'#ca0',
			XPO.redl:		'#f99',
			XPO.red:		'#c00',
			XPO.redd:		'#900',
 		},
		1: {
			XPO.status:		'rgba(0,0,0,0.6)',
			XPO.statusm:	'rgba(0,0,0,0.2)',

			XPO.textl:		'#111',
			XPO.text:		'#333',
			XPO.textd:		'#666',
			XPO.textdt:		'#66666655',
			XPO.textxd:		'#888',
			XPO.textxdt:	'#88888855',

			XPO.primaryl:	'#e6e6e6',
			XPO.primary:	'#fff',
			XPO.primaryd:	'#d6d6d6',
			XPO.primaryt:	'rgba(255,255,255,0.8)', // perfect transparent level
			XPO.primaryxt:	'rgba(255,255,255,0.4)',

			XPO.secondaryl:	'#e6e6e6',
			XPO.secondary:	'#d6d6d6',
			XPO.secondaryd:	'#c6c6c6',
			XPO.secondaryt:	'rgba(180,180,180,0.8)',

			XPO.tertiaryl:	'#eee',
			XPO.tertiary:	'#ddd',
			XPO.tertiaryd:	'#ccc',
			XPO.tertiaryt:	'rgba(204,204,204,0.8)',

			XPO.accentl:	'#0bb8cb',
			XPO.accent:		'#00609a',
			XPO.accentt:	'rgba(0, 67, 113, 0.7)',
			XPO.accentxt:	'rgba(0, 67, 113, 0.4)',
			XPO.accentd:	'#004371',
			XPO.accentdt:	'rgba(0, 37, 93, 0.7)',

			XPO.green:		'#0c0',
			XPO.yellow:		'#ca0',
			XPO.redl:		'#900',
			XPO.red:		'#c00',
			XPO.redd:		'#faa',
		},
		2: {
			XPO.status:		'rgba(0,0,0,0.7)',
			XPO.statusm:	'rgba(0,0,0,0.35)',
			
			XPO.textl:		'#fff',
			XPO.text:		'#ddd',
			XPO.textd:		'#aaa',
			XPO.textdt:		'#aaaaaa55',
			XPO.textxd:		'#777',
			XPO.textxdt:	'#77777755',

			XPO.primaryl:	'#050505',
			XPO.primary:	'black',
			XPO.primaryd:	'black',
			XPO.primaryt:	'rgba(0,0,0,0.8)', // perfect transparent level
			XPO.primaryxt:	'rgba(0,0,0,0.4)',

			XPO.secondaryl:	'#555',
			XPO.secondary:	'#444',
			XPO.secondaryd:	'#333',
			XPO.secondaryt:	'rgba(60,60,60,0.8)',

			XPO.tertiaryl:	'#777',
			XPO.tertiary:	'#666',
			XPO.tertiaryd:	'#555',
			XPO.tertiaryt:	'rgba(83,83,83,0.8)',

			XPO.accentl:	'#4ccbfc',
			XPO.accent:		'#04baf5',
			XPO.accentt:	'rgba(4, 186, 245, 0.7)',
			XPO.accentxt:	'rgba(4, 186, 245, 0.4)',
			XPO.accentd:	'#0284c0',
			XPO.accentdt:	'rgba(4, 126, 205, 0.7)',

			XPO.green:		'#0c0',
			XPO.yellow:		'#ca0',
			XPO.redl:		'#f99',
			XPO.red:		'#c00',
			XPO.redd:		'#900',
 		},
		3: {
			XPO.status:		'rgba(0,0,0,0.6)',
			XPO.statusm:	'rgba(0,0,0,0.2)',

			XPO.textl:		'#111',
			XPO.text:		'#333',
			XPO.textd:		'#666',
			XPO.textdt:		'#66666655',
			XPO.textxd:		'#888',
			XPO.textxdt:	'#88888855',

			XPO.primaryl:	'#e6e6e6',
			XPO.primary:	'#fff',
			XPO.primaryd:	'#d6d6d6',
			XPO.primaryt:	'rgba(255,255,255,0.8)', // perfect transparent level
			XPO.primaryxt:	'rgba(255,255,255,0.4)',

			XPO.secondaryl:	'#e6e6e6',
			XPO.secondary:	'#d6d6d6',
			XPO.secondaryd:	'#c6c6c6',
			XPO.secondaryt:	'rgba(180,180,180,0.8)',

			XPO.tertiaryl:	'#eee',
			XPO.tertiary:	'#ddd',
			XPO.tertiaryd:	'#ccc',
			XPO.tertiaryt:	'rgba(204,204,204,0.8)',

			XPO.accentl:	'#0bb8cb',
			XPO.accent:		'#00609a',
			XPO.accentt:	'rgba(0, 67, 113, 0.7)',
			XPO.accentxt:	'rgba(0, 67, 113, 0.4)',
			XPO.accentd:	'#004371',
			XPO.accentdt:	'rgba(0, 37, 93, 0.7)',

			XPO.green:		'#0c0',
			XPO.yellow:		'#ca0',
			XPO.redl:		'#900',
			XPO.red:		'#c00',
			XPO.redd:		'#faa',
		},
	};

	function set_theme_with_contrast(theme) {
		if (contrast) { // high
			if ( theme ) { // white
				themes.set(3);
			} else { // black
				themes.set(2);
			}
		} else { // low
			if ( theme ) { // white
				themes.set(1);
			} else { // black
				themes.set(0);
			}
		}
	}

	themes = {
		/* in preferences (using localStorage), use this key to remember theme
		 * */
		saveto: 19,
		saveto_contrast: '19c',
		/* +changes the theme if only the theme name is provided
		 * theme is a string, refers to an object inside store
		 * this objects contains key:value pairs
		 * that refer to slang css variables
		 * 
		 * +if only theme & key are provided and not value
		 * assumes that key is an object representing theme
		 * 
		 * +if key and value are also provided
		 * inside a store.theme, set a key to value
		 * */
		set: function (theme, key, value) {
			var arglen = arguments.length;
			if (arglen === 0) {
				themes.set(current);
			}

			if (arglen === 1) {
				if (store[theme]) {
					XPO.dynamicstyle.innerHTML = XPO.updatetheme(store[theme]);
					XPO.themecolor && XPO.themecolor.setAttribute('content', themes.get('XPO.status'));
				}
			}

			if (arglen === 2) {
				store[theme] = key;
			}
			
			if (arglen === 3) {
				store[theme] = store[theme] || {};
				store[theme][key] = value;
			}

			return themes;
		},
		/* if only one arg is provided, assume it's the key
		 * */
		get: function (theme, key) {
			var arglen = arguments.length;
			if (arglen === 0 && current !== undefined)
				return current;

			if (arglen === 1 && current !== undefined)
				return store[current][theme];
			
			if (arglen === 2)
				return store[theme][key];
			
			return false;
		},
		toggle: function () {
			current = current ? 0 : 1;
			set_theme_with_contrast(current);
			settings.jaddad(settingsuid);
			// TODO update settings entry
		},
	};
	
	Hooks.set('XPO.ready', function () {
		if (preferences) {
			current = preferences.get(themes.saveto, 1) || 0;
			contrast = preferences.get(themes.saveto_contrast, 1) || 0;
		}

		set_theme_with_contrast(current);
		
		settingsuid = settings.adaaf('XPO.theme', function () {
			var iswhite = preferences.get(themes.saveto, 1);
			current = iswhite ? 1 : 0;
			set_theme_with_contrast(current);
			return [ iswhite ? 'XPO.white' : 'XPO.black' ];
		}, function () {
			preferences.set(themes.saveto, preferences.get(themes.saveto, 1) ? 0 : 1);
		}, 'XPO.icontheme');

		settingsuid = settings.adaaf('XPO.contrast', function () {
			var ishigh = preferences.get(themes.saveto_contrast, 1);
			contrast = ishigh ? 1 : 0;
			set_theme_with_contrast(current);
			return [ ishigh ? 'XPO.high' : 'XPO.low' ];
		}, function () {
			preferences.set(themes.saveto_contrast, preferences.get(themes.saveto_contrast, 1) ? 0 : 1);
		}, 'XPO.iconbrightness7');
	});
	Hooks.set('XPO.viewready', function (args) {
		K = softkeys.K, // key names
		P = softkeys.P; // presets

		switch (args.XPO.name) {
			case 'XPO.main':
				softkeys.add({ n: 'Theme',
					k: 'i',
					ctrl: 1,
					alt: 1,
					i: 'XPO.icontheme',
					c: function (k, e) {
						themes.toggle();
						e && e.preventDefault();
					}
				});
				break;
		}
	});
})();