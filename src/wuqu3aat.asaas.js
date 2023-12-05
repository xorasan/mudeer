/*
 * used by mudeer-db
 * converts database.w to sql
 * manages mysql(...) server
 * creates, upgrades databases
 * 
 * */

var wuqu3aat = wuqu3aat || {};
;(function(){
	var Cli		= false,
		Repl	= false,
		Files	= false,
		Data	= false,
		Weld	= false;
	
	var _mod = {
		_cache: {},
		install: function (args) {
			
			_mod.init();
			
			var configw = '', conf = false;
			try {
				configw = Files.get.file('config.w');
			} catch (e) {
				conf = {
					import: {
						etc: {
							eng: [],
							lib: []
						},
						public: {
							eng: [],
							lib: []
						},
					},
				};
			}
			if (conf === false) {
				conf = Weld.parse(configw.toString());
				conf = Weld.config.parse(conf);
			}

			var dbw = '', dbjson = false;
			try {
				dbw = ( Files.get.file('database.w') || '' ).toString();
			} catch (e) {
				Cli.echo('database.w missing, try configure');
				return;
			}
			
			dbw = Weld.parse(dbw);
			dbjson = Weld.sql.parse(dbw);

			/*
			 * check if database.w exists, if not ask to conf first
			 * is database.w empty? show usage help
			 * ask for a database name, this is where the schema will initialize
			 * ask if upgrade is required, should it prompt or overwrite silent
			 * convert weld to json
			 * replace database name
			 * execute queries
			 * show results
			 * */

			if (_mod._cache.db === undefined) {
				var connection = Data.init({
					multiple: true,
					username: conf.database.username || '',
					password: conf.database.password || '',
					errcb: function (e) {
						if (e) {
							Cli.echo('make sure the username and password are correct');
							Cli.echo(e);
							Repl.prompt();
						} else {
							Cli.echo('database connection successfully established')
							_mod._cache.db = true;
							_mod.install(args);
						}
					}
				});

//				$.log.s( connection );

			} else {

				if ( args.keys.name === undefined ) {
					Cli.question('destination database name: ', args, 'name', Object.keys(dbjson)[0] );
				} else
				if ( args.keys.drop === undefined ) {
					Cli.question('drop old database? ', args, 'drop', 'no' );
				} else
				if ( args.keys.install === undefined ) {
					Cli.question('install new database? ', args, 'install', 'no' );
				} else
				if ( args.keys.save === undefined ) {
					Cli.question('save changes? ', args, 'save', 'no' );
				} else
				if ( typeof args.keys.name === 'string' ) {
					
					var gensql = function (result) {
						var sql = '';
						
						if (args.keys.install === true) {
							sql += Weld.sql.tosql(args.keys.name, dbjson, result)
								+'\nGRANT ALL PRIVILEGES ON `'+args.keys.name+'` TO'
								+' `'+conf.database.username+'`@`localhost` IDENTIFIED BY `'+conf.database.password+'`;\n'+sql;
						}
						if (args.keys.drop === true) {
							sql = 'drop database `'+args.keys.name+'`;\n'+sql;
						}
						
						if (args.keys.print || args.keys.debug) {
							$.log.s( sql );
						}
						
						// save yes, either install or drop
						if (args.keys.save === true && (args.keys.drop === true || args.keys.install === true)) {
							Cli.echo('saving changes...');
							Data.query(sql).then(function () {
								Cli.echo('changes saved.');
								Repl.prompt();
							});
						} else {
							Cli.echo('changes not saved.');
							Repl.prompt();
						}

					};
					
					if (args.keys.drop === true) {
						gensql(false);
					} else {
						Weld.sql.init(Data).gettables([args.keys.name], gensql);
					}
				} else
				{
					Repl.prompt();
				}
				
			}
		},
		init: function (repl, cli, files, weld, data) {
			Cli		= Cli	|| cli,
			Repl	= Repl	|| repl,
			Files	= Files	|| files;
			Weld	= Weld	|| weld;
			Data	= Data	|| data;
			
			return _mod;
		}
	};

	module.exports = _mod;
	wuqu3aat.asaas = _mod;

})();