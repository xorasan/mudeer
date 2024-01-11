var Profile, profile, ISMMUBEENMAX = 48, TAGMAX = 15, HIKAAYAHMAX = 480; 
var profilelist;
;(function(){
	'use strict';

	var open_keys, maxba = {}, module_name = 'profile';
	/* WHY since most profile text props have almost the same dialog logic
	 * title, message, max, ..multiline
	 */
	var text_prop_logic = {
		name: ['username', 'User Name'],
		displayname: [0, 'Display Name'],
		lifestory: [0, 'Life Story', HIKAAYAHMAX, 1],
	};
	var is_text_prop_editable = function (uid) {
		return Object.keys(text_prop_logic).includes(uid);
	};
	var edit_text_prop_dialog = function (item) {
		var details = text_prop_logic[ item.uid ] || [];
		Hooks.run('dialog', {
			x: details[2] || ISMMUBEENMAX,
			multiline: details[3],
			c: function (k) {
				item.tafseel = k;
				Offline.add(module_name, {
					uid:		item.uid,
					value:		k,
					pending:	1,
				});
			},
			m: details[1],
			a: item.value,
			q: details[0] || item.uid
		});
	};
	function update_sidebar() { if (get_global_object().Sidebar) {
		if (Sessions.signedin()) {
			Sidebar.set({
				uid: module_name,
				title: translate( module_name ),
				icon: 'iconperson',
			});
		} else {
			Sidebar.remove(module_name);
		}
	} }
	
	Profile = profile = {
		/* TODO IMPORTANT
		 * replace by Offline storage completely
		 */
		maxba: function (uid, value) { // set cache
			if (arguments.length === 0 ) return maxba;

			maxba[uid] = value;
		},
		update: function () {
			var arr = maxba.profile || Object.keys(text_prop_logic);
			arr.forEach(function (o) {
				if (typeof o == 'string') o = { uid: o, value: '' };
				
				o.mowdoo3 = xlate(o.uid);
				o.tafseel = o.value;
					
				if (is_text_prop_editable(o.uid)) o.madad = xlate('taptochange');
		
				o.hifz = o.pending ? xlate('pending') : 'ixtaf';

				profilelist.set(o);
			});
		},
	};
	
	Offline.create(module_name, 0, {
		delay: -1, // never get from server, server uses broadcast for that
		keyvalue: 1
	});
	
	Hooks.set('sessionchange', function (signedin) {
		update_sidebar();
	});
	Hooks.set('ready', function () {
		var dom_keys = view.dom_keys(module_name);

		profilelist = List( dom_keys.list ).idprefix(module_name).listitem('profilekatab');
		
		profile.update(); // to maintain order

		profilelist.onpress = function (item, key, uid) {
			if (is_text_prop_editable(item.uid)) {
				edit_text_prop_dialog(item);
			}
		};
		Network.intercept(module_name, function (finish) {
			/* receive profile updates when signed in
			 * like with multiple sessions, if u make changes on another client
			 * this one should receive those changes
			 */
			finish( sessions.signedin() ? 1 : undefined );
		});
		Offline.response.get(module_name, function (response) {
			maxba.profile = response;
			profile.update();
//			profilelist.select();
		});

//		$.taxeer(module_name, function () { pager.intaxab(module_name, 1); }, 500);
	});
	Hooks.set('viewready', function (args) {
		if (args.name == module_name) {
			Webapp.header( ['Profile', 0, 'iconperson'] );
			softkeys.list.basic(profilelist);
			profilelist.select();
			Offline.get(module_name, 0, 0, Time.now());
		}
	});
	Hooks.set('restore', function (args) {
		if (view.is_active(module_name) && backstack.darajah === 1)
			innertext(tafawwaq, '');
	});
	
})();
