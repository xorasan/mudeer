//+ queuerequest cnt queue cur fetchcancel fetchchannels fetchprocess fetchtimeout
//+ uri payload callback progressfn _array

;(function (){
	// TODO: move queue requests here, only the XHR parts
	// qr is deprecated henceforth, use queue with fetch for the same effect
	// fetch by default uses XHRs but it can also use node requests
	$.queuerequest = function () {
		var queuerequest = {
			name: 1,
			active: false,
			cnt: 0,
			id: false,
			_array: [],
			// current request
			cur: false,
			queue: function (options) {
				this._array.unshift(options);
				this.id = this._array.length;

//				$.log.s( this.name, this.active );

				if (this.active === true)
					return this.cnt;
				else
					return this.process(this);
			},
			/* TODO
			 * when requests are queued too fast, it gets stuck on the last
			 * request and never processes it unless queue is called again
			 * or process is called manually
			 * 
			 * fix this asap, it's an ugly prob
			 * */
			process: function (carriedthis) {
				carriedthis = carriedthis || this;

//				$.log.s( 'fetch.process', carriedthis.name, carriedthis.active );

				if (carriedthis._array.length && !carriedthis.active) {
					carriedthis.id = carriedthis._array.length;
					carriedthis.active = true;
					var options = carriedthis._array.pop();
					{
						if (options.uri.match(/http.*\:\/\//) === null) {
							if (typeof nw === 'object') {
								options.uri = 'file://'+options.uri;
							}
						}
						
						var request;
//						var shorty = options.uri.replace(glatteis.sys.path, '');
						var shorty = options.uri;
						if (window.XMLHttpRequest) { 
							request = new XMLHttpRequest();
						}
						else if (typeof require === 'function') {
							request = require(options.uri);
							typeof options.callback === 'function' && options.callback(request);
							carriedthis.cnt++; carriedthis.process(carriedthis); carriedthis.active = false; return carriedthis.cnt;
						}
//						else { request = new ActiveXObject("Microsoft.XMLHTTP"); }
	
						request.timeout = carriedthis.fetchtimeout || $.fetchtimeout;
						carriedthis.cur = request;
	
						if (options.type == 'get') {
							request.open('GET', options.uri, true);
						} else {
							request.open('POST', options.uri, true);

							if (!options.headers)
								request.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset = UTF-8");
						}
						
						if (options.headers instanceof Object) {
							Object.keys(options.headers).forEach(function (key) {
								request.setRequestHeader(key, options.headers[key]);
							});
						}
						
						(request.upload ? request.upload : request).onprogress = function (event) {
							if (event.lengthComputable && typeof carriedthis.progressfn === 'function') {
								carriedthis.progressfn(event.loaded, event.total);
							} 
						};
						
						var onend = function (errtype) {
//							$.log.s( 'onend', carriedthis.name );
							typeof options.callback === 'function' && options.callback('', errtype || request.status);
							carriedthis.cnt++;
							carriedthis.process(carriedthis);
							carriedthis.active = false;
							return carriedthis.cnt;
						};
						
						request.onreadystatechange = function() {
							if (request.readyState == 4) {
								if (request.status === 200) {
	
									typeof options.callback === 'function' && options.callback(request.responseText);
									carriedthis.cnt++;
									carriedthis.process(carriedthis);
									carriedthis.active = false;
									return carriedthis.cnt;

								} else {
									onend(request.status);
								}
							}
						}
						
						// bigger the number, the more fatal the level
						request.onabort = function () {
							onend(-100);
						};
						request.ontimeout = function () {
							onend(-200);
						};
						request.onerror = function () {
							onend(-300);
						};

						request.send( options.type == 'get' ? null : options.payload );
					}
					return false;
				} else {
					carriedthis.active = false; carriedthis.cnt = 0;
					return false;
				}
			},
		};

		var newobject = Object.create(queuerequest);
		return newobject;
	};
	
	/*
	 * (s)cript location is required, (c)allback function is passed the
	 * responseText as the first argument
	 * (e)xecute the script before the callback function
	 * this is fetch 2.0 now
	 * it tries to implement a very basic form of ES6 fetch + then
	 * it uses a barebones promise without depending on JS base Promise or
	 * Response class
	 * 
	 * channels: strings that identify separate independent queues of requests
	 * for example in web apps, one for regular sync requests and another for
	 * listening for events from the server
	 */
	$.fetchtimeout	= 30 * 1000;
	$.fetchcancel	= function (channel) {
		channel = $.fetchchannels[channel || 1];
		if ( channel ) {
			channel._array = [];
			if (channel.cur)
				channel.cur.abort();

			channel.active = false;
			channel.cnt = 0;
			channel.cur = 0;
		}
	};
	$.fetchchannels	= {};
	$.fetchprocess = function (channel) {
		channel = channel || 1;
		
		if ( $.fetchchannels[channel] )
			$.fetchchannels[channel].process();
	};
	$.fetch = function (uri, data, channel, progressfn, fetchtimeout, headers) {
		channel = channel || 1;
		
		var response	= false,
			thencb		= false,
			thenfn		= function (callback) {
				if (response) {
					if (typeof callback === 'function') callback(response);
				} else {
					thencb = callback;
				}
			};
		
		if ( !$.fetchchannels[channel] ) {
			$.fetchchannels[channel] = /*Object.create(queuerequest)*/ $.queuerequest();
			$.fetchchannels[channel].name = channel;
			$.fetchchannels[channel].fetchtimeout = fetchtimeout || $.fetchtimeout;
		}
		
		if (typeof progressfn === 'function')
			$.fetchchannels[channel].progressfn = progressfn;
		
//		$.log.s( 'queue on ', channel, $.fetchchannels[channel].active );
		
		$.fetchchannels[channel].queue({
			uri:		uri, 
			payload:	(data || null), 
			headers:	headers || 0,
			// todo better way to specify type and move body to uri?-
			// these improvements should be intro'd in $.axav!!
			type:		(data ? 'post' : 'get'),
			callback:	function (body, err) {
				try {
					if (typeof thencb === 'function') {
						thencb({
							body: body,
							err: err
						});
					}
				} catch (e) {
					glatteis.log.e(e);
				}
			}
		});
		
		return {
			then: thenfn
		};
	};
})();
