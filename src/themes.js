var Themes, themes;
;(function(){
	var K, P, settingsuid, current = 0, contrast = 0;
	
	var store = {
		0: {
			status:		'rgba(0,0,0,0.6)',
			statusm:	'rgba(0,0,0,0.2)',
			
			textl:		'#fff',
			text:		'#ddd',
			textd:		'#aaa',
			textdt:		'#aaaaaa55',
			textxd:		'#777',
			textxdt:	'#77777755',

			primaryl:	'#050505',
			primary:	'black',
			primaryd:	'black',
			primaryt:	'rgba(0,0,0,0.8)', // perfect transparent level
			primaryxt:	'rgba(0,0,0,0.4)',

			secondaryl:	'#353535',
			secondary:	'#333',
			secondaryd:	'#252525',
			secondaryt:	'rgba(40,40,40,0.8)',

			tertiaryl:	'#454545',
			tertiary:	'#444',
			tertiaryd:	'#353535',
			tertiaryt:	'rgba(53,53,53,0.8)',

			accentl:	'#4ccbfc',
			accent:		'#04baf5',
			accentt:	'rgba(4, 186, 245, 0.7)',
			accentxt:	'rgba(4, 186, 245, 0.4)',
			accentd:	'#0284c0',
			accentdt:	'rgba(4, 126, 205, 0.7)',

			green:		'#0c0',
			yellow:		'#ca0',
			redl:		'#f99',
			red:		'#c00',
			redd:		'#900',
 		},
		1: {
			status:		'rgba(0,0,0,0.6)',
			statusm:	'rgba(0,0,0,0.2)',

			textl:		'#111',
			text:		'#333',
			textd:		'#666',
			textdt:		'#66666655',
			textxd:		'#888',
			textxdt:	'#88888855',

			primaryl:	'#e6e6e6',
			primary:	'#fff',
			primaryd:	'#d6d6d6',
			primaryt:	'rgba(255,255,255,0.8)', // perfect transparent level
			primaryxt:	'rgba(255,255,255,0.4)',

			secondaryl:	'#e6e6e6',
			secondary:	'#d6d6d6',
			secondaryd:	'#c6c6c6',
			secondaryt:	'rgba(180,180,180,0.8)',

			tertiaryl:	'#eee',
			tertiary:	'#ddd',
			tertiaryd:	'#ccc',
			tertiaryt:	'rgba(204,204,204,0.8)',

			accentl:	'#0bb8cb',
			accent:		'#00609a',
			accentt:	'rgba(0, 67, 113, 0.7)',
			accentxt:	'rgba(0, 67, 113, 0.4)',
			accentd:	'#004371',
			accentdt:	'rgba(0, 37, 93, 0.7)',

			green:		'#0c0',
			yellow:		'#ca0',
			redl:		'#900',
			red:		'#c00',
			redd:		'#faa',
		},
		2: {
			status:		'rgba(0,0,0,0.7)',
			statusm:	'rgba(0,0,0,0.35)',
			
			textl:		'#fff',
			text:		'#ddd',
			textd:		'#aaa',
			textdt:		'#aaaaaa55',
			textxd:		'#777',
			textxdt:	'#77777755',

			primaryl:	'#050505',
			primary:	'black',
			primaryd:	'black',
			primaryt:	'rgba(0,0,0,0.8)', // perfect transparent level
			primaryxt:	'rgba(0,0,0,0.4)',

			secondaryl:	'#555',
			secondary:	'#444',
			secondaryd:	'#333',
			secondaryt:	'rgba(60,60,60,0.8)',

			tertiaryl:	'#777',
			tertiary:	'#666',
			tertiaryd:	'#555',
			tertiaryt:	'rgba(83,83,83,0.8)',

			accentl:	'#4ccbfc',
			accent:		'#04baf5',
			accentt:	'rgba(4, 186, 245, 0.7)',
			accentxt:	'rgba(4, 186, 245, 0.4)',
			accentd:	'#0284c0',
			accentdt:	'rgba(4, 126, 205, 0.7)',

			green:		'#0c0',
			yellow:		'#ca0',
			redl:		'#f99',
			red:		'#c00',
			redd:		'#900',
 		},
		3: {
			status:		'rgba(0,0,0,0.6)',
			statusm:	'rgba(0,0,0,0.2)',

			textl:		'#111',
			text:		'#333',
			textd:		'#666',
			textdt:		'#66666655',
			textxd:		'#888',
			textxdt:	'#88888855',

			primaryl:	'#e6e6e6',
			primary:	'#fff',
			primaryd:	'#d6d6d6',
			primaryt:	'rgba(255,255,255,0.8)', // perfect transparent level
			primaryxt:	'rgba(255,255,255,0.4)',

			secondaryl:	'#e6e6e6',
			secondary:	'#d6d6d6',
			secondaryd:	'#c6c6c6',
			secondaryt:	'rgba(180,180,180,0.8)',

			tertiaryl:	'#eee',
			tertiary:	'#ddd',
			tertiaryd:	'#ccc',
			tertiaryt:	'rgba(204,204,204,0.8)',

			accentl:	'#0bb8cb',
			accent:		'#00609a',
			accentt:	'rgba(0, 67, 113, 0.7)',
			accentxt:	'rgba(0, 67, 113, 0.4)',
			accentd:	'#004371',
			accentdt:	'rgba(0, 37, 93, 0.7)',

			green:		'#0c0',
			yellow:		'#ca0',
			redl:		'#900',
			red:		'#c00',
			redd:		'#faa',
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

	Themes = themes = {
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
					dynamicstyle.innerHTML = updatetheme(store[theme]);
					themecolor && themecolor.setAttribute('content', themes.get('status'));
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
	
	Hooks.set('ready', function () {
		if (preferences) {
			current = preferences.get(themes.saveto, 1) || 0;
			contrast = preferences.get(themes.saveto_contrast, 1) || 0;
		}

		set_theme_with_contrast(current);
		
		settingsuid = settings.adaaf('theme', function () {
			var iswhite = preferences.get(themes.saveto, 1);
			current = iswhite ? 1 : 0;
			set_theme_with_contrast(current);
			return [ iswhite ? 'white' : 'black' ];
		}, function () {
			preferences.set(themes.saveto, preferences.get(themes.saveto, 1) ? 0 : 1);
		}, 'icontheme');

		settingsuid = settings.adaaf('contrast', function () {
			var ishigh = preferences.get(themes.saveto_contrast, 1);
			contrast = ishigh ? 1 : 0;
			set_theme_with_contrast(current);
			return [ ishigh ? 'high' : 'low' ];
		}, function () {
			preferences.set(themes.saveto_contrast, preferences.get(themes.saveto_contrast, 1) ? 0 : 1);
		}, 'iconbrightness7');
	});
	Hooks.set('viewready', function (args) {
		// TODO replace these everywhere with longer variables -_-
		K = softkeys.K, // key names
		P = softkeys.P; // presets

		if (Webapp.is_at_home()) {
			softkeys.add({ n: 'Theme',
				k: 'i',
				ctrl: 1,
				alt: 1,
				i: 'icontheme',
				c: function (k, e) {
					themes.toggle();
					e && e.preventDefault();
				}
			});
		}
	});
})();