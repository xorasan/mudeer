var Themes, themes, debug_themes = 0;
;(function(){
	var K, P, settingsuid, settings_contrast_uid, current = 0, contrast = 0;
	
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

			primaryl:	'#0e0e0e',
			primary:	'black',
			primaryd:	'#070707',
			primaryt:	'rgba(0,0,0,0.8)', // perfect transparent level
			primaryxt:	'rgba(0,0,0,0.4)',
			primaryxxt:	'rgba(0,0,0,0.2)',

			secondaryl:	'#353535',
			secondary:	'#333',
			secondaryd:	'#252525',
			secondaryxd:'#151515',
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

			greenxxd:	'#030',
			greenxd:	'#050',
			greend:		'#080',
			green:		'#0b0',
			greenl:		'#0d0',
			greenxl:	'#0f0',

			yellowxxd:	'#310',
			yellowxd:	'#530',
			yellowd:	'#970',
			yellow:		'#b90',
			yellowl:	'#ec0',
			yellowxl:	'#fd0',

			redxxd:		'#300',
			redxd:		'#500',
			redd:		'#800',
			red:		'#b00',
			redl:		'#b88',
			redxl:		'#f99',
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

			primaryl:	'#e9e9e9',
			primary:	'#fff',
			primaryd:	'#f3f3f3',
			primaryt:	'rgba(255,255,255,0.8)', // perfect transparent level
			primaryxt:	'rgba(255,255,255,0.4)',
			primaryxxt:	'rgba(255,255,255,0.2)',

			secondaryl:	'#c6c6c6',
			secondary:	'#d6d6d6',
			secondaryd:	'#e1e1e1',
			secondaryxd:'#e5e5e5',
			secondaryt:	'rgba(180,180,180,0.8)',

			tertiaryl:	'#d9d9d9',
			tertiary:	'#ddd',
			tertiaryd:	'#ccc',
			tertiaryt:	'rgba(204,204,204,0.8)',

			accentl:	'#0bb8cb',
			accent:		'#00609a',
			accentt:	'rgba(112, 198, 255, 0.7)',
			accentxt:	'rgba(112, 198, 255, 0.4)',
			accentd:	'#004371',
			accentdt:	'rgba(0, 37, 93, 0.7)',

			greend:		'#0b0',
			green:		'#0c0',
			greenl:		'#0d0',

			yellowd:	'#b90',
			yellow:		'#ca0',
			yellowl:	'#db0',

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

			greend:		'#0b0',
			green:		'#0c0',
			greenl:		'#0d0',
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
			accentt:	'rgba(112, 198, 255, 0.7)',
			accentxt:	'rgba(112, 198, 255, 0.4)',
			accentd:	'#004371',
			accentdt:	'rgba(0, 37, 93, 0.7)',

			greend:		'#0b0',
			green:		'#0c0',
			greenl:		'#0d0',
			yellow:		'#ca0',
			redl:		'#900',
			red:		'#c00',
			redd:		'#faa',
		},
	};

	function calc_current_theme() {
		let mode = Preferences.get(Themes.saveto, 1);
		if (debug_themes) $.log.w( 'calc_current_theme', mode );

		let theme = 0;
		if ( !mode ) {
			let dark_theme_query = window.matchMedia('(prefers-color-scheme: dark)');
			theme = dark_theme_query.matches ? 0 : 1;
		} else if ( mode == 1 ) { // white
			theme = 1;
		} else if ( mode == 2 ) { // black
			theme = 0;
		}
		return theme;
	}
	function set_theme_with_contrast(theme) {
		if (debug_themes) $.log.w( 'calc_current_theme', theme );

//		if (contrast) { // high
//			if ( theme ) { // white
//				themes.set(3);
//			} else { // black
//				themes.set(2);
//			}
//		} else { // low
			if ( theme == 1 ) { // white
				Themes.set(1);
			} else if ( theme == 0 ) { // black
				Themes.set(0);
			}
//		}
		Hooks.run('themes-set', Themes.get_current_theme());
	}
	function on_theme_change() {
		current = calc_current_theme();
		set_theme_with_contrast(current);
	}

	Themes = themes = {
		get_store: () => { return store },
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
		 * assumes theme is key, and key is value and set it into the current theme
		 * 
		 * +if key and value are also provided
		 * inside a store.theme, set a key to value
		 * */
		set: function (theme, key, value) {
			if (debug_themes) $.log.w( 'Themes set', theme );
			var arglen = arguments.length;
			if (arglen === 0) {
				Themes.set(current);
			}

			if (arglen === 1) {
				if (store[theme]) {
					dynamicstyle.innerHTML = updatetheme(store[theme]);
					themecolor && themecolor.setAttribute('content', Themes.get('status'));
					Hooks.run('themes-on-change', theme);
				}
			}

			if (arglen === 2) {
				store[current] = store[current] || {};
				store[current][theme] = key;
			}
			
			if (arglen === 3) {
				store[theme] = store[theme] || {};
				store[theme][key] = value;
			}

			return Themes;
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
		get_current_theme: function () {
			return store[current];
		},
		toggle: function () {
			if (debug_themes) $.log.w( 'Themes toggle', current );
			current = calc_current_theme();
			set_theme_with_contrast(current);
			Preferences.set(Themes.saveto, current);
			settings.jaddad(settingsuid);
			// TODO update settings entry
		},
	};
	
	function darken_hex_color(hexColor, threshold = 180, factor = 0.7) {
		// Convert hex to RGB
		const r = parseInt(hexColor.slice(1, 3), 16);
		const g = parseInt(hexColor.slice(3, 5), 16);
		const b = parseInt(hexColor.slice(5, 7), 16);
	
		// Calculate luminance
		const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
	
		// Darken if above threshold
		if (luminance > threshold) {
			const darkenedR = Math.round(r * factor);
			const darkenedG = Math.round(g * factor);
			const darkenedB = Math.round(b * factor);
	
			// Convert back to hex
			const darkenedHex = `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
	
			return darkenedHex;
		}
	
		// Return original color if below threshold
		return hexColor;
	}
	Themes.darken_hex_color = darken_hex_color;

	function brighten_hex_color(hexColor, threshold = 180, factor = 0.7) {
		// Convert hex to RGB
		const r = parseInt(hexColor.slice(1, 3), 16);
		const g = parseInt(hexColor.slice(3, 5), 16);
		const b = parseInt(hexColor.slice(5, 7), 16);
	
		// Calculate luminance
		const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
	
		// Darken if above threshold
		if (luminance < threshold) {
			const darkenedR = Math.round(r / factor);
			const darkenedG = Math.round(g / factor);
			const darkenedB = Math.round(b / factor);

			// Convert back to hex
			const darkenedHex = `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
	
			return darkenedHex;
		}

		// Return original color if below threshold
		return hexColor;
	}
	Themes.brighten_hex_color = brighten_hex_color;

	function generate_predictable_color(text = '') {
		var hash = 0;
		for (var i = 0; i < text.length; i++) {
			hash = text.charCodeAt(i) + ((hash << 5) - hash);
			hash &= hash; // fix for potential negative hash values
		}

		return '#' + ('00000' + (hash & 0xFFFFFF).toString(16)).slice(-6).toUpperCase();
	}
	Themes.generate_predictable_color = generate_predictable_color;

	Hooks.set('ready', function () {
		if (Preferences) {
			current = calc_current_theme();
			contrast = Preferences.get(Themes.saveto_contrast, 1) || 0;
		}

		set_theme_with_contrast(current);

		let dark_theme_query = window.matchMedia('(prefers-color-scheme: dark)');
		listener(dark_theme_query, 'change', on_theme_change);
		
		settingsuid = Settings.adaaf('theme', function () {
			let mode = Preferences.get(Themes.saveto, 1);
			let title = 'system';
				 if (mode == 1) title = 'bright';
			else if (mode == 2) title = 'dark'	;

			current = calc_current_theme();
			set_theme_with_contrast(current);

			return [ title ];
		}, function () {
			let mode = Preferences.get(Themes.saveto, 1);
			if (mode == 0) { // system
				mode = 1;
			} else if (mode == 1) { // bright
				mode = 2;
			} else if (mode == 2) { // dark
				mode = 0;
			} else { // system
				mode = 0;
			}

			Preferences.set(Themes.saveto, mode);
		}, 'icontheme');

//		settings_contrast_uid = settings.adaaf('contrast', function () {
//			var ishigh = preferences.get(themes.saveto_contrast, 1);
//			contrast = ishigh ? 1 : 0;
//			set_theme_with_contrast(current);
//			return [ ishigh ? 'high' : 'low' ];
//		}, function () {
//			preferences.set(themes.saveto_contrast, preferences.get(themes.saveto_contrast, 1) ? 0 : 1);
//		}, 'iconbrightness7');
	});
	Hooks.set('viewready', function (args) {
		// TODO replace these everywhere with longer variables -_-
		K = Softkeys.K, // key names
		P = Softkeys.P; // presets

//		if (Webapp.is_at_home()) {
//			Softkeys.add({ n: 'Theme',
//				k: 'i',
//				ctrl: 1,
//				alt: 1,
//				i: 'icontheme',
//				c: function (k, e) {
//					themes.toggle();
//					e && e.preventDefault();
//				}
//			});
//		}
	});
})();