;(function (){
	var DEG2RAD = Math.PI/180,
		RAD2DEG = 180/Math.PI;
	$.convert = {
		toRad: function (v) {
			return v*DEG2RAD;
		},
		toDeg: function (v) {
			return v*RAD2DEG;
		}
	};
	$.random = function (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
})();
