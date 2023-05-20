//+ jaame3 ittasal arsal abrad
var activity;
;(function(){
	activity = {
		jaame3: function (name, type, key, value) { // generic
			if ('MozActivity' in window) {
				var data = {
					type: type,
				};
				data[key] = value;
				
				new MozActivity({
					name: name,
					data: data,
				});
			}
		},
		ittasal: function (num) { // call/telephone (verb)
			if (num) activity.jaame3('dial', 'webtelephony/number', 'number', num);
		},
		arsal: function (num) { // send (verb) risaalah (noun) message
			if (num) activity.jaame3('new', 'websms/sms', 'number', num);
		},
		abrad: function (address) { // (e)mail (verb) breed (noun)
			if (address) activity.jaame3('new', 'mail', 'url', 'mailto:'+address);
		},
	};
})();