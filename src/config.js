Config = {};
;(function(){
	var configw;
	try {
		configw = Files.get.file('config.w').toString();
		Config = Weld.parse_config( configw );
	} catch (e) {
		$.log( e );
		// TODO make error specific and more helpful
		$.log(' '+process.cwd()+' ');
		$.log(' config.w not found, try mudeer-create ');
	}
	Config = Config || {};
	if (process.env.DEWAAN_MONGO_DB) {
		Config.database.name = process.env.DEWAAN_MONGO_DB;
	}
	Cli.echo(' ^bright^Database~~ '+Config.database.name);
})();
