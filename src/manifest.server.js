;(function(){
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
Network.get('manifest', 'read', function (response) {
	get_manifest_as_json(function (manifest) {
		if (manifest) response.get(manifest);
		response.finish();
	});
});
Web.during_init(function (done, queue) {
	Server.get('/manifest.json', function (req, res) {
		var path = Web.get_public_path();
		get_manifest_as_json(function (manifest) {
			var name = "APPNAME";
			if (manifest && manifest.name) {
				name = manifest.name;
			}

			Files.get.file(path+'manifest.json', function (data, err) {
				if (err) {
					$.log.s( err );
					res.sendStatus(404);
				} else if (data) {
					data = data.toString();
					res.setHeader('Last-Modified', new Date().toUTCString() );
					try {
						data = JSON.parse(data);
						data.name		= name;
						data.short_name	= name;
						
						res.json(data);
					} catch (ignore) {
						$.log.e( ignore );
						res.sendStatus(500);
					}
				}
			});
		});
	});
	
	done(queue);
});

})();