//+ list basic
;(function(){
	var softkeys_list_debug = 0;
	Softkeys.list = {
		/*
		 * if LV is undefined, it clears these keys
		 * */
		basic: function (LV) {
			if (softkeys_list_debug) $.log.w('softkeys.list.basic', LV);
			if (LV) {
				Softkeys.add(LV.select_sk || { n: 'Select',
					k: K.en,
					i: 'ixtaf',
					c: function (k, e) {
						if (LV && LV.element && LV.element.dataset.focussed) {
							LV.press(K.en);
							e && e.preventDefault();
						}
					}
				});
				Softkeys.add({
					k: K.up,
					h: 1,
					c: function (k, e) {
						if (LV && LV.element && LV.element.dataset.focussed) {
							LV.up();
							e && e.preventDefault();
						}
					}
				});
				Softkeys.add({
					k: K.dn,
					h: 1,
					c: function (k, e) {
						if (LV && LV.element && LV.element.dataset.focussed) {
							LV.down();
							e && e.preventDefault();
						}
					}
				});
				Softkeys.add({
					k: K.rt,
					h: 1,
					c: function (k, e) {
						if (LV && LV.element && LV.element.dataset.focussed) {
							LV.right();
							e && e.preventDefault();
						}
					},
				});
				Softkeys.add({
					k: K.lf,
					h: 1,
					c: function (k, e) {
						if (LV && LV.element && LV.element.dataset.focussed) {
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