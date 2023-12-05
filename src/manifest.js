;(function(){
	var manifest_list;
	var sheet_name = 'Manifest';
	var fields = {
		name: 'App Name',
		short_name: 'Short Name',
		description: 'Description',
	};
	
	Hooks.set('ready', function () {
		Settings.adaaf(sheet_name, 0, function () {
			open_list_sheet(sheet_name, function (l) {
				manifest_list = l;
				softkeys.list.basic(l);
				l.before_set = function (o) {
					o.title = fields[o.name];
					return o;
				};
				l.onpress = function (o) {
					// TODO special case for icon
					Hooks.run('dialog', {
						x: 2048,
						c: function (new_value) {
							o.value = new_value;
							l.set(o);
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

				Network.get('manifest', 'read', 1);
			}, function (l) {
				l.adapter.each(function (o) {
					$.log( o.name, o.value );
				});
			});
		}, 'iconsettings');
	});
	
	Network.response.get('manifest', 'read', function (response) {
		if (manifest_list && response && sheet.get_active_title() == sheet_name) {
			for (var i in response) {
				manifest_list.set({
					uid: i,
					name: i,
					value: response[i],
				});
			}
			manifest_list.select(0);
		}
	});
})();