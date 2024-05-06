;(function(){
	var manifest_list;
	var module_name = 'manifest';
	var sheet_name = 'Manifest';
	var fields = {
		name: 'App Name',
		short_name: 'Short Name',
		description: 'Description',
	}, temporary_answers = {};
	
	Offline.create(module_name, 0, {
		delay: -1, // never get from server, server uses broadcast for that
		keyvalue: 1
	});
	Hooks.set('ready', function () {
		Settings.adaaf(sheet_name, 0, function () {
			Hooks.run('sheet', {
				uid: module_name,
			});
		}, 'iconsettings');
		Network.intercept(module_name, function (finish) {
			/* receive manifest updates when signed in
			 * like with multiple sessions, if u make changes on another client
			 * this one should receive those changes
			 */
			finish( Sessions.signedin() ? 1 : undefined );
		});
		// This triggers on both get and sync
		Offline.response.get(module_name, function (response) {
			if (manifest_list && response && Sheet.get_active_title() == sheet_name) {
				response.forEach(function (o) {
					manifest_list.set({
						uid: o.uid,
						name: o.uid,
						value: isstr(temporary_answers[o.uid]) ? temporary_answers[o.uid] : o.value,
					});
				});
				manifest_list.select(0);
			}
		});
	});

	var manifest_dialog = 'edit-manifest';
	Hooks.set(dialog_ready, async function (args, k) { if (args.name == manifest_dialog) {
	} });
	Hooks.set(dialog_done, async function ({ name, uid }, k, answer) { if (name == manifest_dialog) {
		temporary_answers[uid] = answer;
		if (manifest_list) {
			manifest_list.set({
				uid: uid,
				value: answer,
			});
		}
	} });
	
	// INVESTIGATE sheet needs to be included before manifest for sheet_ready to work
	Hooks.set(sheet_ready, function (args, keys, l) { if (args.uid == module_name) {
		Sheet.set_title(sheet_name);
		manifest_list = l;
		Softkeys.list.basic(l);
		l.before_set = function (o) {
			o.title = fields[o.name];
			return o;
		};
		l.onpress = function (o) {
			// TODO special case for icon
			Hooks.run('dialog', {
				name: manifest_dialog,
				uid: o.uid,
				x: 2048,
				c: function (new_value) {
					temporary_answers[o.uid] = new_value;
				},
				m: fields[o.name],
				a: o.value,
				q: fields[o.name],
				multiline: 1,
			});
		};

		for (var i in fields) {
			manifest_list.set({
				uid: i,
				name: i,
			});
		}

		Offline.get(module_name, 0, 0, Time.now());
	} });
	Hooks.set(sheet_done, function (args, keys, l) { if (args.uid == module_name) {
		l.adapter.each(function (o) {
			Offline.add(module_name, {
				uid:		o.name,
				value:		o.value,
				pending:	1,
			});
		});
	} });
	Hooks.set(sheet_cancel, function (args, keys, l) { if (args.uid == module_name) {
		// a way to forget temporary edits
		temporary_answers = {};
	} });
})();