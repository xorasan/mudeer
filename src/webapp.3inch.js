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

	Webapp.taht3nsar = function (text, time, taht) { // below element
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
	Webapp.scrollto = function (element) {
		var se = scrollingelement();
		se.scrollTop = 0 + (element ? element.offsetTop - (se.clientHeight / 4) : 0);
	};
	Webapp.scrolltotop = function () {
		var se = scrollingelement();
		se.scrollTop = 0;
	};
	Webapp.scrolltobottom = function () {
		var se = scrollingelement();
		se.scrollTop = se.scrollHeight - se.clientHeight;
		return se.scrollTop;
	};
	Webapp.isatop = function () {
		var se = scrollingelement();
		return Math.floor(se.scrollTop) === 0;
	};
	Webapp.isatbottom = function () {
		var se = scrollingelement();
		return Math.floor(se.scrollTop) === se.scrollHeight - se.clientHeight;
	};
	Hooks.set('closeall', function (level) {
		if (level === 3) {
			datepicker && datepicker.hide();
			dialog.hide();
			Webapp.blur();
		}
		if (level === 2) sheet.hide(), Webapp.blur();
		if (level === 1) view.get('main'), Webapp.blur();
		if (level === 0)
			Webapp.status( translate('exiting') ),
			$.taxeer('exit', function () {
				Webapp.exit();
			});
	});
	Hooks.set('restore', function (level) {
		if (level === 3) Webapp.dimmer(600);
		if (level === 2) Webapp.dimmer(400);
		if (level === 1) Webapp.dimmer();
		if (level === 0) Webapp.header(), Webapp.dimmer();
	});
	Hooks.set('backstackmain', function (name) {
		Softkeys.clear();
		Softkeys.P.empty();
		View.run('main');
	});
	Hooks.set('ready', function () {
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