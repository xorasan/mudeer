//+ mfateeh axad axav fahras ishtaghal zaahir
var view;
;(function(){
	var index = {};
	view = {
		zaahir: function (name) {
			return view.axav() === name;
		},
		mfateeh: function (name) { // keys
			var element = index[name];
			if (element) return templates.keys(element);

			return false;
		},
		ishtaghal: function (name) {
			var level	= backstack.level			,
				element	= view.axad(name)			,
				keys	= templates.keys(element)	;

			Hooks.run('XPO.viewready', {
				XPO.name: name,
				XPO.element: element,
				XPO.keys: keys,
				XPO.level: level,
			});
		},
		axav: function (name, onlyelement) { // get
			if (!name) {
				for (var i in index) {
					if (!index[i].hidden) {
						return i;
					}
				}
				return;
			}

			var view;
			for (var i in index) {
				if (i == name)
					view = index[i];
				else if (!onlyelement)
					index[i].hidden = 1;
			}
			if (view) {
				if (!onlyelement) view.hidden = 0;
				return view;
			}
		},
		axad: function (name, onlyelement) { // get, deprecated
			view.axav(name, onlyelement);
		},
		fahras: function () { // index
			var elements = document.body.querySelectorAll('[data-XPO.view]');
			for (var i in elements) {
				if ( elements.hasOwnProperty(i) && elements[i].dataset.XPO.view ) {
					// hide all views except main while indexing
					if (elements[i].dataset.XPO.view !== 'XPO.main')
						elements[i].hidden = 1;

					index[ elements[i].dataset.XPO.view ] = elements[i];
				}
			}
			return index;
		},
	};
})();