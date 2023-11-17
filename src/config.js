var Config = {};
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
		return;
	}
})();
