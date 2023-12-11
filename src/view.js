var view;
;(function(){
	var index = {};
	view = {
		zaahir: function (name) { // is_active, deprecated
			return view.axav() === name;
		},
		is_active: function (name) {
			return this.zaahir(name);
		},
		mfateeh: function (name) { // keys
			var element = index[name];
			if (element) return templates.keys(element);

			return false;
		},
		ishtaghal: function (name) { // run, deprecated
			var level	= backstack.level			,
				element	= view.axad(name)			,
				keys	= templates.keys(element)	;

			Hooks.run('viewready', {
				name: name,
				element: element,
				keys: keys,
				level: level,
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
			var elements = document.body.querySelectorAll('[data-view]');
			for (var i in elements) {
				if ( elements.hasOwnProperty(i) && elements[i].dataset.view ) {
					// hide all views except main while indexing
					if (elements[i].dataset.view !== 'main')
						elements[i].hidden = 1;

					index[ elements[i].dataset.view ] = elements[i];
				}
			}
			return index;
		},
	};
	
	view.get = view.axav;
	view.run = view.ishtaghal;
	view.dom_keys = view.mfateeh;

})();