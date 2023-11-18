/*
 * it has 3 qanawaat for comm with server
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
//+ broadcast get sync response channels intercession upload
var Network, network, sessions = sessions || 0;
;(function(){
	'use strict';
	var address = 'http://localhost:'+Config.port+'/', buildexpired = false, offlinetime,
		networkkeys;
	
	var error_log = function (v) {
//		$.log( v );
	};
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
				Hooks.run('XPO.connection', true); // connection
				// cancel reconnection attempts
				$.taxeercancel('XPO.networkconnection');
			}
			setnotifybar();
		} else {
			// update time if it hasn't been marked offline yet
			if (offlinetime === false) {
				offlinetime = new Date().getTime();
				preferences.set('@0', offlinetime);
				Hooks.run('XPO.connection', offlinetime); // connection
				// handles reconnection attempts
				$.taxeer('XPO.networkconnection', function () {
					if (sessions)
					network.get({
						i: 'XPO.network',
						h: 'XPO.connection',
					});
				}, 15*1000);
			}
			
			// notify anyway
			setnotifybar( 'XPO.offlinesince' , offlinetime || '');
		}

	};
	var setnotifybar = function (v, t) {
		if (v) {
			$.taxeer('XPO.setnotifybar', function () {
				setdata(networkkeys.topic, 'XPO.i18n', v);
				setdata(networkkeys.time, 'XPO.time', t);
				time(XPO.networkui);
				xlate.update(XPO.networkui);
			}, t);
			XPO.networkui.hidden = 0;
		} else {
			XPO.networkui.hidden = 1;
		}
	};
	var sizeunits = function (num) {
		if (typeof num === 'number') {
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
				webapp.dimmer(LAYERTOPMOST, xlate('XPO.appneedsreload'));
			});
			broadcast_finish();
			$.fetchcancel( 'XPO.get' );
			$.fetchcancel( 'XPO.sync' );
		}
	};
	var handle_response = function (response) {
		if (response.upload)
		for (var name in response.upload) {
			if (network.channels.upload[name]) {
				var needs = response.upload[name];
				for (var need in needs) {
					if (typeof network.channels.upload[name][need] == 'function') {
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
					if (typeof network.channels.intercession[name][need] == 'function') {
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
			Hooks.run('XPO.responseget', response.sync);
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
			Hooks.run('XPO.responsesync', response.sync);
		}
	};

	var cachedkey, broadcast_state = 0, broadcast_delay = 500;
	var broadcast_process = function (payload, intercession) {
		if (!cachedkey || !broadcast_state) return;
		
		if ($.fetchchannels.XPO.broadcast
		&&	$.fetchchannels.XPO.broadcast.active) return;

		payload = payload || {};

		payload = Object.assign(payload, {
			XPO.broadcast	:	1				, // synced before
			e$			:	BUILDNUMBER		, // build number
		});

		if (intercession) payload = Object.assign(payload, intercession);

		error_log(payload);
		$.fetch( address, 'XPO.json='+enc( JSON.stringify(payload) ), 'XPO.broadcast', progressfn, 3*60*1000 )
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
			
			$.taxeer('XPO.networkbroadcast', function () {
				intercession_process(function (objects) {
					broadcast_process({}, objects);
				}, 'XPO.broadcast');
			}, broadcast_delay);
		});
	};
	var broadcast_start = function () {
		$.taxeer('XPO.broadcast_start', function () {
			broadcast_state = 1;
			intercession_process(function (objects) {
				broadcast_process({}, objects);
			}, 'XPO.broadcast');
		}, 1000);
	};
	var broadcast_finish = function () {
		broadcast_state = 0;
		$.fetchcancel('XPO.broadcast');
	};

	var pending = {}; // pending requests
	var fulfill = function (payload, intercession) { // flush pending get requests
		if (Object.keys(pending).length === 0) return;
	
		payload = payload || {};

		payload = Object.assign(payload, {
			e$		:	BUILDNUMBER		, // build number
		});

		if (intercession) payload = Object.assign(payload, intercession);

		payload.XPO.get = payload.XPO.get || {};

		for (var i in pending) {
			var m		= pending[i]	,
				name	= m[0]			,
				need	= m[1]			,
				value	= m[2]			;

			payload.XPO.get[name] = payload.XPO.get[name] || {};
			payload.XPO.get[name][need] = value;
		}
		
		error_log(payload);
		$.fetch( address, 'XPO.json='+enc( JSON.stringify(payload) ), 'XPO.get', progressfn, 30*1000 )
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

		pending = {};
	};

	var intercession = {}; // intercession
	var intercession_process = function (callback, channel) {
		var j = 0, arr = Object.keys(intercession);
		if (arr.length === 0) {
			callback();
			return;
		}
		
		var q = $.queue(), objects = { XPO.intercession: {} };
		for (var i in intercession) {
			q.set(function (done) {
				var o = intercession[ arr[j] ];
				o[2](function (object) {
					if (object !== undefined) {
						objects.XPO.intercession[ o[0] ] = objects.XPO.intercession[ o[0] ] || {};
						objects.XPO.intercession[ o[0] ][ o[1] ] = object;
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

		payload.XPO.sync = payload.XPO.sync || {};

		for (var i in synced) {
			var m		= synced[i]		,
				name	= m[0]			,
				need	= m[1]			,
				value	= m[2]			;

			payload.XPO.sync[name] = payload.XPO.sync[name] || {};
			payload.XPO.sync[name][need] = value;
		}

		error_log(payload);
		$.fetch( address, 'XPO.json='+enc( JSON.stringify(payload) ), 'XPO.sync', progressfn, 30*1000 )
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
		fd.append('XPO.json', JSON.stringify(payload) );
		fd.append('XPO.upload', payload_raw);
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
			
			need	= need	||	'XPO.default'	; // default
			value	= value		||	0			;
			
			intercession_process(function (objects) {
				upload(name, need, value, payload, objects);
			}, 'XPO.upload');
		},
		broadcast: function () {
			if (cachedkey) {
				broadcast_start();
			} else {
				broadcast_finish();
			}
		},
		sync: function (name, need, value) {
			if (!name) return;
			
			need	= need	||	'XPO.default'	; // default
			value	= value		||	0			;
			
			synced[ name+'.'+need ] = [name, need, value];
			
			$.taxeer('XPO.networksync', function () {
				intercession_process(function (objects) {
					sync_process({}, objects);
				}, 'XPO.sync');
			}, 100);
		},
		get: function (name, need, value) { // { name, need, value }
			if (!name) return;
			if (arguments.length === 2) value = need, need = 0;
			
			need	= need	||	'XPO.default'	; // default
			value	= value		||	0			;
			
			pending[ name+'.'+need ] = [name, need, value];
			
			$.taxeer('XPO.networkfulfill', function () {
				intercession_process(function (objects) {
					fulfill({}, objects);
				}, 'XPO.get');
			}, 100);
		},
		response: {
			get: function (name, need, cb) {
				if (typeof need == 'function') cb = need, need = 0;
				need = need || 'XPO.default';
				network.channels.get[ name ] = network.channels.get[ name ] || {};
				network.channels.get[ name ][ need ] = cb;
			},
			sync: function (name, need, cb) {
				if (typeof need == 'function') cb = need, need = 0;
				need = need || 'XPO.default';
				network.channels.sync[ name ] = network.channels.sync[ name ] || {};
				network.channels.sync[ name ][ need ] = cb;
			},
			intercept: function (name, need, cb) {
				if (typeof need == 'function') cb = need, need = 0;
				need = need || 'XPO.default';
				network.channels.intercession[ name ] = network.channels.intercession[ name ] || {};
				network.channels.intercession[ name ][ need ] = cb;
			},
			upload: function (name, need, cb) {
				if (typeof need == 'function') cb = need, need = 0;
				need = need || 'XPO.default';
				network.channels.upload[ name ] = network.channels.upload[ name ] || {};
				network.channels.upload[ name ][ need ] = cb;
			},
		},
		intercept: function (name, need, cb) { // intercept
			if (typeof need == 'function') cb = need, need = 0;
			need	= need	||	'XPO.default'	; // default
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
	Hooks.set('XPO.sessionchange', function (key) {
		cachedkey = key || 0;
		if (cachedkey) {
			network.broadcast();
			network.sync();
		}
	});
	Hooks.set('XPO.ready', function () {
		networkkeys = templates.keys(XPO.networkui);
		
		network.intercept('XPO.network', 'XPO.time', function (intahaa, channel) {
			intahaa( preferences.get('@') );
		});
		network.response.intercept('XPO.network', 'XPO.time', function (response) {
			if (response && cachedkey) preferences.set('@', response);
		});
		
		offlinetime = preferences.get('@0', 1) || false;
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
				network.sync();
			}
		}
	});
})();
