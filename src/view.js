/* 
 * TODO new API should provide the View constructor
 * you should be able to do View({ name, element, title, icon, softkeys })
 * if no element, it'll create one, with Addons it'll autoremove on deactivation
 * if has title/icon, whenever the view is active, it'll set that as the Webapp.header
 * 
 * with the new API, softkeys can be added to the view and upon activation, it'll always restore them
 * .add_softkey // add or update
 * .remove_softkey
 * 
 */
var Views, View, view, debug_view = 0;
;(function(){
	let index = {}, requested;
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
			requested = { name, uid };
			
			var level	= Backstack.level			,
				exists	= View.get_element(name)	;

			if (isundef(exists)) {
				$.log.w('View not found: "'+name+'"');
				let element = Views.get_element('not_found');
				if (element) {
					Views.get('not_found');
					Webapp.header([ 'Not Found', 0, 'iconclose' ]);
					let keys = Templates.keys(element);
					innertext(keys.path, '...');
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
		get_requested: function () {
			return requested;
		},
		get_element: function (name) { // get dom element of a view
			if (isundef(name)) return 0;
			return this.get(name, 1);
		},
		get_uid: function () {
			if (Backstack.states.view) {
				return Backstack.states.view.uid;
			}
		},
		get: function (name, onlyelement) { // axav
			if (!name) {
				for (let i in index) {
					if (!index[i].hidden) {
						return i;
					}
				}
				return;
			}

			let view;
			for (let i in index) {
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
		index: function (parent) { // fahras, returns the newly indexed views
			let elements = (parent||document.body).querySelectorAll('[data-view]');
			let views_found = [];
			for (let i in elements) {
				if ( elements.hasOwnProperty(i) && elements[i].dataset.view ) {
					// hide all views except main while indexing
					if (elements[i].dataset.view !== 'main')
						elements[i].hidden = 1;

					let name = elements[i].dataset.view;

					index[ name ] = elements[i];
					push_if_unique( views_found, name );
				}
			}
			return views_found;
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
	
	Views.axav		= Views.get		;
	Views.ishtaghal	= Views.run		;
	Views.fahras	= Views.index	;
	Views.dom_keys	= Views.mfateeh	;

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
		Softkeys.add({ n: 'Back',
			k: K.sr,
			i: 'iconarrowback',
			c: function () {
				Hooks.run('back');
			},
		});
		Views.run(name, uid);
//		Softkeys.showhints();
		return 1; // stop propagation
	});


})();