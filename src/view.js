var Views, View, view, debug_view = 0;
;(function(){
	var index = {};
	Views = View = view = {
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
		is_active_fully: function (name, uid) { // at proper level, with no sheets or dialogs
			// <= 1 because any view can run as the home view
			var yes = this.is_active(name) && Backstack.darajah <= 1;
			if (!isundef(uid)) {
				yes = this.get_uid() == uid;
			}
			return yes;
		},
		mfateeh: function (name) { // dom_keys
			var element = index[name];
			if (element) return Templates.keys(element);

			return false;
		},
		run: async function (name, uid) {
			var level	= Backstack.level			,
				exists	= View.get_element(name)	;

			if (isundef(exists)) {
				$.log.w('View not found: "'+name+'"');
				let element = Views.get_element('not_found');
				if (element) {
					Views.get('not_found');
					Webapp.header([ 'Not Found', 0, 'iconclose' ]);
					let keys = Templates.keys(element);
					innertext(keys.path, location.pathname);
					if (get_global_object().Sidebar) {
						Sidebar.choose();
					}
				}
			} else {
				var element	= Views.get(name)			,
					keys	= Templates.keys(element)	;
				var out = {
					name: name,
					uid: uid,
					element: element,
					keys: keys,
					level: level,
				};

				if (debug_view) $.log.w('View ready', name, uid);
				Hooks.run('viewready', out); // TODO rename to view-ready
				Hooks.run('view-ready', out);

				if (View.is_active_fully(name, uid)) {
					if (debug_view) $.log.w('View before-init', name, uid);
					await Hooks.until('view-before-init', out);
				}
				if (View.is_active_fully(name, uid)) {
					if (debug_view) $.log.w('View init', name, uid);
					await Hooks.until('view-init', out); // view-init users should assume async behavior
				}
				if (View.is_active_fully(name, uid)) {
					if (debug_view) $.log.w('View loaded', name, uid);
					await Hooks.until('view-loaded', out);
				}
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
		index: function (parent) { // fahras
			var elements = (parent||document.body).querySelectorAll('[data-view]');
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
		expunge: function (parent) { // remove from index
			// parent can be an htm element or an array of view names

			let elements;
			if (parent instanceof HTMLElement || isundef(parent)) {
				elements = (parent||document.body).querySelectorAll('[data-view]');
			} else if (isarr(parent)) {
				elements = [];
				parent.forEach(function (o) {
					elements.push( document.body.querySelectorAll('[data-view="'+o+'"]') );
				});
			}
			elements.forEach(function (o) {
				delete index[ o.dataset.view ];
			});
		},
	};
	
	View.get		= View.axav;
	View.ishtaghal	= View.run;
	View.fahras		= View.index;
	View.dom_keys	= View.mfateeh;

	Hooks.set('backstackview', function (args) {
		var name, uid;
		if (isstr(args)) {
			name = args;
		} else if (args) {
			name = args.name || args.n;
			uid = args.uid || args.u;
		}
		Webapp.dimmer();
		Softkeys.clear();
		Softkeys.P.empty();
		Softkeys.set(K.sr, function () {
			Hooks.run('back');
		}, 0, 'iconarrowback');
		View.run(name, uid);
//		Softkeys.showhints();
		return 1; // stop propagation
	});


})();