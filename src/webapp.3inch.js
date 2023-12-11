//+ scrollto scrolltobottom isatbottom isattop scrolltotop itlaa3
var scrollingelement = function () {
	var darajah = backstack.darajah;
	if ([0, 1].includes(darajah)) {
		return document.scrollingElement;
	}
	if (darajah === 2) {
		return sheetui;
	}
	if (darajah === 3) {
		return dialogui;
	}
};
// to avoid errors over missing modules
var datepicker = datepicker || 0;
;(function(){
//	if ('onlargetextenabledchanged' in window)
//		onlargetextenabledchanged = function () { webapp.textsize(); };

	webapp.taht3nsar = function (text, time, taht) { // below element
		taht = document.activeElement || taht;
		var element = taht3nsar.firstElementChild;
		if (text) {
			if (text instanceof Array) {
				element.dataset.i18n = text[0];
				translate.update(taht3nsar);
			} else {
				delete element.dataset.i18n,
				element.innerText = text;
			}
			taht3nsar.hidden = 0;
			if (taht) {
				var pos = getposition(taht);
				setcss(taht3nsar, 'top', (pos[1]-20)+'px');
				if (taht.dir == 'rtl') {
					setcss(taht3nsar, 'right');
					setcss(taht3nsar, 'left', pos[0]+'px');
				} else {
					setcss(taht3nsar, 'left');
					setcss(taht3nsar, 'right', innerwidth()-pos[0]-taht.offsetWidth+'px');
				}
			}

			$.taxeer('taht3nsar', function () {
				webapp.taht3nsar();
			}, time||3000);
		} else {
			delete element.dataset.i18n,
			element.innerText = '',
			taht3nsar.hidden = 1;
		}
	};
	webapp.scrollto = function (element) {
		var se = scrollingelement();
		se.scrollTop = 0 + (element ? element.offsetTop - (se.clientHeight / 4) : 0);
	};
	webapp.scrolltotop = function () {
		var se = scrollingelement();
		se.scrollTop = 0;
	};
	webapp.scrolltobottom = function () {
		var se = scrollingelement();
		se.scrollTop = se.scrollHeight - se.clientHeight;
		return se.scrollTop;
	};
	webapp.isatop = function () {
		var se = scrollingelement();
		return Math.floor(se.scrollTop) === 0;
	};
	webapp.isatbottom = function () {
		var se = scrollingelement();
		return Math.floor(se.scrollTop) === se.scrollHeight - se.clientHeight;
	};
	hooks.set('closeall', function (darajah) {
		if (darajah === 3) {
			datepicker && datepicker.hide();
			dialog.hide();
			webapp.blur();
		}
		if (darajah === 2) sheet.hide(), webapp.blur();
		if (darajah === 1) view.axad('main'), webapp.blur();
		if (darajah === 0)
			webapp.itlaa3( translate('exiting') ),
			$.taxeer('exit', function () {
				webapp.exit();
			});
	});
	hooks.set('restore', function (darajah) {
		if (darajah === 3) webapp.dimmer(600);
		if (darajah === 2) webapp.dimmer(400);
		if (darajah === 1) webapp.dimmer();
		if (darajah === 0) webapp.header(), webapp.dimmer();
	});
	hooks.set('backstackdialog', function (args) {
		var date = 0;
		if (datepicker && args instanceof HTMLElement) date = 1;

		webapp.dimmer(600);
		softkeys.clear();
		softkeys.set(K.sl, function () {
			if (date) datepicker.okay && datepicker.okay(args);
			else dialog.okay && dialog.okay();
		}, 0, 'icondone');
		softkeys.set(K.sr, function () {
			if (date) datepicker.cancel && datepicker.cancel();
			else dialog.cancel && dialog.cancel();
		}, 0, 'iconclose');

		if (date) datepicker.show(args);
		else dialog.show(args);
	});
	hooks.set('backstacksheet', function (args) {
		webapp.dimmer(400);
		softkeys.clear();
		if (args.callback || args.c) {
			softkeys.set(K.sl, function () {
				sheet.okay && sheet.okay();
			}, 0, 'icondone');
		}
		softkeys.set(K.sr, function () {
			sheet.cancel && sheet.cancel();
		}, 0, 'iconarrowback');
		sheet.show(args);
		softkeys.showhints();
	});
	hooks.set('backstackview', function (name) {
		webapp.dimmer();
		softkeys.clear();
		softkeys.P.empty();
		softkeys.set(K.sr, function () {
			hooks.run('back');
		}, 0, 'iconarrowback');
		view.ishtaghal(name);
		softkeys.showhints();
		return 1; // stop propagation
	});
	hooks.set('backstackmain', function (name) {
		softkeys.clear();
		softkeys.P.empty();
		view.ishtaghal('main');
	});
	hooks.set('ready', function () {
		settings.adaaf('animations', function () {
			var animationsoff = preferences.get(15, 1);
			if (animationsoff) {
				delete document.body.dataset.animations;
				setcss(document.firstElementChild, 'scrollBehavior');
			}
			else {
				document.body.dataset.animations = 1;
				setcss(document.firstElementChild, 'scrollBehavior', 'smooth');
			}
			return [animationsoff ? 'off' : 'on'];
		}, function () {
			if (preferences.get(15, 1)) {
				preferences.set(15, 0);
			}
			else {
				preferences.set(15, 1);
			}
		}, 'iconplayarrow');
	});

})();