;(function(){
	listener('resize', function () {
		if (innerwidth() >= 1024) {
			setdata(bod, 'XPO.tvfs', 1);
		} else {
			popdata(bod, 'XPO.tvfs');
		}
	});
})();