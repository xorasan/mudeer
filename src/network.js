/*
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
 * */
var Network, network, sessions = sessions || 0;
;(function(){
	'use strict';
	var 
//		address = 'http://localhost:'+Config.port+'/',
		address = location.protocol + '//' + location.host + location.pathname,
		buildexpired = false, offlinetime,
		networkkeys, debug_network = 1;
	
	var error_log = function (v) { $.log( v ); };
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
	var handle_response = function (response) {
		if (response.upload)
		for (var name in response.upload) {
			if (network.channels.upload[name]) {
				var needs = response.upload[name];
				for (var need in needs) {
					if (isfun( network.channels.upload[name][need] )) {
						network.channels.upload[name][need](
							needs[need]
						);
					}
				}
			}
		}

		if (response.intercession)
		for (var name in response.intercession) {
			if (network.channels.intercession[name]) {
				var needs = response.intercession[name];
				for (var need in needs) {
					if (isfun( network.channels.intercession[name][need] )) {
						network.channels.intercession[name][need](
							needs[need]
						);
					}
				}
			}
		}

		if (response.get) {
			for (var name in response.get) {
				if (network.channels.get[name]) {
					var needs = response.get[name];
					for (var need in needs) {
						if (typeof network.channels.get[name][need] == 'function') {
							network.channels.get[name][need](
								needs[need]
							);
						}
					}
				}
			}
			Hooks.run('responseget', response.sync); // TODO deprecate
			Hooks.run('response-get', response.sync);
		}

		if (response.sync) {
			for (var name in response.sync) {
				if (network.channels.sync[name]) {
					var needs = response.sync[name];
					for (var need in needs) {
						if (typeof network.channels.sync[name][need] == 'function') {
							network.channels.sync[name][need](
								needs[need]
							);
						}
					}
				}
			}
			Hooks.run('responsesync', response.sync); // TODO deprecate
			Hooks.run('response-sync', response.sync);
		}
	};

	var cachedkey, broadcast_state = 0, broadcast_delay = 500;
	var broadcast_process = function (payload, intercession) {
		if (!cachedkey || !broadcast_state) return;
		
		if ($.fetchchannels.broadcast
		&&	$.fetchchannels.broadcast.active) return;

		payload = payload || {};

		payload = Object.assign(payload, {
			broadcast	:	1				, // synced before
			e$				:	BUILDNUMBER	, // build number
		});

		if (intercession) payload = Object.assign(payload, intercession);

		error_log(payload);
		$.fetch( address, 'json='+enc( JSON.stringify(payload) ), 'broadcast', progressfn, 3*60*1000 )
		.then(function (res) {
			if (res.err) {
				// don't mark offline, this channel is designed to timeout! :)
				broadcast_delay = 4 * 15 * 1000; // 60s
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
			intercession_process(function (objects) {
				broadcast_process({}, objects);
			}, 'broadcast');
		}, 1000);
	};
	var broadcast_finish = function () {
		broadcast_state = 0;
		$.fetchcancel('broadcast');
	};

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
		
		error_log(payload);
		$.fetch( address, 'json='+enc( JSON.stringify(payload) ), 'get', progressfn, 30*1000 )
		.then(function (res) {
			has_disconnected(res);
			
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

		error_log(payload);
		$.fetch( address, 'json='+enc( JSON.stringify(payload) ), 'sync', progressfn, 30*1000 )
		.then(function (res) {
			has_disconnected(res);
			
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
			
			pending_gets[ name+'.'+need ] = [name, need, value];
			
			$.taxeer('networkfulfill', function () {
				intercession_process(function (objects) {
					fulfill_gets({}, objects);
				}, 'get');
			}, 100);
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
		
		network.intercept('network', 'time', function (finish, channel) {
			finish( preferences.get('@') );
		});
		network.response.intercept('network', 'time', function (response) {
			if (response && cachedkey) preferences.set('@', response);
		});
		
		offlinetime = preferences.get('@0', 1) || false; // offline since
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
