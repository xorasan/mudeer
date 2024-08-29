;(function(){
var module_name = 'manifest';
function get_manifest_as_json(cb) {
	var path = Web.get_public_path();
	Files.get.file(path+'manifest.w', function (data, err) {
		var manifest;
		if (err) {
			if (err.code == 'ENOENT') {
				Cli.echo(' creating manifest.w ');
				manifest = {
					name: "APPNAME",
				};
				Files.set.file(path+'manifest.w', Weld.encode_config(manifest) );
			} else {
				$.log.s( err );
			}
		} else if (data) {
			manifest = Weld.parse_config( data.toString() );
		}
		if (isfun(cb)) cb(manifest);
	});
}
Network.intercept(module_name, function (response) {
	if (response.account) { // signed in?
		MongoDB.query( Config.database.name, module_name, {
			$or: [ { updated: { $gte: response.time || 0 } }, { created: { $gte: response.time || 0 } } ]
		}, function (result) {
			var arr = [];
			result.rows.forEach(function (o) {
				arr.push(o);
			});
			if (arr.length) response.get(arr).consumed();
			else response.finish();
		});
	} else response.finish();
});
Network.sync(module_name, function (response) {
	var value = response.value;
	
	if (!response.account) { response.finish(); return; } // not signed in
	if (!value) { response.finish(); return; } // received nothing
	var arr = [];

	value.name = value.name || '';
	value.short_name = value.short_name || '';
	value.description = value.description || '';

	if (isstr(value.name)) {
		arr.push( uid_with_value('name', value.name) );
	}
	if (isstr(value.short_name)) {
		arr.push( uid_with_value('short_name', value.short_name) );
	}
	if (isstr(value.description)) {
		arr.push( uid_with_value('description', value.description) );
	}
	if (arr.length) {
		MongoDB.set(Config.database.name, module_name, arr, function (j) {
			Polling.finish_all([response.account.uid]);
			var out_arr = [];
			j.rows.forEach(function (o) {
				out_arr.push(o);
			});
			response.sync(out_arr).finish();
		});
	}
	else response.finish();
});
/*Web.during_init(function (done, queue) {
	Server.get('/manifest.json', function (req, res) {
	});
	
	done(queue);
});*/

})();