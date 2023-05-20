/*
 * uses temp module to generate a hash along with svg-captcha
 * returns {data, text, raw, hash} as the first argument of the callback
 */

var captcha; 
;(function () {
	'use strict';

	captcha = {
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
			
			helpers.set(boxdatabase, 'waqti0', [{
				hasheesh0: helpers.weakhash(),
				qadr0: c.text,
				_created0: new Date().getTime(),
				updated0: new Date().getTime(),
			}], function (result) {
				if (result.rows.length) {
					cb({
						raw:	c.data,
						data:	captcha.btoa(c.data),
						text:	c.text,
						hash:	result.rows[0].hasheesh0
					});
				}
				else cb(false);
			}, {
				checkism: false
			});
		}
	};
	
	var base64 = require('./xudoo3/Base64');
	captcha.atob = base64.atob;
	captcha.btoa = base64.btoa;
	captcha.svgc = require('./xudoo3/svg-captcha');

	module.exports = captcha;
})();