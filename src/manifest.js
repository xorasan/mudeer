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
				uid: 'manifest',
			});
		}, 'iconsettings');
		Network.intercept(module_name, function (finish) {
			/* receive manifest updates when signed in
			 * like with multiple sessions, if u make changes on another client
			 * this one should receive those changes
			 */
			finish( sessions.signedin() ? 1 : undefined );
		});
		// This triggers on both get and sync
		Offline.response.get(module_name, function (response) {
			if (manifest_list && response && sheet.get_active_title() == sheet_name) {
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
	Hooks.set('sheet-ready', function (args, keys, l) { if (args.uid == module_name) {
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
				x: 2048,
				c: function (new_value) {
					temporary_answers[o.uid] = new_value;
				},
				m: fields[o.name],
				a: o.value,
				q: fields[o.name]
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
	Hooks.set('sheet-okay', function (args, keys, l) { if (args.uid == module_name) {
		l.adapter.each(function (o) {
			Offline.add(module_name, {
				uid:		o.name,
				value:		o.value,
				pending:	1,
			});
		});
	} });
	Hooks.set('sheet-cancel', function (args, keys, l) { if (args.uid == module_name) {
		// a way to forget temporary edits
		temporary_answers = {};
	} });
})();