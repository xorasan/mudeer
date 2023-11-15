$.log = function () {
	console.log.apply(console, arguments);
};

;(function(){
	var proto = {
		s: function () {
			var a = '', str = '';
			for (var b in arguments) {
				if (b > 0) {
					a = a+', ';
				}
				a = a+'arguments['+b+']';
				str += ' '+ arguments[b];
			}
			eval('console.log('+a+');');
		},
		e: function () {
			var a = '', str = '';
			for (var b in arguments) {
				if (b > 0) {
					a = a+', ';
				}
				a = a+'arguments['+b+']';
				str += ' '+ arguments[b];
			}
			eval('console.error('+a+');');
		},
		i: function () {
			var a = '';
			for (var b in arguments) {
				if (b > 0) {
					a = a+', ';
				}
				a = a+'arguments['+b+']';
			}
			eval('console.info('+a+');');
		}
	};
	$.log = Object.assign($.log, proto);
})();