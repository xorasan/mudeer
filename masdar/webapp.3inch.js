//+ scrollto scrolltobottom isatbottom isattop scrolltotop itlaa3
var scrollingelement = function () {
	var darajah = backstack.darajah;
	if ([0, 1].includes(darajah)) {
		return document.scrollingElement;
	}
	if (darajah === 2) {
		return XPO.sheetui;
	}
	if (darajah === 3) {
		return XPO.dialogui;
	}
};
// to avoid errors over missing modules
var datepicker = datepicker || 0;
;(function(){
//	if ('onlargetextenabledchanged' in window)
//		onlargetextenabledchanged = function () { webapp.textsize(); };

	webapp.itlaa3 = function (text, time) {
		var element = XPO.itlaa3.firstElementChild;
		if (text) {
			if (text instanceof Array) {
				element.dataset.XPO.i18n = text[0];
				translate.update(XPO.itlaa3);
			} else {
				delete element.dataset.XPO.i18n,
				element.innerText = text;
			}
			XPO.itlaa3.hidden = 0;

			$.taxeer('XPO.itlaa3', function () {
				webapp.itlaa3();
			}, time||3000);
		} else {
			delete element.dataset.XPO.i18n,
			element.innerText = '',
			XPO.itlaa3.hidden = 1;
		}
	};
	webapp.taht3nsar = function (text, time, taht) { // below element
		taht = document.activeElement || taht;
		var element = XPO.taht3nsar.firstElementChild;
		if (text) {
			if (text instanceof Array) {
				element.dataset.XPO.i18n = text[0];
				translate.update(XPO.taht3nsar);
			} else {
				delete element.dataset.XPO.i18n,
				element.innerText = text;
			}
			XPO.taht3nsar.hidden = 0;
			if (taht) {
				var pos = getposition(taht);
				setcss(XPO.taht3nsar, 'top', (pos[1]-20)+'px');
				if (taht.dir == 'rtl') {
					setcss(XPO.taht3nsar, 'right');
					setcss(XPO.taht3nsar, 'left', pos[0]+'px');
				} else {
					setcss(XPO.taht3nsar, 'left');
					setcss(XPO.taht3nsar, 'right', innerwidth()-pos[0]-taht.offsetWidth+'px');
				}
			}

			$.taxeer('XPO.taht3nsar', function () {
				webapp.taht3nsar();
			}, time||3000);
		} else {
			delete element.dataset.XPO.i18n,
			element.innerText = '',
			XPO.taht3nsar.hidden = 1;
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
	hooks.set('XPO.closeall', function (darajah) {
		if (darajah === 3) {
			datepicker && datepicker.hide();
			dialog.hide();
			webapp.blur();
		}
		if (darajah === 2) sheet.hide(), webapp.blur();
		if (darajah === 1) view.axad('XPO.main'), webapp.blur();
		if (darajah === 0)
			webapp.itlaa3( translate('XPO.exiting') ),
			$.taxeer('XPO.exit', function () {
				webapp.exit();
			});
	});
	hooks.set('XPO.restore', function (darajah) {
		if (darajah === 3) webapp.dimmer(600);
		if (darajah === 2) webapp.dimmer(400);
		if (darajah === 1) webapp.dimmer();
		if (darajah === 0) webapp.header(), webapp.dimmer();
	});
	hooks.set('XPO.backstackdialog', function (args) {
		var date = 0;
		if (datepicker && args instanceof HTMLElement) date = 1;

		webapp.dimmer(600);
		softkeys.clear();
		softkeys.set(K.sl, function () {
			if (date) datepicker.okay && datepicker.okay(args);
			else dialog.okay && dialog.okay();
		}, 0, 'XPO.icondone');
		softkeys.set(K.sr, function () {
			if (date) datepicker.cancel && datepicker.cancel();
			else dialog.cancel && dialog.cancel();
		}, 0, 'XPO.iconclose');

		if (date) datepicker.show(args);
		else dialog.show(args);
	});
	hooks.set('XPO.backstacksheet', function (args) {
		webapp.dimmer(400);
		softkeys.clear();
		if (args.XPO.callback || args.c) {
			softkeys.set(K.sl, function () {
				sheet.okay && sheet.okay();
			}, 0, 'XPO.icondone');
		}
		softkeys.set(K.sr, function () {
			sheet.cancel && sheet.cancel();
		}, 0, 'XPO.iconarrowback');
		sheet.show(args);
		softkeys.showhints();
	});
	hooks.set('XPO.backstackview', function (name) {
		webapp.dimmer();
		softkeys.clear();
		softkeys.P.empty();
		softkeys.set(K.sr, function () {
			hooks.run('XPO.back');
		}, 0, 'XPO.iconarrowback');
		view.ishtaghal(name);
		softkeys.showhints();
		return 1; // stop propagation
	});
	hooks.set('XPO.backstackmain', function (name) {
		softkeys.clear();
		softkeys.P.empty();
		view.ishtaghal('XPO.main');
	});
	hooks.set('XPO.ready', function () {
		settings.adaaf('XPO.animations', function () {
			var animationsoff = preferences.get(15, 1);
			if (animationsoff) {
				delete document.body.dataset.XPO.animations;
				setcss(document.firstElementChild, 'scrollBehavior');
			}
			else {
				document.body.dataset.XPO.animations = 1;
				setcss(document.firstElementChild, 'scrollBehavior', 'smooth');
			}
			return [animationsoff ? 'XPO.off' : 'XPO.on'];
		}, function () {
			if (preferences.get(15, 1)) {
				preferences.set(15, 0);
			}
			else {
				preferences.set(15, 1);
			}
		});
	});

})();