/*
 * intercession is used to add data from other modules in a request
 * 
 * 
 * it has 3 channels for communication with server
 * get		get something from the server immediately
 * 			
 * sync		sync changes, client -> server
 * 			uses .time to maintain sync between client & server
 * 			the response is empty
 * 			responds through broadcast
 * broadcast	listens for changes
 * 			returns on triggers like sync from you or others
 * 			always returns .time on success
 *
 * fetch	for unique requests using promises
 * 			this too triggers intercessions
 * 			it doesn't pile up with other requests
 * */
var Network, network, sessions = sessions || 0, debug_network = 0;
;(function(){
	'use strict';
	var 
//		address = 'http://localhost:'+Config.port+'/',
		address = location.protocol + '//' + location.host + location.pathname,
		buildexpired = false, offlinetime, module_name = 'network', module_title = 'Network',
		networkkeys;
	// TODO make a better address with ROOT support

	var error_log = function (v) { $.log.w( v ); };
	var has_disconnected = function (res) {
		// only mark online when really getting an ok result from server
		if (!res.err)
			setnetwork(1);
		// offline on errors
		else if (res.err === -300 || res.err > 300)
			setnetwork();
	};
	var setnetwork = function (on) {
		if (on) {
			// only update if it isn't already online
			if (offlinetime !== false) {
				offlinetime = false;
				preferences.pop('@0');
				Hooks.run('connection', true); // connection
				// cancel reconnection attempts
				$.taxeercancel('networkconnection');
			}
			setnotifybar();
		} else {
			// update time if it hasn't been marked offline yet
			if (offlinetime === false) {
				offlinetime = new Date().getTime();
				preferences.set('@0', offlinetime);
				Hooks.run('connection', offlinetime); // connection
				// handles reconnection attempts
				$.taxeer('networkconnection', function () {
					if (sessions) Network.get('network', 'connection');
				}, 15*1000);
			}
			
			// notify anyway
			setnotifybar( 'offlinesince' , offlinetime || '');
		}

	};
	var setnotifybar = function (v, t) {
		if (v) {
			$.taxeer('setnotifybar', function () {
				setdata(networkkeys.topic, 'i18n', v);
				setdata(networkkeys.time, 'time', t);
				time(networkui);
				xlate.update(networkui);
			}, t);
			networkui.hidden = 0;
		} else {
			networkui.hidden = 1;
		}
	};
	var sizeunits = function (num) {
		if (isnum( num )) {
			if (num >= (1024 * 1024 * 1024 * 1024))
				return (num / (1024 * 1024 * 1024 * 1024)).toFixed(1) + 'TB'; 

			if (num >= (1024 * 1024 * 1024))
				return (num / (1024 * 1024 * 1024)).toFixed(1) + 'GB'; 

			if (num >= (1024 * 1024))
				return (num / (1024 * 1024)).toFixed(1) + 'MB'; 

			if (num >= 1024)
				return (num / 1024).toFixed() + 'KB'; 
		}

		return '0';
	}
	var progressfn = function (loaded, total) {
		// show progress if bigger than 4KB
		if (total > 4 * 1024) {
			var percentage	=	sizeunits(loaded) +' / '+ sizeunits(total) +', '
							+	(((loaded / total) * 100).toFixed() || 0) + '%';

			webapp.status( percentage );
		}
	};
	var has_build_expired = function (response) {
		// build expired
		if (response.e$) {
//			$.log.s( 'e$' );
			buildexpired = 1;
			window.caches.delete('def').then(function(del) {
				webapp.dimmer(LAYERTOPMOST, xlate('appneedsreload'));
			});
			broadcast_finish();
			$.fetchcancel( 'get' );
			$.fetchcancel( 'sync' );
		}
	};
	async function handle_response(response) {
		['intercession', 'get', 'sync', 'upload'].forEach(async function (channel) {
			// Old API using Network
			for (var name in response[channel]) {
				if (network.channels[channel][name]) {
					var needs = response[channel][name];
					for (var need in needs) {
						if (isfun( network.channels[channel][name][need] )) {
							network.channels[channel][name][need](
								needs[need]
							);
						}
					}
				}
			}
			// New API using Hooks
			let favor_suffix = ''; // TODO add support for favors
			let hook_ids = Hooks.get_ids('network-'+channel+favor_suffix);
			if (hook_ids.length) {
				if (debug_network) $.log( 'hook_ids -> network-'+channel+favor_suffix );
				for (let hook_id of hook_ids) {
					let [ name, need = 'default' ] = hook_id.split(',');
					if (debug_network) $.log( 'name, need', name, need );
					let handler = Hooks.get_handler('network-'+channel, hook_id);
					if (response[channel] && response[channel][name] && response[channel][name][need]) {
						if (debug_network) $.log( 'response', response[channel][name][need] );
						let result = await handler( response[channel][name][need] );
						if (debug_network) $.log( 'network result', name, need, result );
					}
				}
			}
			// To allow channel level processing
			Hooks.run('response'+channel, response[channel]); // TODO deprecate
			Hooks.run('response-'+channel, response[channel]); // TODO deprecate
			Hooks.run('network-response-'+channel, response[channel]);
		});
	}

	var cachedkey, broadcast_state = 0, broadcast_delay = 500;
	var broadcast_process = function (payload, intercession) {
		if (!cachedkey || !broadcast_state) return;
		
		if ($.fetchchannels.broadcast
		&&	$.fetchchannels.broadcast.active) return;

		if (broadcast_state == 2) { // recovered from error
			broadcast_state = 1;
		}

		payload = payload || {};

		payload = Object.assign(payload, {
			broadcast		:	1			, // synced before
			e$				:	BUILDNUMBER	, // build number
		});

		if (intercession) payload = Object.assign(payload, intercession);

		update_broadcast_internals();

		$.log.w( module_title, 'Broadcast', payload );
		$.fetch( address, 'json='+enc( JSON.stringify(payload) ), 'broadcast', progressfn, 3*60*1000 )
		.then(function (res) {
			if (res.err) {
				// don't mark offline, this channel is designed to timeout! :)
				broadcast_delay = 1 * 15 * 1000; // 15s
				broadcast_state = 2; // error
				update_broadcast_internals();
			} else {
				has_disconnected(res);
				var response = {};
				try {
					response = JSON.parse( (res||{}).body );
				} catch (e) {
					response.broadcast = 1;
					response.error = 1;
				}
				
				if (!response.error) broadcast_delay = 500;
				
				if (has_build_expired(response)) return;
				
				handle_response(response);
			}
			
			$.taxeer('networkbroadcast', function () {
				intercession_process(function (objects) {
					broadcast_process({}, objects);
				}, 'broadcast');
			}, broadcast_delay);
		});
	};
	var broadcast_start = function () {
		$.taxeer('broadcast_start', function () {
			broadcast_state = 1;
			update_broadcast_internals();
			intercession_process(function (objects) {
				broadcast_process({}, objects);
			}, 'broadcast');
		}, 1000);
	};
	var broadcast_finish = function () {
		broadcast_state = 0;
		$.fetchcancel('broadcast');
		update_broadcast_internals();
	};
	var update_broadcast_internals = function () { if (Network.set_internal) {
		var state = 'Asleep';
		if (broadcast_state) {
			if (broadcast_state == 2)
				state = 'Error, will try again in '+( broadcast_delay/1000 )+'s...';
			else
				state = 'Listening after a delay of '+( broadcast_delay/1000 )+'s...';
		}
		Network.set_internal({ uid: 'broadcast', name: 'Broadcast', state });
	} };

	var pending_gets = {}; // pending requests
	var fulfill_gets = function (payload, intercession) { // flush pending get requests
		if (Object.keys(pending_gets).length === 0) return;
	
		payload = payload || {};

		payload = Object.assign(payload, {
			e$		:	BUILDNUMBER		, // build number
		});

		if (intercession) payload = Object.assign(payload, intercession);

		payload.get = payload.get || {};

		for (var i in pending_gets) {
			var m		= pending_gets[i]	,
				name	= m[0]			,
				need	= m[1]			,
				value	= m[2]			;

			payload.get[name] = payload.get[name] || {};
			payload.get[name][need] = value;
		}
		
		$.log.w( module_title, 'Get', payload );
		$.fetch( address, 'json='+enc( JSON.stringify(payload) ), 'get', progressfn, 30*1000 )
		.then(function (res) {
			has_disconnected(res);
			update_get_internals();
			
			var response = {};
			try {
				response = JSON.parse( (res||{}).body );
			} catch (e) {
				response.get = 1;
				response.error = 1;
			}
			
			if (has_build_expired(response)) return;

			handle_response(response);
		});

		pending_gets = {};
	};
	var update_get_internals = function () { if (Network.set_internal) {
		var state = 'Done';
		var total = Object.keys(pending_gets).length;
		if (total) {
			state = total+' pending...';
		}
		Network.set_internal({ uid: 'get', name: 'Get', state });
	} };
	
	// TODO make a way to group unique but same requests into a single request and resolve all promises at once
	var unique_fetches = [];
	async function fulfill_fetch(arr, intercession) {
		var payload = {};

		payload = Object.assign(payload, {
			e$		:	BUILDNUMBER		, // build number
		});

		if (intercession) payload = Object.assign(payload, intercession);

		payload.get = payload.get || {};

		var name	= arr[0],
			need	= arr[1],
			value	= arr[2];

		payload.get[name] = payload.get[name] || {};
		payload.get[name][need] = value;
		
		var on_resolve, on_error;
		var promise = new Promise(function (resolve, error) {
			on_resolve = resolve;
			on_error = error;
		});
		
		if (debug_network) $.log.w( module_title, 'Fetch', payload.get );
		var res = await fetch(address, {
			method: 'POST',
			body: new URLSearchParams( { json: JSON.stringify(payload) } ),
		});

		var response = {};
		if (res.status != 200)
			response.err = 1;
		
		has_disconnected(response);

		try {
			var response = await res.json();
		} catch (e) {
			response.get = 1;
			response.error = e;
		}
		
		if (has_build_expired(response)) {
			on_error( new Error('build expired') );
			return;
		}

		if (response.error) {
			on_error( response.error );
		} else {
			var out;
			if (response.get && response.get[name] && response.get[name][need]) {
				out = response.get[name][need];
			}
			on_resolve( out );
		}

		return promise;
	}

	var intercession = {}; // intercession
	var intercession_process = function (callback, channel) {
		var j = 0, arr = Object.keys(intercession);
		if (arr.length === 0) {
			callback();
			return;
		}
		
		var q = $.queue(), objects = { intercession: {} };
		for (var i in intercession) {
			q.set(function (done) {
				var o = intercession[ arr[j] ];
				o[2](function (object) {
					if (object !== undefined) {
						objects.intercession[ o[0] ] = objects.intercession[ o[0] ] || {};
						objects.intercession[ o[0] ][ o[1] ] = object;
					}
					j++;
					done(q);
				}, channel);
			});
		}
		q.run(function () {
			callback && callback(objects);
		});
	};

	var synced = {};
	var sync_process = function (payload, intercession) {
		update_sync_internals();
		
		if (Object.keys(synced).length === 0) return;
	
		payload = payload || {};

		payload = Object.assign(payload, {
			e$			:	BUILDNUMBER				, // build number
		});

		if (intercession) payload = Object.assign(payload, intercession);

		payload.sync = payload.sync || {};

		for (var i in synced) {
			var m		= synced[i]		,
				name	= m[0]			,
				need	= m[1]			,
				value	= m[2]			;

			payload.sync[name] = payload.sync[name] || {};
			payload.sync[name][need] = value;
		}

		Network.is_syncing = 1;
		
		update_sync_internals();

		error_log(payload);
		$.fetch( address, 'json='+enc( JSON.stringify(payload) ), 'sync', progressfn, 30*1000 )
		.then(function (res) {
			Network.is_syncing = 0;
			has_disconnected(res);
			update_sync_internals();
			
			var response = {};
			try {
				response = JSON.parse( (res||{}).body );
			} catch (e) {
				response.sync = 1;
				response.error = 1;
			}
			
			if (has_build_expired(response)) return;

			handle_response(response);
		});

		synced = {};
	};
	var update_sync_internals = function () { if (Network.set_internal) {
		var state = 'Done';
		var total = Object.keys(synced).length;
		if (total) {
			if (Network.is_syncing) {
				state = 'Syncing... ';
			} else {
				state = '';
			}
			state += total+' modules have objects pending...';
		}
		Network.set_internal({ uid: 'sync', name: 'Sync', state });
	} };

	var upload = function (name, need, value, payload_raw, intercession) {
		var payload = {};
		payload = Object.assign(payload, {
			e$		:	BUILDNUMBER		, // build number
		});

		if (intercession) payload = Object.assign(payload, intercession);

		payload.upload = {};
		payload.upload[name] = {};
		payload.upload[name][need] = value;
		
		var fd = new FormData();
		fd.append('json', JSON.stringify(payload) );
		fd.append('upload', payload_raw);
		fetch(address, { method: 'post', body: fd }).then(function (res) {
			has_disconnected(res);
			
			res.json().then(function (response) {
				if (has_build_expired(response)) return;

				handle_response(response);
			});
		});
	};

	Network = network = {
		address: address,
		make_address: function (relative_path) {
			return location.protocol + '//' + location.host + '/' + relative_path;
		},
		unique_fetches: unique_fetches,
		channels: {
			get: {},
			sync: {},
			intercession: {},
			upload: {},
		},
		upload: function (name, need, value, payload) {
			if (!name) return;
			if (!payload) return;
			
			need	= need	||	'default'	; // default
			value	= value		||	0			;
			
			intercession_process(function (objects) {
				upload(name, need, value, payload, objects);
			}, 'upload');
		},
		broadcast: function () {
			if (cachedkey) {
				broadcast_start();
			} else {
				broadcast_finish();
			}
		},
		sync: function (name, need, value) {
			if (debug_network) $.log.w('Network.sync', name, need, value);
			
			// TODO test and explain this further, why track syncs?
			name	= name		||	'sync'		;
			need	= need		||	'default'	; // default
			value	= value		||	0			;
			
			synced[ name+'.'+need ] = [name, need, value];
			
			$.taxeer('networksync', function () {
				intercession_process(function (objects) {
					sync_process({}, objects);
				}, 'sync');
			}, 100);
		},
		get: function (name, need, value) { // { name, need, value }
			if (!name) return;
			if (arguments.length === 2) value = need, need = 0;
			
			need	= need		||	'default'	; // default
			value	= value		||	0			;

			if (debug_network) $.log.w('Network.get', name, need);
			
			pending_gets[ name+'.'+need ] = [name, need, value];
			
			update_get_internals();
			
			$.taxeer('networkfulfill', function () {
				intercession_process(function (objects) {
					fulfill_gets({}, objects);
				}, 'get');
			}, 100);
		},
		fetch: async function (name, need, value) { // returns unique promise
			if (!name) return;
			if (arguments.length === 2) value = need, need = 0;
			
			need	= need		||	'default'	; // default
			value	= value		||	0			;

			if (debug_network) $.log.w('Network.fetch', name, need);
			
			var on_resolve, on_error;

			intercession_process(async function (objects) {
				try {
					var result = await fulfill_fetch([name, need, value], objects);
					on_resolve(result);
				} catch (e) {
					on_error(e);
				}
			}, 'fetch');
			
			return new Promise(function (resolve, error) {
				on_resolve = resolve;
				on_error = error;
			});
		},
		response: {
			get: function (name, need, cb) {
				if (typeof need == 'function') cb = need, need = 0;
				need = need || 'default';
				network.channels.get[ name ] = network.channels.get[ name ] || {};
				network.channels.get[ name ][ need ] = cb;
			},
			sync: function (name, need, cb) {
				if (typeof need == 'function') cb = need, need = 0;
				need = need || 'default';
				network.channels.sync[ name ] = network.channels.sync[ name ] || {};
				network.channels.sync[ name ][ need ] = cb;
			},
			intercept: function (name, need, cb) {
				if (typeof need == 'function') cb = need, need = 0;
				need = need || 'default';
				network.channels.intercession[ name ] = network.channels.intercession[ name ] || {};
				network.channels.intercession[ name ][ need ] = cb;
			},
			upload: function (name, need, cb) {
				if (typeof need == 'function') cb = need, need = 0;
				need = need || 'default';
				network.channels.upload[ name ] = network.channels.upload[ name ] || {};
				network.channels.upload[ name ][ need ] = cb;
			},
		},
		intercept: function (name, need, cb) { // intercept
			if (typeof need == 'function') cb = need, need = 0;
			need	= need	||	'default'	; // default
			intercession[ name+'.'+need ] = [name, need, cb];
		},
	};
	
	Network.update_internals = function () {
		update_get_internals();
		update_sync_internals();
		update_broadcast_internals();
//		update_fetch_internals();
	};
	
	var until_first_sync_promises = [];
	Network.until_first_sync = async function (name, need) {
		if (debug_network) $.log.w( 'Network until first sync', name||'', need||'' );
		return new Promise(function (resolve) {
			var old_time = Preferences.get('@', 1);
			if (old_time === null)
				until_first_sync_promises.push( resolve );
			else
				resolve();
		});
	};
	
	/* TODO hook visibility to broadcast
	 * 
	 * hook sessionchange, start/stop broadcast
	 * 
	 * hook ready, if signedin, start broadcast
	 * 
	 * on hook [get|broadcast], run hook response { [get|broadcast]: bool, error: bool }
	 * 
	 * have network.server
	 * */
	Hooks.set('sessionchange', function (key) {
		cachedkey = key || 0;
		if (cachedkey) {
			network.broadcast();
			network.sync('network');
		}
	});
	Hooks.set('ready', function () {
		networkkeys = templates.keys(networkui);
		
		$.taxeer(module_name, function () {
			update_get_internals();
			update_sync_internals();
			update_broadcast_internals();
//			update_fetch_internals();
		});
		
		Network.intercept('network', 'time', function (finish, channel) {
			finish( Preferences.get('@', 1) );
		});
		Network.response.intercept('network', 'time', function (response) {
			if (response && cachedkey) {
				var old_time = Preferences.get('@', 1);
				if (old_time === null) {
					if (debug_network) $.log.w( 'Network first sync done' );
					$.taxeer('until_first_sync', function () {
						until_first_sync_promises.forEach(function (resolve) {
							resolve();
						});
						until_first_sync_promises = [];
					}, 1000);
				}
				Preferences.set('@', response);
			}
		});
		
		offlinetime = Preferences.get('@0', 1) || false; // offline since
		listener('online', function (e) {
			setnetwork(1);
		});
		listener('offline', function (e) {
			setnetwork();
		});

		if (sessions) {
			cachedkey = sessions.signedin() || 0;
			if (cachedkey) {
				network.broadcast();
				network.sync('network');
			}
		}
	});
})();
