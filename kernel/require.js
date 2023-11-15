;(function (){
	/*	queue requests
	 *	first one has to timeout for the next one to work
	 *	TODO: implement duktape xhrs
	 */

	var qr = {
		atv: false,
		cnt: 0,
		id: false,
		qA: [],
		queue: function (oP) {
			this.qA.unshift(oP);
			this.id = this.qA.length;
			if (this.atv == true) { return this.cnt; }
			return this.process();
		},
		process: function (a) {
			if (this.qA.length) {
				this.id = this.qA.length;
				this.atv = true;
				var oP = this.qA.pop();
				{
					/*
					 * TODO
					 * this solves the local includes prob on linux
					 * test on windows and figure out a cross platform way of doing
					 * this
					*/
					if (oP.s.match(/http.*\:\/\//) === null) {
						if (typeof nw === 'object') {
							oP.s = 'file://'+oP.s;
						}
					}
					
					var rq;
//					var shorty = oP.s.replace(glatteis.sys.path, '');
					var shorty = oP.s;
					if (window.XMLHttpRequest) { 
						rq = new XMLHttpRequest();
					}
					/* 
					 * TODO
					 * replace "require" with http.request, code in a/server.js
					*/
					else if (typeof require === 'function') {
						rq = require(oP.s);
						if (typeof oP.c === "function") {
							oP.c(rq);
						}
						qr.cnt++; qr.process(); qr.atv = false; return qr.cnt;
					}
					else { rq = new ActiveXObject("Microsoft.XMLHTTP"); }

					rq.timeout = 10*1000;

					if (oP.t == 'get') {
						if (glatteis.sys.dbg === true) { glatteis.log.s('get', shorty); }
						rq.open("GET", oP.s, true);
						rq.send(null);
					} else {
						if (glatteis.sys.dbg === true) { glatteis.log.s('post', shorty); }
						rq.open("POST", oP.s, true);
						rq.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset = UTF-8");
						rq.send(oP.v);
					}
					rq.onreadystatechange = function() {
						if (rq.readyState == 4 && rq.status !== 404) {
							if (typeof oP.c === "function") {
								oP.c(rq.responseText);
							}
							qr.cnt++; qr.process(); qr.atv = false; return qr.cnt;
						} else if (rq.readyState == 4 && rq.status !== 200) {
							qr.cnt++; qr.process(); qr.atv = false; return qr.cnt;
						}
					}
				}
				return false;
			} else {
				this.atv = false; this.cnt = 0;
				return false;
			}
		}
	};

	/*
	 * if no callback is given, uses synchronous node require
	 * 
	 * 
	 * */
	$.require = function (path, callback) {
		if (typeof callback === 'function') {
			qr.queue({
				s: path,
				v: null,
				t:'get',
				c: function (rT) {
					try {
						if (typeof document.createElement === 'function') {
							var e = document.createElement('script');
							e.setAttribute('type', 'text/javascript');
							e.innerHTML = rT;
							document.head.appendChild(e);
							document.head.removeChild(e);
						} else {
							module.exports = rT;
						}
						/*
						 * get the exported module and reset exports
						 * pass the module to user callback
						 */
						var exports = module.exports;
						module.exports = {};
						callback( exports );
					} catch (e) {
						glatteis.log.e(e);
					}
				}
			});
		} else {
			var temp = $;
			var mod = require(path);
			global.$ = temp;
			return mod;
		}
	};
})();
