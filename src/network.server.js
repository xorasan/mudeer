/* Web.add
 * Network.get( name, need, cb )
 * Network.sync( ... )
 * 
 * json.get.name.need = value
 * json.sync.name.need = value
 * 
 * broadcast is very lightweight
 * 
 * mirror this on client side
 * you are able to listen for specific responses for your own module
 * you can add batch commands to be executed every 24h
 * 
 * BIG IMPORTANT TODO transition Network over to Hooks.until
 * ALL addons should only use the Hooks based API <3 
 * 
 * the old API is deprecated here onwards (including client-side) 06 Jun 2024
 * this also means all Hooks subs will only need to remove their own hooks, which is super easy
 * instead of having to learn Network's API
 * */
network_favors = {}, PRIMARY = 'primary', SECONDARY = 'secondary', TERTIARY = 'tertiary', network_batches = {};
[PRIMARY, SECONDARY, TERTIARY].forEach(function (favor) {
	network_favors[favor] = {
		intercession	: {},
		get				: {},
		sync			: {},
		upload			: {},
	};
});
debug_network = 0;
Network = network = {
	fetch: async function ({ name, need, value, address }) {
		let payload = {};
		payload.get = payload.get || {};
		payload.get[name] = payload.get[name] || {};
		payload.get[name][need] = value;
		let res = await fetch(address, {
			method: 'POST',
			body: new URLSearchParams( { json: stringify(payload) } ),
		});
		
		let response = {};
		if (res.status != 200)
			response.err = 1;

	    if (res.headers.has('content-type') && res.headers.get('content-type').includes('application/octet-stream')) {
			let blob, file_name;
			try {
				blob = await res.blob();
				file_name = 'file-'+get_time_now()+'.bin';
				if (res.headers.has('content-disposition')) {
					file_name = res.headers.get('content-disposition').slice(22, -1);
				}

			} catch (e) {
				$.log( 'fetch error in blob' );
				throw new Error( e );
			}
			
			return { blob, file_name };
		} else { // else it must be json
			try {
				response = await res.json();
			} catch (e) {
				response.get = 1;
				response.error = e;
			}

			if (response.error) {
				throw new Error( response.error );
			} else {
				let out;
				if (response.get && response.get[name] && response.get[name][need]) {
					out = response.get[name][need];
				}
				return out;
			}
		}
	},
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
	let payload		= extra.payload	;
	let obj			= extra.obj		;
	let queuesub	= $.queue()		;

	function response(donesub, name, need, value_from_client) {
		var rsp = {
			finish: function () {
				donesub(queuesub, extra);
			},
			consumed: function (no_finish) { // also calls finish :)
				extra.consumed = 1; // handled consumed
				if (!no_finish)
					donesub(queuesub, extra);
			},
			get: function (valuex, value2, need2, name2) { // actual value, optional name+need
				var h = need2 || need || 'default', final_name = name;
				obj.get					= obj.get			|| {};
				if (name2) final_name = name2;
				obj.get[ final_name ]				= obj.get[ final_name ]	|| {};
				if (value2 !== undefined) {
					obj.get[ final_name ][ h ] = obj.get[ final_name ][ h ] || {};
					obj.get[ final_name ][ h ][ valuex ] = obj.get[ final_name ][ h ][ valuex ] || {};
					obj.get[ final_name ][ h ][ valuex ] = value2;
				} else {
					obj.get[ final_name ][ h ] = valuex;
				}
				return rsp;
			},
			sync: function (valuex, value2, need2, name2) {
				var h = need2 || need || 'default', final_name = name;
				obj.sync					= obj.sync		|| {};
				if (name2) final_name = name2;
				obj.sync[ final_name ]			= obj.sync[ final_name ]	|| {};
				if (value2 !== undefined) {
					obj.sync[ final_name ][ h ] = obj.sync[ final_name ][ h ] || {};
					obj.sync[ final_name ][ h ][ valuex ] = obj.sync[ final_name ][ h ][ valuex ] || {};
					obj.sync[ final_name ][ h ][ valuex ] = value2;
				} else {
					obj.sync[ final_name ][ h ] = valuex;
				}
				return rsp;
			},
			intercept: function (valuex, value2, need2, name2) {
				var h = need2 || need || 'default', final_name = name;
				obj.intercession			= obj.intercession		|| {};
				if (name2) final_name = name2;
				obj.intercession[ final_name ]		= obj.intercession[ final_name ]	|| {};
				if (value2 !== undefined) {
					obj.intercession[ final_name ][ h ] = obj.intercession[ final_name ][ h ] || {};
					obj.intercession[ final_name ][ h ][ valuex ] = obj.intercession[ final_name ][ h ][ valuex ] || {};
					obj.intercession[ final_name ][ h ][ valuex ] = value2;
				} else {
					obj.intercession[ final_name ][ h ] = valuex;
				}
				return rsp;
			},
			upload: function (valuex, value2, need2, name2) {
				var h = need2 || need || 'default', final_name = name;
				obj.upload				= obj.upload			|| {};
				if (name2) final_name = name2;
				obj.upload[ final_name ]		= obj.upload[ final_name ]	|| {};
				if (value2 !== undefined) {
					obj.upload[ final_name ][ h ] = obj.upload[ final_name ][ h ] || {};
					obj.upload[ final_name ][ h ][ valuex ] = obj.upload[ final_name ][ h ][ valuex ] || {};
					obj.upload[ final_name ][ h ][ valuex ] = value2;
				} else {
					obj.upload[ final_name ][ h ] = valuex;
				}
				return rsp;
			},
			name_need: function (name2, need) { // name optional
				need = need || 'default';
				name2 = name2 || name;
				var rsp2 = Object.assign({}, rsp);
				rsp2.get = function (valuex, value2) {
					rsp.get(valuex, value2, need, name2);
					return rsp2;
				};
				rsp2.sync = function (valuex, value2) {
					rsp.sync(valuex, value2, need, name2);
					return rsp2;
				};
				rsp2.intercept = function (valuex, value2) {
					rsp.intercept(valuex, value2, need, name2);
					return rsp2;
				};
				rsp2.upload = function (valuex, value2) {
					rsp.upload(valuex, value2, need, name2);
					return rsp2;
				};
				return rsp2;
			},
			need: function (need) {
				return rsp.name_need(0, need);
			},
			account: extra.account,
			time: extra.time,
			value: value_from_client || {},
			extra: extra,
			broadcast: !!payload.broadcast,
		};
		if (extra.files && extra.files.upload) {
			rsp.payload = extra.files.upload;
		}
		return rsp;
	};
	
	let arr = [], count = 0;
	
	function schedule(item, favor, favor_name) { // priority
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
							if (debug_network) $.log( 'network running', o.name, o.need, o.value );
							favor[item][o.name][o.need](
								response(donesub, o.name, o.need, o.value)
							);
						} else donesub(queuesub);
					});
				}
			}
		}
		
		let favor_suffix = '';
		if ([PRIMARY, TERTIARY].includes(favor_name)) {
			favor_suffix = '-'+favor_name;
		}
		
		let hook_ids = Hooks.get_ids('network-'+item+favor_suffix);
		if (hook_ids.length) {
			if (debug_network) $.log( 'hook_ids -> network-'+item+favor_suffix );
			for (let hook_id of hook_ids) {
				let [ name, need = 'default' ] = hook_id.split(',');
				if (debug_network) $.log( 'name, need', name, need );
				let handler = Hooks.get_handler('network-'+item, hook_id);
				if (payload[item] && payload[item][name] && payload[item][name][need]) {
					if (debug_network) $.log( 'payload', payload[item][name][need] );
					queuesub.set(async function (donesub) {
						if (debug_network) $.log( 'network running', name, need );

						let response_sent;
						let rsp = response(function () {
							response_sent = 1;
							return donesub.apply(queuesub, arguments);
						}, name, need, payload[item][name][need]);

						let result = await handler( rsp );
						if (!isundef(result)) {
							if (result instanceof File) {
								response_sent = 1;
								let res = extra.res, path = result.name;
								let file_name = path.split('/').pop();
								res.setHeader('content-disposition', `attachment; filename="${file_name}"`);
								res.sendFile(path, null, function (err) {
									if (err) {
										$.log( 'error sending file', path, err );
										if (!res.headersSent)
											res.sendStatus(404);
									}
								});
							} else {
								let channel = item;
								if (item == 'intercession') channel = 'intercept';
								rsp[channel](result);
							}
						}
						if (debug_network) $.log( 'network result', name, need, result );
						
						if (!response_sent) donesub(queuesub);
					});
				}
			}
		}
	};

	['intercession', 'get', 'sync', 'upload'].forEach(function (item) {
		if (payload[item]) {
			[PRIMARY, SECONDARY, TERTIARY].forEach(function (favor) {
				schedule( item, network_favors[favor], favor );
			});
		}
	});
	
	queuesub.run(function () {
		done(queue, extra);
	});
});

Network.batch_process();

