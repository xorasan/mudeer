//+ izhar
var hisaabaat;
;(function(){
	'use strict';
	
	hisaabaat = {
		bahac: function (str, callback) {
			str = tolower(str);
			var arr = [];
			qareeb.axavnataaij().each(function (o) {
				if ( tolower(o.displayname).includes(str)
				||	 tolower(o.username).includes(str) ) {
					arr.push(o);
				}
			});
			isfun(callback) && callback(arr);
		},
		axav: function (uids, callback) {
			var arr = [];
			if (isarr(uids) && uids.length)
			qareeb.axavnataaij().each(function (o) {
				if (uids.includes(o.uid))
					arr.push(o);
			});
			isfun(callback) && callback(arr);
		},
	};
	
})();
