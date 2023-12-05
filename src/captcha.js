/*
 * uses temp module to generate a hash along with svg-captcha
 * returns {data, text, raw, hash} as the first argument of the callback
 */

var Captcha, captcha; 
;(function () {
	'use strict';

	Captcha = captcha = {
		svgc: false,
		btoa: false,
		atob: false,
		get: function (boxdatabase, cb) {
			if (typeof cb !== 'function') return;
			
			// replace color with accent
			var c = captcha.svgc.createMathExpr({
				color:		1,
				noise:		5,
				width:		220,
				height:		120,
				fontSize:	128,
			});
				
			MongoDB.set(boxdatabase, 'temporary', [{
				hash: Sessions.weakhash(),
				value: c.text,
				updated: new Date().getTime(),
			}], function (result) {
				if (result.rows.length) {
					cb({
						raw:	c.data,
						data:	captcha.btoa(c.data),
						text:	c.text,
						hash:	result.rows[0].hash
					});
				}
				else cb(false);
			});
		}
	};
	
	var base64 = require('./deps/Base64');
	captcha.atob = base64.atob;
	captcha.btoa = base64.btoa;
	captcha.svgc = require('./deps/svg-captcha');

	module.exports = captcha;
})();