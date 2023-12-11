//+ list basic
;(function(){
	var softkeys_list_debug = 0;
	softkeys.list = {
		/*
		 * if LV is undefined, it clears these keys
		 * */
		basic: function (LV) {
			if (softkeys_list_debug) $.log.w('softkeys.list.basic', LV);
			if (LV) {
				softkeys.set(K.en, function (k, e) {
					if (LV.element.dataset.focussed) {
						LV.press(K.en);
						e && e.preventDefault();
					}
				});
				softkeys.set(K.up, function (k, e) {
					if (LV.element.dataset.focussed) {
						LV.up();
						e && e.preventDefault();
					}
				});
				softkeys.set(K.dn, function (k, e) {
					if (LV.element.dataset.focussed) {
						LV.down();
						e && e.preventDefault();
					}
				});
				softkeys.set(K.rt, function (k, e) {
					if (LV.element.dataset.focussed) {
						LV.right();
						e && e.preventDefault();
					}
				});
				softkeys.set(K.lf, function (k, e) {
					if (LV.element.dataset.focussed) {
						LV.left();
						e && e.preventDefault();
					}
				});
			} else {
				softkeys.talaf([K.en, K.up, K.dn, K.rt, K.lf]);
			}
		},
	};
})();