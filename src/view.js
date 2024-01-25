var View, view;
;(function(){
	var index = {};
	View = view = {
		zaahir: function (name) { // is_active, deprecated
			return view.axav() === name;
		},
		is_active: function (name) {
			if (isarr(name)) {
				for (var i = 0; i < name.length; ++i) {
					if (this.zaahir(name[i])) return true;
				}
				return false;
			} else {
				return this.zaahir(name);
			}
		},
		mfateeh: function (name) { // dom_keys
			var element = index[name];
			if (element) return templates.keys(element);

			return false;
		},
		ishtaghal: function (name, uid) { // run, deprecated
			var level	= backstack.level			,
				exists	= View.get_element(name)	;

			if (isundef(exists)) {
				$.log.w('View not found: "'+name+'"');
			} else {
				var element	= view.get(name)			,
					keys	= templates.keys(element)	;
				Hooks.run('viewready', { // TODO rename to view-ready
					name: name,
					uid: uid,
					element: element,
					keys: keys,
					level: level,
				});
			}
		},
		get_element: function (name) { // get dom element of a view
			return this.get(name, 1);
		},
		get_uid: function () {
			if (Backstack.states.view) {
				return Backstack.states.view.uid;
			}
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
			return view.axav(name, onlyelement);
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
	
	View.get		= View.axav;
	View.run		= View.ishtaghal;
	View.dom_keys	= View.mfateeh;

	Hooks.set('backstackview', function (args) {
		var name, uid;
		if (isstr(args)) {
			name = args;
		} else if (args) {
			name = args.name;
			uid = args.uid;
		}
		Webapp.dimmer();
		Softkeys.clear();
		Softkeys.P.empty();
		Softkeys.set(K.sr, function () {
			Hooks.run('back');
		}, 0, 'iconarrowback');
		View.run(name, uid);
		Softkeys.showhints();
		return 1; // stop propagation
	});


})();