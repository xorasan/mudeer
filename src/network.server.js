/* Web.adaaf
 * network.get( name, need, cb )
 * network.sync( ... )
 * 
 * json.get.name.need = value
 * json.sync.name.need = value
 * 
 * broadcast is very lightweight
 * 
 * mirror this on client side
 * you are able to listen for specific responses for your own module
 * you can add batch commands to be executed every 24h
 * */
var network_favors = {}, PRIMARY = 100, SECONDARY = 500, TERTIARY = 1000,
	network_batches = {};
[PRIMARY, SECONDARY, TERTIARY].forEach(function (favor) {
	network_favors[favor] = {
		intercession	: {},
		get				: {},
		sync			: {},
		upload			: {},
	};
});
var debug_network = 0;
var Network = network = {
	intercept: function (name, need, cb) {
		if (typeof need == 'function') cb = need, need = 0;
		need = need || 'default';

		if (debug_network) Cli.echo(' ^bright^Network~~ '+name+' intercept ^dim^'+need+'~~ ');

		var favor = network_favors[this._favor || SECONDARY];
		favor.intercession[ name ] = favor.intercession[ name ] || {};
		favor.intercession[ name ][ need ] = cb;
	},
	get: function (name, need, cb) {
		if (typeof need == 'function') cb = need, need = 0;
		need = need || 'default';

		if (debug_network) Cli.echo(' ^bright^Network~~ '+name+' get ^dim^'+need+'~~ ');

		var favor = network_favors[this._favor || SECONDARY];
		favor.get[ name ] = favor.get[ name ] || {};
		favor.get[ name ][ need ] = cb;
	},
	sync: function (name, need, cb) {
		if (typeof need == 'function') cb = need, need = 0;
		need = need || 'default';

		if (debug_network) Cli.echo(' ^bright^Network~~ '+name+' sync ^dim^'+need+'~~ ');

		var favor = network_favors[this._favor || SECONDARY];
		favor.sync[ name ] = favor.sync[ name ] || {};
		favor.sync[ name ][ need ] = cb;
	},
	upload: function (name, need, cb) {
		if (typeof need == 'function') cb = need, need = 0;
		need = need || 'default';

		if (debug_network) Cli.echo(' ^bright^Network~~ '+name+' upload ^dim^'+need+'~~ ');

		var favor = network_favors[this._favor || SECONDARY];
		favor.upload[ name ] = favor.upload[ name ] || {};
		favor.upload[ name ][ need ] = cb;
	},
	favor: function (favor) {
		var s = Object.assign({}, Network);
		s._favor = favor;
		return s;
	},
	batch: function (name, need, cb) {
		if (typeof need == 'function') cb = need, need = 0;
		need = need || 'default';
		network_batches[ name ] = network_batches[ name ] || {};
		network_batches[ name ][ need ] = cb;
	},
	batch_process: function () {
		setTimeout(function () {
//			$.log( 'network.batch_process' );
			var d = network_batches;
			for (var i in d) {
				if (d[i]) for (var h in d[i]) {
					isfun(d[i][h]) && d[i][h]();
				}
			}
			network.batch_process();
		}, 1 * 15 * 60 * 1000); // 15m for now, 24h later
	},
};
// time attached, verify & add new time
Network.favor(PRIMARY).intercept('network', 'time', function (response) {
	/*
	 * time is set only for perm and broadcast channels
	 * on-demand doesn't send time at all
	 * 
	 * setting time here helps because while the response for this request
	 * is being processed, if new items are added by someone else, this
	 * time will be before the creation dates of those new items and
	 * they'll get synced on the next request
	 * */
	if (response.value) response.extra.time = response.value || 0;
	else response.extra.time = 0;

	/*
	 * only return time if client says that it doesn't have time
	 * so that only broadcast channel can send out time in all other cases
	 * */
	if (!response.value || response.broadcast)
		response.intercept( new Date().getTime() );

	response.finish();
});
Web.add(function (done, queue, extra) {
	var payload		= extra.payload	;
	var obj			= extra.obj		;
	var queuesub	= $.queue()		;

	var response = function (donesub, name, need, value_from_client) {
		var rsp = {
			finish: function () {
				donesub(queuesub, extra);
			},
			consumed: function () {
				extra.consumed = 1; // handled consumed
				donesub(queuesub, extra);
			},
			get: function (valuex, value2, need2) {
				var h = need2 || need || 'default';
				obj.get					= obj.get			|| {};
				obj.get[ name ]				= obj.get[ name ]	|| {};
				if (value2 !== undefined) {
					obj.get[ name ][ h ] = obj.get[ name ][ h ] || {};
					obj.get[ name ][ h ][ valuex ] = obj.get[ name ][ h ][ valuex ] || {};
					obj.get[ name ][ h ][ valuex ] = value2;
				} else {
					obj.get[ name ][ h ] = valuex;
				}
				return rsp;
			},
			sync: function (valuex, value2, need2) {
				var h = need2 || need || 'default';
				obj.sync					= obj.sync		|| {};
				obj.sync[ name ]			= obj.sync[ name ]	|| {};
				if (value2 !== undefined) {
					obj.sync[ name ][ h ] = obj.sync[ name ][ h ] || {};
					obj.sync[ name ][ h ][ valuex ] = obj.sync[ name ][ h ][ valuex ] || {};
					obj.sync[ name ][ h ][ valuex ] = value2;
				} else {
					obj.sync[ name ][ h ] = valuex;
				}
				return rsp;
			},
			intercept: function (valuex, value2, need2) {
				var h = need2 || need || 'default';
				obj.intercession			= obj.intercession		|| {};
				obj.intercession[ name ]		= obj.intercession[ name ]	|| {};
				if (value2 !== undefined) {
					obj.intercession[ name ][ h ] = obj.intercession[ name ][ h ] || {};
					obj.intercession[ name ][ h ][ valuex ] = obj.intercession[ name ][ h ][ valuex ] || {};
					obj.intercession[ name ][ h ][ valuex ] = value2;
				} else {
					obj.intercession[ name ][ h ] = valuex;
				}
				return rsp;
			},
			upload: function (valuex, value2, need2) {
				var h = need2 || need || 'default';
				obj.upload				= obj.upload			|| {};
				obj.upload[ name ]		= obj.upload[ name ]	|| {};
				if (value2 !== undefined) {
					obj.upload[ name ][ h ] = obj.upload[ name ][ h ] || {};
					obj.upload[ name ][ h ][ valuex ] = obj.upload[ name ][ h ][ valuex ] || {};
					obj.upload[ name ][ h ][ valuex ] = value2;
				} else {
					obj.upload[ name ][ h ] = valuex;
				}
				return rsp;
			},
			need: function (name) {
				var rsp2 = Object.assign({}, rsp);
				rsp2.get = function (valuex, value2) {
					rsp.get(valuex, value2, name);
					return rsp2;
				};
				rsp2.sync = function (valuex, value2) {
					rsp.sync(valuex, value2, name);
					return rsp2;
				};
				rsp2.intercept = function (valuex, value2) {
					rsp.intercept(valuex, value2, name);
					return rsp2;
				};
				rsp2.upload = function (valuex, value2) {
					rsp.upload(valuex, value2, name);
					return rsp2;
				};
				return rsp2;
			},
			account: extra.account,
			time: extra.time,
			value: value_from_client,
			extra: extra,
			broadcast: !!payload.broadcast,
		};
		if (extra.files && extra.files.upload) {
			rsp.payload = extra.files.upload;
		}
		return rsp;
	};
	
	var arr = [], count = 0;
	
	var schedule = function (item, favor) { // priority
		for (var name in payload[item]) {
			if (favor[item][name]) {
				var needs = payload[item][name];
				for (var need in needs) {
					arr.push({
						name: name,
						need: need,
						value: needs[need],
					});
					queuesub.set(function (donesub) {
						var o = arr[count];
						count++;
						if (typeof favor[item][o.name][o.need] == 'function') {
							favor[item][o.name][o.need](
								response(donesub, o.name, o.need, o.value)
							);
						} else donesub(queuesub);
					});
				}
			}
		}
	};

	['intercession', 'get', 'sync', 'upload'].forEach(function (item) {
		if (payload[item]) {
			[PRIMARY, SECONDARY, TERTIARY].forEach(function (favor) {
				schedule( item, network_favors[favor] );
			});
		}
	});
	
	queuesub.run(function () {
		done(queue, extra);
	});
});

Network.batch_process();

