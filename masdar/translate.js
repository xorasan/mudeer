//+ saveto change update direction a3daad
var translate, taraajim = taraajim || {}, xlate;
;(function(){
	'use strict';

	var
	languages = Object.keys(taraajim),
	uglynames = {
		en: 'XPO.en',
		ar: 'XPO.ar',
		ur: 'XPO.ur',
	},
	defaultlang = 'en',
	donumbers = function (translation) {
		var language = translate.get();
		if (['ur', 'ar'].includes(language)) {
			return translation	.replace(/0/g, '٠')
								.replace(/1/g, '١')
								.replace(/2/g, '٢')
								.replace(/3/g, '٣')
								.replace(/4/g, '٤')
								.replace(/5/g, '٥')
								.replace(/6/g, '٦')
								.replace(/7/g, '٧')
								.replace(/8/g, '٨')
								.replace(/9/g, '٩')
								.replace(/%/g, '٪');
		} else {
			return translation;
		}
	},
	dodirection = function (parent, selector) {
		if (selector === undefined) selector = '[data-XPO.dir]';

		var items = (parent||document).querySelectorAll(selector);
		for (var i in items) {
			if (items.hasOwnProperty(i)) {
				var e = items[i];
				if (e) {
					var dir;
					if (e instanceof HTMLInputElement
					||	e instanceof HTMLTextAreaElement) {
						dir = translate.direction(e.value);
						e.dir = dir === 1 ? 'rtl' : 'ltr';
						listener(e, ['focus', 'input'], function () {
							dir = translate.direction(this.value);
							this.dir = dir === 1 ? 'rtl' : 'ltr';
						});
					} else {
						if (e.dataset.XPO.dir === 'XPO.rtl') { // force rtl
							dir = 'rtl';
						} else if (e.dataset.XPO.dir === 'XPO.ltr') { // force ltr
							dir = 'ltr';
						} else {
							dir = translate.direction(e.innerText);
						}
						if (e.dataset.XPO.dir == 'XPO.parent') { // apply to parent
							e.parentElement.dir = dir === 1 ? 'rtl' : 'ltr';
						} else {
							e.dir = dir === 1 ? 'rtl' : 'ltr';
						}
					}
				}
			}
		}
	};
	
	translate = function (alias) {
		var str = '';
		var language = translate.get();
		if (language && taraajim[language]) {
			if (taraajim[language][alias]) 
				str = taraajim[language][alias];
		}
		
		if (str === '') {
			if (taraajim['en'] && taraajim['en'][alias]) 
				str = taraajim['en'][alias];
		}
		
		var args = arguments;
		if (args.length > 1) {
			for (var i = 0; i < args.length; ++i) {
				str = str.replace( new RegExp('\%'+(i+1), 'g'), args[i+1] );
			}
		}
		
		if (str === '') str = alias || '';

		str = donumbers(str);

		return '' + str;
	};
	translate.get = function () {
		return preferences.get(translate.saveto) || defaultlang;
	};
	translate.set = function (language) {
		preferences.set(translate.saveto, language);
	};
	translate.saveto = 25;
	translate.change = function (language) {
		language = language || defaultlang;
		if (['ur', 'ar'].includes(language)) {
			document.body.dir = 'rtl';
		} else {
			document.body.dir = 'ltr';
		}
		
		Hooks && Hooks.run('XPO.translateupdate');
		translate.set(language);
		
		translate.update();
	};
	translate.a3daad = function (str) {
		return donumbers(str);
	};
	translate.update = function (parent) {
		var items = (parent||document).querySelectorAll('[data-XPO.i18n]');
		for (var i in items) {
			if (items.hasOwnProperty(i)) {
				var e = items[i];
				if (e) {
					var dataset = e.dataset;
					var i18n = dataset.XPO.i18n;
					if (i18n !== '') {
						var translation = translate(i18n);
						
						translation = donumbers(translation);
						
						if (e instanceof HTMLInputElement
						||	e instanceof HTMLSelectElement
						||	e instanceof HTMLTextAreaElement) {
							e.placeholder = translation;
						} else {
							e.innerText = translation;
						}
					}
				}
			}
		}
		dodirection(parent);
		dodirection(parent, 'input');
		dodirection(parent, 'textarea');
	};
	/*
	 * detect language direction, 0-ltr, 1-rtl, 2-mixed
	 * */
	translate.direction = function (text) {
		text = text || '';
		var ltr = text.match(/[a-zA-Z]+/),
			rtl = text.match(/[ا-ي]+/);
		
		if (rtl) return 1;
		if (ltr) return 0;
		return 2;
	};

	Hooks.set('XPO.ready', function () {
		translate.change( translate.get() );
		
		settings.adaaf('XPO.language', function () {
			var language = translate.get();
			if (language) return translate( uglynames[language]||'' );
		}, function () {
			var language = translate.get();
			var index = languages.indexOf( language );
			if (index < languages.length-1)
				++index;
			else
				index = 0;

			translate.change(languages[index]);
		});
	});
	
	xlate = translate;
})();