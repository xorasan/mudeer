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
				Softkeys.add({ n: 'Select',
					k: K.en,
					c: function (k, e) {
						if (LV.element.dataset.focussed) {
							LV.press(K.en);
							e && e.preventDefault();
						}
					}
				});
				Softkeys.set(K.up, function (k, e) {
					if (LV.element.dataset.focussed) {
						LV.up();
						e && e.preventDefault();
					}
				});
				Softkeys.set(K.dn, function (k, e) {
					if (LV.element.dataset.focussed) {
						LV.down();
						e && e.preventDefault();
					}
				});
				Softkeys.add({
					k: K.rt,
					c: function (k, e) {
						if (LV.element.dataset.focussed) {
							LV.right();
							e && e.preventDefault();
						}
					},
				});
				Softkeys.add({
					k: K.lf,
					c: function (k, e) {
						if (LV.element.dataset.focussed) {
							LV.left();
							e && e.preventDefault();
						}
					},
				});
			} else {
				Softkeys.talaf([K.en, K.up, K.dn, K.rt, K.lf]);
			}
		},
	};
})();