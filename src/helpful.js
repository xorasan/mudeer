var helpful;
;(function () {
	'use strict';
	
	helpful = {
		setclone: function (o) {
			var keys = o._keys,
				type = o.type,
				clone = o.dom,
				rawitem = o.options;

			if (type === 'XPO.helpfultip') {
				clone.dataset.XPO.uid = rawitem.XPO.uid;
				clone.firstElementChild.dataset.XPO.i18n = rawitem.XPO.i18n;
				var hiddentips = preferences.get(90, 1);
				if (!(hiddentips instanceof Array)) {
					hiddentips = [];
					preferences.set(90, '[]');
				}
				
				if (hiddentips.includes(rawitem.XPO.uid)) {
					clone.dataset.XPO.collapsed = 1;
				} else {
					clone.dataset.XPO.collapsed = 0;
				}
				keys.XPO.hfthide.onclick = 
				keys.XPO.hftshow.onclick = function () {
					var hiddentips = preferences.get(90, 1);
					if (!(hiddentips instanceof Array)) hiddentips = [];
					
					if (rawitem.XPO.uid) {
						if (!hiddentips.includes(rawitem.XPO.uid)) {
							hiddentips.push(rawitem.XPO.uid);
							clone.dataset.XPO.collapsed = 1;
						} else {
							hiddentips.splice( hiddentips.indexOf(rawitem.XPO.uid), 1 );
							clone.dataset.XPO.collapsed = 0;
						}
						preferences.set(90, JSON.stringify(hiddentips));
					}

					helpers.updatei18n(clone);
				};
			}
		},
		setupwidgets: function (parent) {
			var helpfultips = parent.querySelectorAll('[data-XPO.helpfultip]');
			helpfultips.forEach(function (helpfultip) {
				var clone = dom.getclone(tmpl.XPO.helpfultip, helpfultip, {
					XPO.uid: parseInt(helpfultip.dataset.XPO.helpfultip || 0),
					XPO.i18n: helpfultip.dataset.XPO.i18n,
				});
				helpfultip.replaceWith(clone);
			});
		},
	};
	Hooks.set('XPO.domsetclone', 'XPO.helpful', function (options) {
		helpful.setclone(options);
	});
	Hooks.set('XPO.domsetupwidgets', 'XPO.helpful', function (parent) {
		helpful.setupwidgets(parent);
	});
})();